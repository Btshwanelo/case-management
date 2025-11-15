import { FC, useState } from 'react';
import { Controller, Control } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  name: string;
  control: Control;
  label: string;
  options: Option[];
  error?: string;
  placeholder?: string;
}

const SearchableSelect: FC<SearchableSelectProps> = ({ name, control, label, options, error, placeholder = 'Search...' }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter options based on search term
  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="form-group">
      <label>{label}</label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 pb-2">
                <Input placeholder={placeholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              {filteredOptions.map((option, i) => (
                <SelectItem key={i} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default SearchableSelect;
