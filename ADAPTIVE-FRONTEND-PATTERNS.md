# Adaptive Frontend Patterns for Multi-Vertical Search Dashboards

**Purpose**: Concrete UI/UX patterns for a universal shopping search engine  
**Date**: 2026-07-11  
**Context**: Single search bar + filter panel + listing grid across CNC machines (80+ specs), endmills (20+ specs), and used cars (30+ specs)

---

## 1. Dynamic Filter UI Generation

### Pattern: Schema-Driven Filter Panel

The core insight from studying Google Shopping, Zillow, and Airbnb: **filters are not hardcoded — they're derived from a data schema per vertical.**

### How Major Products Do It

**Google Shopping**: When you search "coffee maker", filters become: Brand (checkboxes), Price (range), Customer Rating (star filter), Brew Type (radio). Search "laptop" and filters become: Screen Size (range), RAM (dropdown), CPU Brand (checkboxes), GPU (checkboxes). The same sidebar, different content — all driven by product category metadata.

**Zillow**: The "More" button opens a full filter panel. Property type (radio), Price (dual slider), Beds/Baths (stepper), Square feet (range), Year built (range), Lot size (range), Parking (checkbox), Amenities (checkbox grid). When switching from "For Sale" to "For Rent", the filter set changes: no "Year built" but adds "Lease term" and "Pet policy".

**Airbnb** (observed live): Filter panel is a full-screen overlay with categorized sections:
- "Recommended for you" — preset toggle buttons (Free parking, Kitchen, Pool)
- "Type of place" — radio group (Any type / Room / Entire home)
- "Price range" — dual-thumb slider with histogram behind it
- "Rooms and beds" — stepper controls (increment/decrement buttons)
- "Amenities" — checkbox grid with "Show more" expansion
- "Booking options" — toggle buttons
- Expandable accordion sections for less-used filters

### Recommended Component Architecture

```
┌─────────────────────────────────────────────┐
│ FILTER PANEL (sidebar or overlay)           │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─ VERTICAL SELECTOR (tabs/pills) ───────┐ │
│  │ [All] [CNC Machines] [Endmills] [Cars] │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  ┌─ QUICK FILTERS (top 4-5 per vertical) ─┐ │
│  │ Toggle buttons for most-used filters    │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  ┌─ PRICE RANGE ──────────────────────────┐  │
│  │ Dual-thumb slider + histogram          │  │
│  └─────────────────────────────────────────┘ │
│                                             │
│  ┌─ CATEGORY-SPECIFIC FILTERS ────────────┐  │
│  │ Rendered from vertical schema           │  │
│  │ Each filter: { type, options, config }  │  │
│  └─────────────────────────────────────────┘ │
│                                             │
│  ┌─ EXPANDABLE SECTIONS ──────────────────┐  │
│  │ Accordion for advanced/rare filters     │  │
│  └─────────────────────────────────────────┘ │
│                                             │
│  ┌─ ACTIVE FILTERS BAR ───────────────────┐  │
│  │ Chips showing applied filters + Clear   │  │
│  └─────────────────────────────────────────┘ │
│                                             │
│  [Clear All]              [Show N results]  │
└─────────────────────────────────────────────┘
```

### Filter Schema Definition

```javascript
// Each vertical defines its filters as data, not code
const verticalSchemas = {
  cnc_machines: {
    quickFilters: [
      { id: 'machine_type', label: 'Machine Type', type: 'chips',
        options: ['VMC', 'HMC', 'Lathe', 'Turn-Mill', '5-Axis'] },
      { id: 'price', label: 'Price', type: 'range', min: 0, max: 500000, step: 5000 },
    ],
    filters: [
      { id: 'travel_x', label: 'X-Axis Travel', type: 'range',
        min: 0, max: 6000, unit: 'mm', group: 'Travel' },
      { id: 'travel_y', label: 'Y-Axis Travel', type: 'range',
        min: 0, max: 4000, unit: 'mm', group: 'Travel' },
      { id: 'travel_z', label: 'Z-Axis Travel', type: 'range',
        min: 0, max: 3000, unit: 'mm', group: 'Travel' },
      { id: 'spindle_speed', label: 'Max Spindle RPM', type: 'range',
        min: 0, max: 40000, unit: 'rpm', group: 'Spindle' },
      { id: 'spindle_power', label: 'Spindle Power', type: 'range',
        min: 0, max: 150, unit: 'kW', group: 'Spindle' },
      { id: 'table_size', label: 'Table Size', type: 'text',
        placeholder: 'e.g. 1200x600', group: 'Work Area' },
      { id: 'control', label: 'Control System', type: 'checkbox',
        options: ['Fanuc', 'Siemens', 'Heidenhain', 'Mazak', 'Haas'],
        group: 'Control' },
      { id: 'condition', label: 'Condition', type: 'checkbox',
        options: ['New', 'Used', 'Rebuilt', 'Refurbished'] },
      { id: 'manufacturer', label: 'Manufacturer', type: 'checkbox',
        options: ['DMG Mori', 'Mazak', 'Haas', 'Okuma', 'Makino', 'Doosan'],
        searchable: true, group: 'Brand' },
    ],
    // How many columns to show in table view by default
    defaultColumns: ['name', 'manufacturer', 'model', 'price', 'machine_type',
                     'travel_x', 'travel_y', 'travel_z', 'spindle_speed', 'condition'],
  },

  endmills: {
    quickFilters: [
      { id: 'tool_type', label: 'Type', type: 'chips',
        options: ['Flat End', 'Ball Nose', 'Bull Nose', 'Corner Radius', 'Chamfer'] },
      { id: 'diameter', label: 'Diameter', type: 'range',
        min: 0.1, max: 50, unit: 'mm', step: 0.1 },
    ],
    filters: [
      { id: 'flutes', label: 'Number of Flutes', type: 'checkbox',
        options: ['1', '2', '3', '4', '5', '6', '8'], group: 'Geometry' },
      { id: 'coating', label: 'Coating', type: 'checkbox',
        options: ['Uncoated', 'TiN', 'TiAlN', 'AlTiN', 'DLC', 'ZrN', 'TiCN'],
        group: 'Material' },
      { id: 'material', label: 'Substrate', type: 'checkbox',
        options: ['Carbide', 'HSS', 'Cobalt', 'Ceramic', 'PCD'],
        group: 'Material' },
      { id: 'cutting_length', label: 'LOC (mm)', type: 'range',
        min: 0, max: 300, unit: 'mm', group: 'Geometry' },
      { id: 'oal', label: 'OAL (mm)', type: 'range',
        min: 0, max: 500, unit: 'mm', group: 'Geometry' },
      { id: 'shank', label: 'Shank Diameter', type: 'range',
        min: 0.1, max: 50, unit: 'mm', group: 'Geometry' },
      { id: 'application', label: 'Application', type: 'checkbox',
        options: ['Roughing', 'Finishing', 'Plunging', 'Slotting', 'Engraving'],
        group: 'Use' },
      { id: 'brand', label: 'Brand', type: 'checkbox',
        options: ['OSG', 'Sandvik', 'Kennametal', 'Helical', 'Walter', 'IMCO'],
        searchable: true },
      { id: 'condition', label: 'Condition', type: 'checkbox',
        options: ['New', 'Used'] },
    ],
    defaultColumns: ['name', 'brand', 'diameter', 'flutes', 'coating',
                     'tool_type', 'price', 'condition'],
  },

  used_cars: {
    quickFilters: [
      { id: 'make', label: 'Make', type: 'chips',
        options: ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes'] },
      { id: 'price', label: 'Price', type: 'range',
        min: 0, max: 200000, step: 500 },
    ],
    filters: [
      { id: 'year', label: 'Year', type: 'range',
        min: 1990, max: 2026, step: 1 },
      { id: 'mileage', label: 'Mileage', type: 'range',
        min: 0, max: 300000, step: 5000, unit: 'mi' },
      { id: 'body_type', label: 'Body Type', type: 'checkbox',
        options: ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Van'],
        group: 'Type' },
      { id: 'fuel_type', label: 'Fuel Type', type: 'checkbox',
        options: ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'PHEV'],
        group: 'Powertrain' },
      { id: 'transmission', label: 'Transmission', type: 'checkbox',
        options: ['Automatic', 'Manual', 'CVT'], group: 'Powertrain' },
      { id: 'drivetrain', label: 'Drivetrain', type: 'checkbox',
        options: ['FWD', 'RWD', 'AWD', '4WD'], group: 'Powertrain' },
      { id: 'accident_history', label: 'Accident History', type: 'radio',
        options: ['Any', 'No Accidents', 'Minor', 'Reported'],
        group: 'History' },
      { id: 'title_status', label: 'Title Status', type: 'checkbox',
        options: ['Clean', 'Salvage', 'Rebuilt', 'Lemon'],
        group: 'History' },
      { id: 'engine', label: 'Engine', type: 'text',
        placeholder: 'e.g. V6, 2.0T', group: 'Specs' },
      { id: 'mpg', label: 'Combined MPG', type: 'range',
        min: 0, max: 100, step: 1, group: 'Specs' },
      { id: 'features', label: 'Features', type: 'checkbox',
        options: ['Sunroof', 'Leather', 'Nav', 'Backup Camera', 'Blind Spot',
                  'Heated Seats', 'Apple CarPlay', 'Android Auto'],
        group: 'Features' },
    ],
    defaultColumns: ['name', 'make', 'model', 'year', 'price', 'mileage',
                     'body_type', 'fuel_type', 'accident_history'],
  },
};
```

