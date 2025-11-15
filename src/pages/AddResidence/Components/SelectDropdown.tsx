import { FC } from 'react';
import { Controller, Control } from 'react-hook-form';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Label } from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';

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
  onChange?: (option: Option | null) => void; // Add this prop
}

const SelectDropdown: FC<SelectDropdownProps> = ({
  name,
  control,
  label,
  options,
  error,
  required,
  disabled,
  readOnly,
  placeholder = 'Select an option',
  classNames = {},
  onChange,
}) => (
  <div className="form-group">
    {label && <Label className="block text-sm font-medium text-gray-700 mb-1">{label}</Label>}
    <Controller
      name={name}
      rules={{ required: required && 'This field is required' }}
      control={control}
      render={({ field: { value, onChange: fieldOnChange, disabled: fieldDisabled } }) => (
        <Select
          disabled={disabled || fieldDisabled}
          value={value}
          onValueChange={(val) => {
            fieldOnChange(val);
            // Find the selected option and pass it to the onChange handler
            if (onChange) {
              const selectedOption = options.find((opt) => opt.value === val) || null;
              onChange(selectedOption);
            }
          }}
        >
          <SelectTrigger className="w-full" disabled={disabled || readOnly}>
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
