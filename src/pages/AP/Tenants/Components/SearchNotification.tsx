// components/tenant/SearchNotification.tsx
import React from 'react';
import { X } from 'lucide-react';

interface SearchNotificationProps {
  searchText: string;
  onClear: () => void;
  isVisible: boolean;
}

const SearchNotification: React.FC<SearchNotificationProps> = ({ searchText, onClear, isVisible }) => {
  if (!isVisible || !searchText) return null;

  return (
    <div className="bg-blue-100 px-6 py-2 rounded-lg text-blue-600 font-semibold flex justify-between">
      <div>
        <span className="text-black">Showing search results for </span> {searchText}
      </div>
      <X className="text-red-500 cursor-pointer" onClick={onClear} />
    </div>
  );
};

export default SearchNotification;