### Filter Group Rendering Component

```css
/* ═══════════════════════════════════════════════════════════════
   FILTER PANEL — Built on Reese Design System tokens
   ═══════════════════════════════════════════════════════════════ */

.filter-panel {
  width: 320px;
  background: var(--canvas-base);
  border-right: 1px solid var(--border-default);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.filter-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-3) var(--sp-4);
  border-bottom: 1px solid var(--border-subtle);
  position: sticky;
  top: 0;
  background: var(--canvas-base);
  z-index: 2;
}

.filter-panel-title {
  font-size: var(--text-md);
  font-weight: var(--w-semibold);
  color: var(--ink-primary);
}

.filter-panel-count {
  font-size: var(--text-sm);
  color: var(--ink-muted);
  font-family: var(--font-mono);
}

/* Filter group (e.g., "Travel", "Spindle", "Geometry") */
.filter-group {
  padding: var(--sp-3) var(--sp-4);
  border-bottom: 1px solid var(--border-subtle);
}

.filter-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--sp-2);
  cursor: pointer;
}

.filter-group-label {
  font-size: var(--text-sm);
  font-weight: var(--w-semibold);
  color: var(--ink-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-group-toggle {
  font-size: 10px;
  color: var(--ink-muted);
  transition: transform 150ms var(--ease-out);
}

.filter-group.collapsed .filter-group-toggle {
  transform: rotate(-90deg);
}

.filter-group.collapsed .filter-group-body {
  display: none;
}

.filter-group-body {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

/* Quick filter chips (top of panel) */
.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: var(--sp-3) var(--sp-4);
  border-bottom: 1px solid var(--border-subtle);
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: var(--h-sm);
  padding: 0 var(--sp-2);
  background: var(--canvas-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--r-full);
  font-size: var(--text-sm);
  font-weight: var(--w-medium);
  color: var(--ink-secondary);
  cursor: pointer;
  transition: all 80ms var(--ease-out);
  white-space: nowrap;
}

.filter-chip:hover {
  border-color: var(--border-strong);
  color: var(--ink-primary);
  background: var(--canvas-raised);
}

.filter-chip.active {
  background: var(--code-action-dim);
  border-color: var(--code-action);
  color: var(--code-action);
}

/* Filter checkbox items */
.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  cursor: pointer;
  font-size: var(--text-base);
  color: var(--ink-secondary);
  transition: color 80ms;
}

.filter-item:hover {
  color: var(--ink-primary);
}

.filter-item .checkbox {
  flex-shrink: 0;
}

.filter-item-count {
  margin-left: auto;
  font-size: var(--text-xs);
  color: var(--ink-ghost);
  font-family: var(--font-mono);
}

/* Range filter with dual thumbs */
.filter-range {
  padding: var(--sp-2) 0;
}

.filter-range-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.filter-range-value {
  font-size: var(--text-sm);
  font-family: var(--font-mono);
  color: var(--code-action);
  font-weight: var(--w-medium);
}

.filter-range-track {
  position: relative;
  height: 4px;
  background: var(--canvas-elevated);
  border-radius: 2px;
  margin: var(--sp-2) 0;
}

.filter-range-fill {
  position: absolute;
  height: 100%;
  background: var(--code-action);
  border-radius: 2px;
  opacity: 0.6;
}

.filter-range-thumb {
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  background: var(--code-action);
  border: 2px solid var(--canvas-surface);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  transition: box-shadow 80ms;
}

.filter-range-thumb:hover {
  box-shadow: 0 0 0 4px var(--code-action-dim), 0 1px 4px rgba(0,0,0,0.3);
}

.filter-range-thumb:active {
  cursor: grabbing;
}

/* Stepper filter (for discrete values like bedrooms) */
.filter-stepper {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid var(--border-default);
  border-radius: var(--r-sm);
  overflow: hidden;
}

.filter-stepper-label {
  flex: 1;
  padding: 0 var(--sp-2);
  font-size: var(--text-sm);
  color: var(--ink-secondary);
}

.filter-stepper-value {
  min-width: 48px;
  text-align: center;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--ink-primary);
}

/* Active filter bar (chips at bottom or top) */
.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: var(--sp-2) var(--sp-4);
  border-top: 1px solid var(--border-subtle);
  background: var(--canvas-base);
}

.active-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: var(--h-xs);
  padding: 0 6px;
  background: var(--code-action-dim);
  border: 1px solid var(--code-action-mid);
  border-radius: var(--r-full);
  font-size: 10px;
  font-weight: var(--w-semibold);
  color: var(--code-action);
}

.active-filter-remove {
  cursor: pointer;
  opacity: 0.6;
  font-size: 10px;
}

.active-filter-remove:hover {
  opacity: 1;
}

/* Filter panel footer */
.filter-panel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--sp-3) var(--sp-4);
  border-top: 1px solid var(--border-default);
  background: var(--canvas-base);
  position: sticky;
  bottom: 0;
}

/* Search within filter (for long option lists) */
.filter-search {
  position: relative;
}

.filter-search-input {
  width: 100%;
  height: var(--h-sm);
  padding: 0 var(--sp-2) 0 24px;
  background: var(--canvas-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--r-xs);
  font-size: var(--text-sm);
  color: var(--ink-primary);
}

.filter-search-icon {
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: var(--ink-muted);
}

/* "Show more" expansion for long lists */
.filter-show-more {
  font-size: var(--text-sm);
  color: var(--code-action);
  cursor: pointer;
  padding: 4px 0;
  font-weight: var(--w-medium);
}

.filter-show-more:hover {
  text-decoration: underline;
}

/* Filter panel responsive: mobile overlay */
@media (max-width: 768px) {
  .filter-panel {
    position: fixed;
    inset: 0;
    width: 100%;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 200ms var(--ease-out);
  }

  .filter-panel.open {
    transform: translateX(0);
  }

  .filter-panel-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 99;
    display: none;
  }

  .filter-panel.open + .filter-panel-overlay {
    display: block;
  }
}
```

