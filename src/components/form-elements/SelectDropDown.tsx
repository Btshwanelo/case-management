import { FC } from 'react';
import { Controller, Control } from 'react-hook-form';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'; // Adjust the import path based on your ShadCN setup
import { Label } from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';
import { StarIcon } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SelectDropdownProps {
  name: string;
  control: Control<any>;
  label?: string;
  options: Option[];
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  classNames?: {
    errorMessage?: string;
  };
  isRequired?: boolean;
}

const SelectDropdown: FC<SelectDropdownProps> = ({
  name,
  control,
  label,
  options,
  error,
  required,
  disabled,
  isRequired,
  readOnly,
  placeholder = 'Select an option',
  classNames = {},
}) => (
  <div className="form-group">
    {label && (
      <Label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {isRequired && <span className="text-gray-600">*</span>}
      </Label>
    )}
    <Controller
      name={name}
      rules={{ required: required && 'This field is required' }}
      control={control}
      render={({ field: { value, onChange, disabled } }) => (
        <Select disabled={disabled} value={value} onValueChange={(val) => onChange(val)}>
          <SelectTrigger className="w-full border border-gray-300" disabled={disabled || readOnly}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
    {error && <p className={cn('text-red-500 text-xs mt-1', classNames.errorMessage)}>{error}</p>}
  </div>
);

export default SelectDropdown;
