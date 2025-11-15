// components/tenant/TenantHeader.tsx
import React, { useState } from 'react';
import { Search, X, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListingActionFilter, TenantFilter } from '@/types/tenant';
import { createNewFilterArray } from '@/utils/helpers';

interface TenantHeaderProps {
  onSearchChange: (searchText: string) => void;
  onSearchClick: () => void;
  onExport: () => void;
  onApplyFilter: (filters: TenantFilter[]) => void;
  onBulkActionChange: (action: string) => void;
  searchText: string;
  bulkActionState: {
    actions: { actionName: string; actionId: string }[];
    selectedAction: string;
  };
  listingActionFilters?: ListingActionFilter[];
  isLoadingExport?: boolean;
}

const TenantHeader: React.FC<TenantHeaderProps> = ({
  onSearchChange,
  onSearchClick,
  onExport,
  onApplyFilter,
  onBulkActionChange,
  searchText,
  bulkActionState,
  listingActionFilters = [],
  isLoadingExport = false,
}) => {
  const [isSearch, setIsSearch] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const handleSearch = () => {
    setIsSearch(!isSearch);
    onSearchClick();
  };

  const handleClearSearch = () => {
    onSearchChange('');
    setIsSearch(false);
  };

  const handleStatusFilterChange = (value: string) => {
    const bulkActionFilters = listingActionFilters.filter((action) => action.isBulkAction);

    if (bulkActionFilters.length === 0) return;

    const action = bulkActionFilters[0];
    const filteredItem = action.actionFilters.find((item) => item.filterName === value);

    if (filteredItem) {
      const filters = action.actionFilters
        .filter((item) => item.filterName === value)
        .map((item) => ({
          PortalListingId: action.portalListingId,
          ActionFilterId: item.portalListingFilterId,
        }));

      onApplyFilter(filters);
      onBulkActionChange(filteredItem.filterName);
    }

    setStatusFilter(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex">
        <div className="mr-auto">
          <h2 className="text-lg font-semibold">All Tenants</h2>
          <p className="text-sm text-gray-500">View and manage your property tenants</p>
        </div>
        <div>
          <Button variant="default" type="button" onClick={onExport} disabled={isLoadingExport}>
            <Download /> Export
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-2">
        <div className="flex flex-row gap-2 w-full md:w-1/3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search tenants"
              className="pl-10 pr-8"
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchText && (
              <button onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-75 transition-opacity">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>
          <Button variant="outline" className="bg-orange-500 hover:bg-orange-600" onClick={handleSearch}>
            <Search className="h-4 w-4 text-white" />
          </Button>
        </div>

        <div className="flex flex-row gap-2">
          {listingActionFilters.map(
            (action, index) =>
              action.isBulkAction && (
                <Select key={index} value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={action.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {action.actionFilters.map((filter) => (
                      <SelectItem key={filter.portalListingFilterId} value={filter.filterName}>
                        {filter.filterName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
          )}

          {bulkActionState.actions.length > 0 && (
            <Select value={bulkActionState.selectedAction} onValueChange={onBulkActionChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Bulk Action" />
              </SelectTrigger>
              <SelectContent>
                {bulkActionState.actions.map((action) => (
                  <SelectItem key={action.actionName} value={action.actionName}>
                    {action.actionName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantHeader;