### Vertical-Specific Filter Presets

```css
/* ═══════════════════════════════════════════════════════════════
   VERTICAL PRESETS — Visual differentiation per vertical
   ═══════════════════════════════════════════════════════════════ */

/* CNC machines: technical/industrial feel */
.vertical-cnc .filter-chip.active {
  background: rgba(255,154,92,0.15);  /* --code-tool-dim */
  border-color: var(--code-tool);
  color: var(--code-tool);
}

.vertical-cnc .filter-range-fill {
  background: var(--code-tool);
}

.vertical-cnc .filter-range-thumb {
  background: var(--code-tool);
}

/* Endmills: material/precision feel */
.vertical-endmill .filter-chip.active {
  background: rgba(92,225,230,0.15);  /* --code-material-dim */
  border-color: var(--code-material);
  color: var(--code-material);
}

.vertical-endmill .filter-range-fill {
  background: var(--code-material);
}

/* Used cars: consumer/automotive feel */
.vertical-car .filter-chip.active {
  background: rgba(124,224,255,0.15);  /* --code-info-dim */
  border-color: var(--code-info);
  color: var(--code-info);
}

.vertical-car .filter-range-fill {
  background: var(--code-info);
}
```

---

## 2. Smart Auto-Suggest

### Pattern: Segmented Command Palette (Cmd+K)

The best multi-vertical search UX combines:
1. **Global search bar** — searches across all verticals
2. **Vertical segment tabs** — switch between "All", "CNC", "Endmills", "Cars"
3. **Command palette overlay** — Cmd+K for power users
4. **Contextual suggestions** — change based on what's being typed

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│ SEARCH BAR (unified)                                     │
├──────────────────────────────────────────────────────────┤
│ 🔍 [___________ search CNC machines, endmills, cars _____] │
│                                                          │
│ ┌─ SUGGESTIONS DROPDOWN ────────────────────────────────┐ │
│ │                                                       │ │
│ │  ── RECENT ─────────────────────────────────────────  │ │
│ │  🕐 Haas VF-2                                         │ │
│ │  🕐 Sandvik 3-flute carbide                           │ │
│ │  🕐 2020 Toyota Camry                                 │ │
│ │                                                       │ │
│ │  ── MACHINES ────────────────────────────────────────  │ │
│ │  ⚙️  DMG Mori NHX 5000        [HMC]        $185,000  │ │
│ │  ⚙️  Haas VF-6/50             [VMC]         $68,000  │ │
│ │                                                       │ │
│ │  ── ENDMILLS ────────────────────────────────────────  │ │
│ │  🔧  OSG 2254800 3FL Flat End  [Carbide]       $42   │ │
│ │  🔧  Sandvik 38706250 Ball    [TiAlN]         $78   │ │
│ │                                                       │ │
│ │  ── CARS ────────────────────────────────────────────  │ │
│ │  🚗  2020 Toyota Camry LE      [Clean]     $24,500   │ │
│ │  🚗  2019 Honda Civic EX       [Clean]     $19,800   │ │
│ │                                                       │ │
│ │  ── FILTERS ─────────────────────────────────────────  │ │
│ │  🔍  Filter by: Fanuc control system                  │ │
│ │  🔍  Filter by: Carbide substrate                     │ │
│ │  🔍  Filter by: No accident history                   │ │
│ │                                                       │ │
│ └───────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### CSS for Search Component

```css
/* ═══════════════════════════════════════════════════════════════
   SEARCH BAR + AUTOSUGGEST
   ═══════════════════════════════════════════════════════════════ */

.search-container {
  position: relative;
  width: 100%;
  max-width: 640px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 0;
  height: var(--h-xl);
  background: var(--canvas-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-lift);
  transition: all 120ms var(--ease-out);
  overflow: hidden;
}

.search-bar:focus-within {
  border-color: var(--code-action);
  box-shadow: var(--shadow-float), 0 0 0 1px var(--code-action);
}

/* Vertical segment tabs inside search bar */
.search-segments {
  display: flex;
  height: 100%;
  border-right: 1px solid var(--border-subtle);
}

.search-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--sp-3);
  font-size: var(--text-sm);
  font-weight: var(--w-medium);
  color: var(--ink-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 80ms var(--ease-out);
  white-space: nowrap;
}

.search-segment:hover {
  color: var(--ink-primary);
  background: var(--canvas-raised);
}

.search-segment.active {
  color: var(--code-action);
  border-bottom-color: var(--code-action);
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 0 var(--sp-3);
  height: 100%;
}

.search-icon {
  color: var(--ink-muted);
  font-size: 14px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-size: var(--text-md);
  font-family: var(--font-ui);
  color: var(--ink-primary);
  font-feature-settings: 'cv01', 'cv09', 'ss03';
}

.search-input::placeholder {
  color: var(--ink-muted);
}

/* Keyboard shortcut badge */
.search-kbd {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: auto;
  flex-shrink: 0;
}

/* Suggestions dropdown */
.search-suggestions {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--canvas-raised);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-dialog);
  max-height: 480px;
  overflow-y: auto;
  z-index: 50;
  animation: fadeSlideIn 120ms var(--ease-out);
}

.search-suggestion-section {
  padding: var(--sp-2) 0;
  border-bottom: 1px solid var(--border-subtle);
}

.search-suggestion-section:last-child {
  border-bottom: none;
}

.search-suggestion-section-title {
  padding: var(--sp-1) var(--sp-3);
  font-size: 10px;
  font-weight: var(--w-semibold);
  color: var(--ink-ghost);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.search-suggestion-item {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  cursor: pointer;
  transition: background 80ms;
}

.search-suggestion-item:hover,
.search-suggestion-item.highlighted {
  background: var(--canvas-elevated);
}

.search-suggestion-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--canvas-surface);
  border-radius: var(--r-sm);
  font-size: 12px;
  flex-shrink: 0;
}

.search-suggestion-body {
  flex: 1;
  min-width: 0;
}

.search-suggestion-name {
  font-size: var(--text-base);
  color: var(--ink-primary);
  font-weight: var(--w-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-suggestion-meta {
  font-size: var(--text-xs);
  color: var(--ink-muted);
}

.search-suggestion-badge {
  font-size: 10px;
  padding: 1px 5px;
  background: var(--canvas-surface);
  border-radius: var(--r-xs);
  color: var(--ink-tertiary);
  font-family: var(--font-mono);
}

.search-suggestion-price {
  font-size: var(--text-sm);
  font-weight: var(--w-semibold);
  color: var(--ink-primary);
  font-family: var(--font-mono);
  flex-shrink: 0;
}

/* Command palette (Cmd+K) */
.command-palette-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 200;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  backdrop-filter: blur(4px);
  animation: fadeSlideIn 100ms var(--ease-out);
}

.command-palette {
  width: 560px;
  max-width: 90vw;
  background: var(--canvas-raised);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-dialog);
  overflow: hidden;
}

.command-palette-input {
  width: 100%;
  padding: var(--sp-3) var(--sp-4);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border-subtle);
  font-size: var(--text-lg);
  font-family: var(--font-ui);
  color: var(--ink-primary);
  outline: none;
}

.command-palette-results {
  max-height: 400px;
  overflow-y: auto;
  padding: var(--sp-1) 0;
}

/* Vertical category icons in suggestions */
.vertical-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 11px;
}

.vertical-icon.cnc    { color: var(--code-tool); }
.vertical-icon.endmill { color: var(--code-material); }
.vertical-icon.car    { color: var(--code-info); }

/* Loading state for suggestions */
.search-suggestion-loading {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-3);
  color: var(--ink-muted);
  font-size: var(--text-sm);
}

.search-suggestion-loading .spinner {
  width: 12px;
  height: 12px;
}
```

