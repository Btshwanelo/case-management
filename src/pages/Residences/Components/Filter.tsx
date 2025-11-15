import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const FilterPopover = ({ filters, onApplyFilters }) => {
  // Filter out bulk actions and memoize the result
  const nonBulkFilters = React.useMemo(() => filters?.filter((filter) => !filter.isBulkAction), [filters]);

  // State to store all selected filter values
  const [selectedFilters, setSelectedFilters] = useState({});
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [open, setOpen] = useState(false);

  // Update active filters count whenever selections change
  useEffect(() => {
    const count = Object.values(selectedFilters).filter((value) => value !== '').length;
    setActiveFiltersCount(count);
  }, [selectedFilters]);

  // Handle individual filter changes
  const handleFilterChange = (filterLabel, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterLabel]: value,
    }));
  };

  // Handle apply button click
  const handleApply = () => {
    // Convert selected filters to API-friendly format
    const apiFilters = Object.entries(selectedFilters)
      .filter(([_, value]) => value !== '')
      .map(([label, value]) => {
        const filterGroup = nonBulkFilters.find((f) => f.label === label);
        const selectedFilter = filterGroup.actionFilters.find((af) => af.filterName === value);

        return {
          label,
          filterName: value,
          portalListingFilterId: selectedFilter?.portalListingFilterId,
          actions: selectedFilter?.actions || [],
        };
      });

    onApplyFilters(apiFilters);
    setOpen(false);
  };

  // Handle clear filters
  const handleClear = () => {
    const emptySelections = {};
    nonBulkFilters?.forEach((filter) => {
      emptySelections[filter.label] = '';
    });
    setSelectedFilters(emptySelections);
  };

  // Initialize empty selections when filters prop changes
  useEffect(() => {
    const initialSelections = {};
    nonBulkFilters?.forEach((filter) => {
      initialSelections[filter.label] = '';
    });
    setSelectedFilters(initialSelections);
  }, [nonBulkFilters]);

  // If there are no non-bulk filters, don't render the component
  if (nonBulkFilters?.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 rounded-full">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium leading-none">Filters</h4>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" className="h-8 px-2 text-xs" onClick={handleClear}>
                Clear filters
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          {nonBulkFilters?.map((filter) => (
            <div key={filter.portalListingId} className="space-y-2">
              <label className="text-sm font-medium">{filter.label}</label>
              <Select value={selectedFilters[filter.label] || ''} onValueChange={(value) => handleFilterChange(filter.label, value)}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${filter.label}`} />
                </SelectTrigger>
                <SelectContent>
                  {filter?.actionFilters.map((action) => (
                    <SelectItem key={action.portalListingFilterId} value={action.filterName}>
                      {action.filterName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          <div className="flex items-center gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1 bg-orange-500 hover:bg-orange-600" onClick={handleApply} disabled={activeFiltersCount === 0}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FilterPopover;
