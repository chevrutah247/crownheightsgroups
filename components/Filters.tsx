'use client';

import { Location, Category } from '@/lib/types';

interface FiltersProps {
  locations: Location[];
  categories: Category[];
  selectedLocation: string;
  selectedCategory: string;
  searchQuery: string;
  onLocationChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export default function Filters({
  locations,
  categories,
  selectedLocation,
  selectedCategory,
  searchQuery,
  onLocationChange,
  onCategoryChange,
  onSearchChange,
}: FiltersProps) {
  // Group locations by state
  const locationsByState = locations.reduce((acc, loc) => {
    if (!acc[loc.state]) acc[loc.state] = [];
    acc[loc.state].push(loc);
    return acc;
  }, {} as Record<string, Location[]>);

  return (
    <section className="filters-section">
      <div className="filters-row">
        <div className="filter-group search-group">
          <label className="filter-label">Search</label>
          <input
            type="text"
            className="filter-input search-input"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Neighborhood</label>
          <select
            className="filter-select"
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
          >
            <option value="">All Neighborhoods</option>
            {Object.entries(locationsByState).map(([state, locs]) => (
              <optgroup key={state} label={state}>
                {locs.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.neighborhood}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Category</label>
          <select
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