---

## 3. Data-Dense Table Design

### Pattern: Virtualized Columnar Table with Persistent Selection

For 10-15 visible columns from 80+ possible fields, use a table with:
- **Column pinning** — keep essential columns visible during scroll
- **Column selection** — user chooses which columns to show
- **Multi-column sort** — click header to sort, Ctrl+Click for secondary sort
- **Virtual scrolling** — render only visible rows for performance
- **Row expansion** — click to see all 80+ fields inline

### Recommended Column Layout

```
┌────┬────┬──────────────────┬────────┬──────┬───────┬─────┬──────┬─────────┬─────┐
│ □  │ ⭐ │ NAME             │ BRAND  │ TYPE │ SPECS │ $   │ COND │ ACTIONS │ ... │
├────┼────┼──────────────────┼────────┼──────┼───────┼─────┼──────┼─────────┼─────┤
│ ☐  │    │ DMG Mori NHX 5000│ DMG    │ HMC  │ 500… │$185k│ New  │ 📋 📊 │     │
│ ☐  │    │ Haas VF-6/50     │ Haas   │ VMC  │ 1320…│$68k │ Used │ 📋 📊 │     │
│ ☐  │ ★  │ Mazak QTN 250    │ Mazak  │ Lathe│ 510… │$92k │ New  │ 📋 📊 │     │
│ ☐  │    │ Okuma LB3000     │ Okuma  │ Lathe│ 510… │$78k │ Used │ 📋 📊 │     │
└────┴────┴──────────────────┴────────┴──────┴─────┴──────┴──────┴─────────┴─────┘
  ▲  ▲         ▲                ▲                          ▲          ▲
  │  │         │                │                          │          │
 Pin Check    Pinned            Sortable                   Sortable  Actions
  Col  box    + Sortable        + Range Filter              + Range    row
```

### CSS for Data Table

```css
/* ═══════════════════════════════════════════════════════════════
   DATA TABLE — Dense, virtualized, dark-background optimized
   ═══════════════════════════════════════════════════════════════ */

.data-table-wrapper {
  flex: 1;
  overflow: auto;
  background: var(--canvas-base);
  position: relative;
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: var(--text-base);
}

/* Sticky header */
.data-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table th {
  height: var(--h-md);
  padding: 0 var(--sp-2);
  background: var(--canvas-surface);
  border-bottom: 2px solid var(--border-default);
  font-size: var(--text-xs);
  font-weight: var(--w-semibold);
  color: var(--ink-secondary);
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: background 80ms, color 80ms;
  position: relative;
}

.data-table th:hover {
  background: var(--canvas-raised);
  color: var(--ink-primary);
}

/* Sort indicator */
.data-table th.sortable::after {
  content: '↕';
  font-size: 9px;
  margin-left: 4px;
  opacity: 0.3;
}

.data-table th.sort-asc::after {
  content: '↑';
  opacity: 0.8;
  color: var(--code-action);
}

.data-table th.sort-desc::after {
  content: '↓';
  opacity: 0.8;
  color: var(--code-action);
}

/* Pinned columns (left side) */
.data-table th.pinned-left,
.data-table td.pinned-left {
  position: sticky;
  left: 0;
  z-index: 5;
  background: var(--canvas-base);
}

.data-table th.pinned-left {
  z-index: 15; /* Above regular header */
  background: var(--canvas-surface);
}

/* Second pinned column */
.data-table th.pinned-left-2,
.data-table td.pinned-left-2 {
  position: sticky;
  z-index: 4;
}

.data-table th.pinned-left-2 {
  z-index: 14;
}

/* Column resize handle */
.data-table th .resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  background: transparent;
  transition: background 80ms;
}

.data-table th .resize-handle:hover,
.data-table th .resize-handle.dragging {
  background: var(--code-action);
}

/* Row styles */
.data-table tbody tr {
  height: var(--h-sm);
  transition: background 80ms;
}

.data-table tbody tr:hover {
  background: var(--canvas-surface);
}

.data-table tbody tr.selected {
  background: var(--code-action-dim);
}

.data-table tbody tr.highlighted {
  background: rgba(255,186,66,0.06);
  border-left: 2px solid var(--code-warning);
}

.data-table td {
  padding: 0 var(--sp-2);
  border-bottom: 1px solid var(--border-subtle);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

/* Cell types */
.cell-text {
  color: var(--ink-primary);
}

.cell-number {
  font-family: var(--font-mono);
  color: var(--ink-primary);
  text-align: right;
}

.cell-currency {
  font-family: var(--font-mono);
  color: var(--code-success);
  font-weight: var(--w-medium);
  text-align: right;
}

.cell-condition {
  font-size: 10px;
  font-weight: var(--w-semibold);
}

.cell-condition.new    { color: var(--code-success); }
.cell-condition.used   { color: var(--code-warning); }
.cell-condition.rebuilt { color: var(--code-danger); }

/* Inline editable cell */
.cell-editable {
  cursor: text;
  padding: 2px 4px;
  border-radius: var(--r-xs);
  transition: background 80ms;
  min-width: 80px;
}

.cell-editable:hover {
  background: var(--canvas-elevated);
  outline: 1px solid var(--border-subtle);
}

.cell-editable:focus {
  background: var(--canvas-surface);
  outline: 1px solid var(--code-action);
}

.cell-editable input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-size: var(--text-base);
  font-family: var(--font-ui);
  color: var(--ink-primary);
}

/* Row expand (show all 80+ fields) */
.row-expand-trigger {
  cursor: pointer;
  color: var(--ink-muted);
  font-size: 10px;
  transition: transform 150ms var(--ease-out);
}

.row-expand-trigger.expanded {
  transform: rotate(90deg);
  color: var(--code-action);
}

.row-expanded {
  background: var(--canvas-surface);
  border-bottom: 2px solid var(--border-default);
}

.row-expanded-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-4);
}

.row-expanded-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row-expanded-label {
  font-size: 10px;
  color: var(--ink-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.row-expanded-value {
  font-size: var(--text-base);
  color: var(--ink-primary);
  font-family: var(--font-mono);
}

/* Column selector dropdown */
.column-selector {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--canvas-raised);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-dialog);
  padding: var(--sp-2) 0;
  min-width: 240px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 30;
  animation: fadeSlideIn 100ms var(--ease-out);
}

.column-selector-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: var(--sp-1) var(--sp-3);
  font-size: var(--text-sm);
  color: var(--ink-secondary);
  cursor: pointer;
  transition: background 80ms;
}

.column-selector-item:hover {
  background: var(--canvas-elevated);
  color: var(--ink-primary);
}

.column-selector-group {
  padding: var(--sp-1) var(--sp-3);
  font-size: 10px;
  font-weight: var(--w-semibold);
  color: var(--ink-ghost);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: var(--sp-1);
}

/* Table toolbar */
.table-toolbar {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  background: var(--canvas-surface);
  border-bottom: 1px solid var(--border-default);
  height: var(--h-lg);
}

.table-toolbar-search {
  display: flex;
  align-items: center;
  gap: 4px;
  height: var(--h-sm);
  padding: 0 var(--sp-2);
  background: var(--canvas-base);
  border: 1px solid var(--border-default);
  border-radius: var(--r-xs);
}

.table-toolbar-search input {
  background: transparent;
  border: none;
  outline: none;
  font-size: var(--text-sm);
  color: var(--ink-primary);
  width: 120px;
}

.table-toolbar-count {
  font-size: var(--text-sm);
  color: var(--ink-muted);
  margin-left: auto;
  font-family: var(--font-mono);
}

/* Selection checkbox */
.row-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* Summary row */
.data-table tfoot td {
  height: var(--h-md);
  padding: 0 var(--sp-2);
  background: var(--canvas-surface);
  border-top: 2px solid var(--border-default);
  font-size: var(--text-sm);
  font-weight: var(--w-semibold);
  color: var(--ink-secondary);
  font-family: var(--font-mono);
}
```

### Table Component Data Structure

```javascript
// Column definition for the table
const columnDefs = {
  cnc_machines: {
    alwaysVisible: ['name', 'price'],  // Never hideable
    defaultVisible: [
      'name', 'manufacturer', 'model', 'price',
      'machine_type', 'travel_x', 'travel_y', 'travel_z',
      'spindle_speed', 'condition'
    ],
    columns: [
      { id: 'name',       label: 'Name',      type: 'text',      pinned: true, sortable: true, minWidth: 180 },
      { id: 'price',      label: 'Price',     type: 'currency',  pinned: true, sortable: true, width: 100 },
      { id: 'manufacturer', label: 'Brand',   type: 'text',      sortable: true, width: 100 },
      { id: 'model',      label: 'Model',     type: 'text',      sortable: true, width: 120 },
      { id: 'machine_type', label: 'Type',    type: 'badge',     sortable: true, width: 80,
        badgeColors: { VMC: 'blue', HMC: 'green', Lathe: 'amber', '5-Axis': 'magenta' }},
      { id: 'travel_x',   label: 'X Travel',  type: 'number',    sortable: true, width: 80, unit: 'mm' },
      { id: 'travel_y',   label: 'Y Travel',  type: 'number',    sortable: true, width: 80, unit: 'mm' },
      { id: 'travel_z',   label: 'Z Travel',  type: 'number',    sortable: true, width: 80, unit: 'mm' },
      { id: 'spindle_speed', label: 'RPM',    type: 'number',    sortable: true, width: 70, unit: 'rpm' },
      { id: 'spindle_power', label: 'kW',     type: 'number',    sortable: true, width: 60 },
      { id: 'condition',  label: 'Condition', type: 'badge',     sortable: true, width: 80,
        badgeColors: { New: 'green', Used: 'amber', Rebuilt: 'red', Refurbished: 'blue' }},
      { id: 'year',       label: 'Year',      type: 'number',    sortable: true, width: 60 },
      { id: 'location',   label: 'Location',  type: 'text',      sortable: true, width: 120 },
      { id: 'seller',     label: 'Seller',    type: 'text',      sortable: true, width: 100 },
      { id: 'listed_date', label: 'Listed',   type: 'date',      sortable: true, width: 80 },
      { id: 'notes',      label: 'Notes',     type: 'editable',  editable: true, width: 150 },
    ],
  },
  // ... similar for endmills and used_cars
};
```

---

## 4. Comparison View Patterns

### Pattern: Side-by-Side Vertical Comparison (2-4 items)

### Layout Options

```
OPTION A: 2-Column Side-by-Side (default)
┌─────────────────┬─────────────────┐
│  Machine A      │  Machine B      │
│  DMG Mori NHX   │  Haas VF-6      │
├─────────────────┼─────────────────┤
│  Price: $185k   │  Price: $68k    │  ← Highlighted: DIFFERENT
│  Travel: 500mm  │  Travel: 1320mm │  ← Highlighted: DIFFERENT
│  RPM: 12,000    │  RPM: 8,100     │
│  Control:MAPPS  │  Control:Haas   │
│  Condition:New  │  Condition:Used │
│  [Remove]       │  [Remove]       │
└─────────────────┴─────────────────┘

OPTION B: Table Comparison (3-4 items)
┌──────────┬──────────┬──────────┬──────────┐
│ SPEC     │ DMG NHX  │ Haas VF  │ Mazak Q  │
├──────────┼──────────┼──────────┼──────────┤
│ Price    │ $185,000 │ $68,000  │ $92,000  │
│ X Travel │ 500mm    │ 1320mm   │ 510mm    │
│ Spindle  │ 12,000   │ 8,100    │ 5,000    │
│ Control  │ MAPPS    │ Haas     │ Mazatrol │
└──────────┴──────────┴──────────┴──────────┘
```

### CSS for Comparison

```css
/* ═══════════════════════════════════════════════════════════════
   COMPARISON VIEW — Side-by-side listing comparison
   ═══════════════════════════════════════════════════════════════ */

.comparison-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--canvas-raised);
  border-top: 1px solid var(--border-strong);
  box-shadow: 0 -4px 24px rgba(0,0,0,0.4);
  z-index: 80;
  transform: translateY(100%);
  transition: transform 250ms var(--ease-out);
}

.comparison-panel.visible {
  transform: translateY(0);
}

.comparison-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-2) var(--sp-4);
  border-bottom: 1px solid var(--border-subtle);
}

.comparison-title {
  font-size: var(--text-md);
  font-weight: var(--w-semibold);
  color: var(--ink-primary);
}

.comparison-count {
  font-size: var(--text-sm);
  color: var(--ink-muted);
}

.comparison-grid {
  display: grid;
  grid-template-columns: 160px repeat(var(--compare-count, 2), 1fr);
  max-height: 400px;
  overflow-y: auto;
}

/* Spec row */
.comparison-row {
  display: contents;
}

.comparison-row:nth-child(odd) .comparison-cell {
  background: var(--canvas-surface);
}

.comparison-cell {
  padding: var(--sp-1) var(--sp-3);
  display: flex;
  align-items: center;
  min-height: var(--h-sm);
  font-size: var(--text-base);
  border-bottom: 1px solid var(--border-subtle);
}

/* Spec label (first column) */
.comparison-spec-label {
  color: var(--ink-muted);
  font-size: var(--text-sm);
  font-weight: var(--w-medium);
}

/* Spec value */
.comparison-spec-value {
  color: var(--ink-primary);
  font-family: var(--font-mono);
  font-size: var(--text-base);
}

/* Difference highlighting */
.comparison-spec-value.best {
  color: var(--code-success);
  font-weight: var(--w-semibold);
}

.comparison-spec-value.worst {
  color: var(--ink-tertiary);
}

.comparison-spec-value.different {
  /* Subtle highlight for different values */
  background: rgba(108,138,255,0.06);
  border-radius: var(--r-xs);
  padding: 1px 4px;
  margin: -1px -4px;
}

/* Missing data */
.comparison-spec-value.missing {
  color: var(--ink-ghost);
  font-style: italic;
}

.comparison-spec-value.missing::before {
  content: '—';
}

/* Comparison item header */
.comparison-item-header {
  display: flex;
  flex-direction: column;
  padding: var(--sp-2) var(--sp-3);
  background: var(--canvas-elevated);
  border-bottom: 1px solid var(--border-default);
  border-left: 1px solid var(--border-subtle);
}

.comparison-item-name {
  font-size: var(--text-base);
  font-weight: var(--w-semibold);
  color: var(--ink-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.comparison-item-price {
  font-size: var(--text-sm);
  font-family: var(--font-mono);
  color: var(--code-success);
  font-weight: var(--w-semibold);
}

.comparison-item-remove {
  font-size: 10px;
  color: var(--ink-muted);
  cursor: pointer;
  margin-top: 2px;
}

.comparison-item-remove:hover {
  color: var(--code-danger);
}

/* Add to comparison slot */
.comparison-slot-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid var(--border-subtle);
  background: var(--canvas-surface);
  color: var(--ink-ghost);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: background 80ms, color 80ms;
}

.comparison-slot-empty:hover {
  background: var(--canvas-raised);
  color: var(--ink-muted);
}

/* Mobile comparison: stacked cards */
@media (max-width: 768px) {
  .comparison-grid {
    grid-template-columns: 1fr;
    gap: var(--sp-2);
    padding: var(--sp-2);
  }

  .comparison-cell {
    border-bottom: none;
    border-left: 3px solid var(--border-default);
    padding-left: var(--sp-3);
  }

  .comparison-cell.best {
    border-left-color: var(--code-success);
  }

  .comparison-cell.worst {
    border-left-color: var(--canvas-elevated);
  }
}

/* Comparison trigger in table rows */
.compare-check {
  width: 18px;
  height: 18px;
  border: 1px solid var(--border-default);
  border-radius: var(--r-xs);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 80ms;
}

.compare-check:hover {
  border-color: var(--code-action);
  background: var(--code-action-dim);
}

.compare-check.active {
  background: var(--code-action);
  border-color: var(--code-action);
  color: #fff;
  font-size: 10px;
}
```

### Comparison Component Logic

```javascript
// How to determine "best" for each spec
const comparisonRules = {
  cnc_machines: {
    price:           { direction: 'lower', label: 'Price' },
    travel_x:        { direction: 'higher', label: 'X Travel' },
    travel_y:        { direction: 'higher', label: 'Y Travel' },
    travel_z:        { direction: 'higher', label: 'Z Travel' },
    spindle_speed:   { direction: 'higher', label: 'Max RPM' },
    spindle_power:   { direction: 'higher', label: 'Power' },
    weight:          { direction: 'lower', label: 'Weight' },
    condition:       { rank: ['New', 'Refurbished', 'Rebuilt', 'Used'], label: 'Condition' },
  },
  endmills: {
    price:           { direction: 'lower', label: 'Price' },
    diameter:        { direction: 'match', label: 'Diameter' },
    flutes:          { direction: 'match', label: 'Flutes' },
    cutting_length:  { direction: 'higher', label: 'LOC' },
    oal:             { direction: 'match', label: 'OAL' },
  },
  used_cars: {
    price:           { direction: 'lower', label: 'Price' },
    mileage:         { direction: 'lower', label: 'Mileage' },
    year:            { direction: 'higher', label: 'Year' },
    mpg:             { direction: 'higher', label: 'MPG' },
    accident_history:{ rank: ['No Accidents', 'Minor', 'Reported'], label: 'History' },
  },
};
```

---

## 5. Price Visualization

### Pattern: Dark-Background Charts with Design System Palette

All charts use the Reese Design System color tokens for consistency.

### Chart Types Needed

1. **Price History** — line chart showing price over time
2. **Price Distribution** — histogram showing price ranges in current results
3. **Value Assessment** — gauge/bar showing if a price is good/fair/high
4. **Price Comparison** — bar chart comparing items in comparison view

### CSS for Charts

```css
/* ═══════════════════════════════════════════════════════════════
   PRICE CHARTS — Dark background, design system palette
   ═══════════════════════════════════════════════════════════════ */

.chart-container {
  background: var(--canvas-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--r-md);
  overflow: hidden;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-2) var(--sp-3);
  border-bottom: 1px solid var(--border-subtle);
}

.chart-title {
  font-size: var(--text-sm);
  font-weight: var(--w-semibold);
  color: var(--ink-secondary);
}

.chart-subtitle {
  font-size: var(--text-xs);
  color: var(--ink-muted);
}

.chart-body {
  padding: var(--sp-3);
  position: relative;
  height: 200px;
}

/* SVG chart base */
.chart-svg {
  width: 100%;
  height: 100%;
}

/* Chart grid lines */
.chart-grid-line {
  stroke: var(--border-subtle);
  stroke-width: 1;
  stroke-dasharray: 4 4;
}

/* Chart axis labels */
.chart-axis-label {
  font-size: 10px;
  font-family: var(--font-mono);
  fill: var(--ink-muted);
}

/* Price history line */
.chart-line {
  fill: none;
  stroke: var(--code-action);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Price history area fill */
.chart-area {
  fill: url(#chart-gradient);
  opacity: 0.15;
}

/* Price points on line */
.chart-dot {
  fill: var(--code-action);
  stroke: var(--canvas-surface);
  stroke-width: 2;
  cursor: pointer;
  transition: r 80ms;
}

.chart-dot:hover {
  r: 5;
}

/* Price distribution bars */
.chart-bar {
  fill: var(--code-action);
  opacity: 0.7;
  transition: opacity 80ms;
}

.chart-bar:hover {
  opacity: 1;
}

.chart-bar.highlighted {
  fill: var(--code-success);
  opacity: 1;
}

/* Value assessment gauge */
.value-gauge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
}

.value-gauge-track {
  width: 100%;
  height: 8px;
  background: var(--canvas-elevated);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.value-gauge-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 500ms var(--ease-out);
}

.value-gauge-fill.good {
  background: linear-gradient(90deg, var(--code-success), var(--code-success));
}

.value-gauge-fill.fair {
  background: linear-gradient(90deg, var(--code-success), var(--code-warning));
}

.value-gauge-fill.high {
  background: linear-gradient(90deg, var(--code-warning), var(--code-danger));
}

.value-gauge-marker {
  position: absolute;
  top: -4px;
  width: 3px;
  height: 16px;
  background: var(--ink-primary);
  border-radius: 2px;
  transform: translateX(-50%);
}

.value-gauge-label {
  font-size: var(--text-xs);
  color: var(--ink-muted);
}

.value-gauge-price {
  font-size: var(--text-lg);
  font-weight: var(--w-bold);
  font-family: var(--font-mono);
}

.value-gauge-price.good { color: var(--code-success); }
.value-gauge-price.fair { color: var(--code-warning); }
.value-gauge-price.high { color: var(--code-danger); }

/* Mini price sparkline (for table cells) */
.price-sparkline {
  display: inline-block;
  width: 60px;
  height: 20px;
  vertical-align: middle;
}

.price-sparkline line {
  stroke: var(--ink-muted);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.price-sparkline .trend-up {
  stroke: var(--code-success);
}

.price-sparkline .trend-down {
  stroke: var(--code-danger);
}

.price-sparkline .trend-flat {
  stroke: var(--ink-muted);
}

/* Price comparison bars */
.price-compare-bar {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  height: var(--h-sm);
}

.price-compare-bar-track {
  flex: 1;
  height: 6px;
  background: var(--canvas-elevated);
  border-radius: 3px;
  overflow: hidden;
}

.price-compare-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 400ms var(--ease-out);
}

.price-compare-bar-fill.best {
  background: var(--code-success);
}

.price-compare-bar-fill.mid {
  background: var(--code-warning);
}

.price-compare-bar-fill.high {
  background: var(--code-danger);
}

.price-compare-bar-label {
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--ink-muted);
  min-width: 60px;
  text-align: right;
}

/* Price trend indicator */
.price-trend {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-family: var(--font-mono);
}

.price-trend.up { color: var(--code-success); }
.price-trend.down { color: var(--code-danger); }
.price-trend.flat { color: var(--ink-muted); }

/* Histogram for price distribution */
.price-histogram {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 40px;
  padding: var(--sp-1) 0;
}

.price-histogram-bar {
  flex: 1;
  background: var(--code-action);
  opacity: 0.5;
  border-radius: 1px 1px 0 0;
  transition: opacity 80ms, background 80ms;
  min-height: 2px;
}

.price-histogram-bar:hover {
  opacity: 1;
  background: var(--code-action);
}

.price-histogram-bar.active {
  opacity: 1;
  background: var(--code-success);
}

/* Chart tooltip */
.chart-tooltip {
  position: absolute;
  background: var(--canvas-elevated);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-sm);
  padding: var(--sp-1) var(--sp-2);
  font-size: var(--text-xs);
  color: var(--ink-primary);
  pointer-events: none;
  z-index: 20;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  white-space: nowrap;
}

.chart-tooltip-date {
  color: var(--ink-muted);
  margin-bottom: 2px;
}

.chart-tooltip-price {
  font-family: var(--font-mono);
  font-weight: var(--w-semibold);
  color: var(--code-success);
}
```

### Price Component HTML Structure

```html
<!-- Price History Card -->
<div class="chart-container">
  <div class="chart-header">
    <span class="chart-title">Price History</span>
    <span class="chart-subtitle">Last 12 months</span>
  </div>
  <div class="chart-body">
    <svg class="chart-svg" viewBox="0 0 300 160">
      <defs>
        <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--code-action)" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="var(--code-action)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <!-- Grid lines -->
      <line class="chart-grid-line" x1="40" y1="20" x2="290" y2="20"/>
      <line class="chart-grid-line" x1="40" y1="55" x2="290" y2="55"/>
      <line class="chart-grid-line" x1="40" y1="90" x2="290" y2="90"/>
      <line class="chart-grid-line" x1="40" y1="125" x2="290" y2="125"/>
      <!-- Area fill -->
      <path class="chart-area" d="M40,125 L80,110 L120,95 ... L290,60 L290,125 Z"/>
      <!-- Line -->
      <polyline class="chart-line" points="40,125 80,110 120,95 ... 290,60"/>
      <!-- Points -->
      <circle class="chart-dot" cx="40" cy="125" r="3"/>
      <!-- Y-axis labels -->
      <text class="chart-axis-label" x="0" y="24">$200k</text>
      <text class="chart-axis-label" x="0" y="59">$150k</text>
      <text class="chart-axis-label" x="0" y="94">$100k</text>
      <text class="chart-axis-label" x="0" y="129">$50k</text>
    </svg>
  </div>
</div>

<!-- Value Assessment -->
<div class="value-gauge">
  <div class="chart-title">Market Value Assessment</div>
  <div class="value-gauge-price fair">$87,500</div>
  <div class="value-gauge-track">
    <div class="value-gauge-fill fair" style="width: 55%"></div>
    <div class="value-gauge-marker" style="left: 55%"></div>
  </div>
  <div style="display:flex;justify-content:space-between;width:100%">
    <span class="value-gauge-label">$50k</span>
    <span class="value-gauge-label" style="color:var(--code-success)">Good deal</span>
    <span class="value-gauge-label" style="color:var(--code-warning)">Fair</span>
    <span class="value-gauge-label" style="color:var(--code-danger)">High</span>
    <span class="value-gauge-label">$150k</span>
  </div>
</div>

<!-- Price Distribution Histogram (in filter panel) -->
<div class="chart-container" style="height:60px">
  <div class="price-histogram">
    <div class="price-histogram-bar" style="height:20%"></div>
    <div class="price-histogram-bar" style="height:35%"></div>
    <div class="price-histogram-bar" style="height:80%"></div>
    <div class="price-histogram-bar active" style="height:100%"></div>
    <div class="price-histogram-bar" style="height:60%"></div>
    <div class="price-histogram-bar" style="height:40%"></div>
    <div class="price-histogram-bar" style="height:25%"></div>
    <div class="price-histogram-bar" style="height:15%"></div>
  </div>
</div>
```

### Chart Library Recommendation

For production use, integrate with **Apache ECharts** (dark theme) or **Recharts** (React). Both support:
- Dark background themes
- Custom color palettes
- Responsive sizing
- Tooltip interactions
- Animation on data change

```javascript
// ECharts dark theme configuration using Design System tokens
const chartTheme = {
  backgroundColor: 'transparent',
  textStyle: {
    color: '#a8adb8',    // --ink-secondary
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  title: {
    textStyle: { color: '#e8eaef' },  // --ink-primary
  },
  legend: {
    textStyle: { color: '#7c8294' },  // --ink-tertiary
  },
  xAxis: {
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.09)' } },
    axisLabel: { color: '#6b7088' },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)', type: 'dashed' } },
  },
  yAxis: {
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.09)' } },
    axisLabel: { color: '#6b7088' },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)', type: 'dashed' } },
  },
  series: [{
    lineStyle: { color: '#6c8aff', width: 2 },
    itemStyle: { color: '#6c8aff', borderColor: '#1b1d24', borderWidth: 2 },
    areaStyle: {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(108,138,255,0.3)' },
          { offset: 1, color: 'rgba(108,138,255,0)' },
        ],
      },
    },
  }],
  tooltip: {
    backgroundColor: '#23252d',
    borderColor: 'rgba(255,255,255,0.14)',
    textStyle: { color: '#e8eaef', fontSize: 12 },
  },
};
```

---

## 6. Page Layout — Putting It All Together

### Master Layout Structure

```
┌──────────────────────────────────────────────────────────────────────┐
│ TOP BAR: Logo | Search Bar (with segments) | Cmd+K | User | Theme  │
├──────────────────────────────────────────────────────────────────────┤
│ VERTICAL TABS: [All] [CNC Machines] [Endmills] [Used Cars]        │
├──────────────────────────────────────────────────────────────────────┤
│ ACTIVE FILTERS: [Fanuc ✓] [Price: $50k-$200k ✓] [New ✓] [Clear]  │
├──────────────┬───────────────────────────────────────────────────────┤
│              │ TABLE TOOLBAR: [🔍 Search] [Columns] [Sort] [View]  │
│   FILTER     ├───────────────────────────────────────────────────────┤
│   PANEL      │                                                       │
│   (320px)    │   DATA TABLE (virtualized, sortable, pinnable)       │
│              │                                                       │
│   Quick      │   ┌─┬───┬─────────┬──────┬──────┬─────┬───┬───┐    │
│   Filters    │   │□│ ⭐│ NAME    │ BRAND│ TYPE │ $   │cond│...│    │
│              │   ├───┼───┼─────────┼──────┼──────┼─────┼───┼───┤    │
│   Price      │   │☐│   │ DMG NHX │ DMG  │ HMC  │$185k│New│   │    │
│   Range      │   │☐│   │ Haas VF │ Haas │ VMC  │$68k │U  │   │    │
│              │   │☐│★  │ Mazak Q │ Mazak│ Lathe│$92k │New│   │    │
│   Category   │   └─┴───┴─────────┴──────┴──────┴─────┴───┴───┘    │
│   Filters    │                                                       │
│              │   PAGINATION: [← 1 2 3 ... 47 →]  Showing 1-25     │
│   Expandable │   of 1,247 results                                   │
│   Sections   │                                                       │
│              │                                                       │
├──────────────┴───────────────────────────────────────────────────────┤
│ COMPARISON BAR (slide up when items selected):                       │
│ [DMG NHX $185k] [Haas VF $68k] [Mazak Q $92k] [+ Add] [Compare]  │
└──────────────────────────────────────────────────────────────────────┘
```

### CSS for Master Layout

```css
/* ═══════════════════════════════════════════════════════════════
   MASTER LAYOUT — Search dashboard shell
   ═══════════════════════════════════════════════════════════════ */

.dashboard {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--canvas-void);
  color: var(--ink-primary);
}

/* Top bar */
.topbar {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  height: var(--h-2xl);
  padding: 0 var(--sp-4);
  background: var(--canvas-surface);
  border-bottom: 1px solid var(--border-default);
  z-index: 20;
}

.topbar-logo {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  flex-shrink: 0;
}

.topbar-logo-text {
  font-size: var(--text-md);
  font-weight: var(--w-bold);
  color: var(--ink-primary);
}

.topbar-logo-tag {
  font-size: 9px;
  font-family: var(--font-mono);
  color: var(--ink-muted);
  background: var(--canvas-raised);
  padding: 1px 4px;
  border-radius: var(--r-xs);
}

.topbar-search {
  flex: 1;
  max-width: 640px;
  margin: 0 auto;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  flex-shrink: 0;
}

/* Vertical tabs */
.vertical-tabs {
  display: flex;
  gap: 1px;
  padding: 0 var(--sp-4);
  background: var(--canvas-surface);
  border-bottom: 1px solid var(--border-default);
}

.vertical-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: var(--sp-2) var(--sp-3);
  font-size: var(--text-base);
  font-weight: var(--w-medium);
  color: var(--ink-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 80ms var(--ease-out);
}

.vertical-tab:hover {
  color: var(--ink-primary);
  background: var(--canvas-raised);
}

.vertical-tab.active {
  color: var(--ink-primary);
  border-bottom-color: var(--code-action);
}

.vertical-tab-count {
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--ink-ghost);
}

/* Active filter bar */
.active-filters-bar {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  background: var(--canvas-base);
  border-bottom: 1px solid var(--border-subtle);
  min-height: var(--h-sm);
}

/* Main content area */
.dashboard-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Comparison bar */
.comparison-bar {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  background: var(--canvas-elevated);
  border-top: 1px solid var(--border-default);
  min-height: var(--h-lg);
}

.comparison-bar-item {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-1) var(--sp-2);
  background: var(--canvas-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--r-sm);
  font-size: var(--text-sm);
}

/* Responsive: collapse sidebar on mobile */
@media (max-width: 768px) {
  .dashboard-body {
    flex-direction: column;
  }

  .filter-panel {
    position: fixed;
    inset: 0;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 200ms var(--ease-out);
  }

  .filter-panel.open {
    transform: translateX(0);
  }

  .topbar-logo-text {
    display: none;
  }

  .vertical-tab {
    padding: var(--sp-2);
    font-size: var(--text-sm);
  }
}
```

---

## 7. Summary of Key Patterns

| Pattern | Source | Key Insight |
|---------|--------|-------------|
| **Schema-driven filters** | Google Shopping, Zillow | Define filters as data per vertical, not hardcoded components |
| **Categorized filter panel** | Airbnb | Group filters by category, use accordions for less-used groups |
| **Quick filter chips** | Airbnb | Top 4-5 most-used filters as always-visible toggle buttons |
| **Dual-thumb range slider** | Zillow, Airbnb | For numeric ranges with histogram backdrop |
| **Command palette** | Cmd+K pattern | Unified search across all verticals with category grouping |
| **Virtualized data table** | React DataGrid, AG Grid | Only render visible rows; pin essential columns |
| **Column pinning + selection** | AG Grid | Keep name/price visible; let user choose other columns |
| **Side-by-side comparison** | Consumer sites | 2-4 items with difference highlighting |
| **Price sparklines** | Financial UIs | 60px inline line charts in table cells |
| **Value assessment gauge** | Zillow Zestimate | Visual "good/fair/high" indicator per item |
| **Dark background charts** | ECharts dark theme | Transparent bg, muted gridlines, vivid data lines |
| **Vertical color coding** | Design System | CNC=orange, Endmill=teal, Car=cyan for visual differentiation |

---

## 8. Implementation Priority

1. **Filter schema system** — Define vertical schemas, build schema-driven filter renderer
2. **Virtualized table** — Use React DataGrid or TanStack Table with virtualization
3. **Search with autosuggest** — Segmented search bar with category-grouped results
4. **Comparison mode** — Bottom bar with side-by-side view
5. **Price charts** — ECharts integration with dark theme
6. **Column selector** — Dropdown to show/hide table columns
7. **Mobile responsive** — Sidebar overlay, stacked comparison cards
