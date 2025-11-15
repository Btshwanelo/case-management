/**
 * Adaptation of https://www.jussivirtanen.fi/writing/styling-react-select-with-tailwind
 */

import * as React from 'react';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { components, DropdownIndicatorProps } from 'react-select';

export interface GoogleAutocompleteInputProps extends React.ComponentProps<typeof GooglePlacesAutocomplete> {
  className?: string;
  disabled?: boolean;
  id?: string;
}

const DropdownIndicator = (props: DropdownIndicatorProps) => {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDownIcon className="h-4 w-4" />
    </components.DropdownIndicator>
  );
};

const controlStyles = {
  base: 'flex h-9 w-full border rounded-md border-input bg-transparent pl-2 pr-1 text-sm bg-white hover:cursor-pointer shadow-sm transition-colors',
  focus: 'border-primary-600 ring-1 ring-primary-500 outline-none ring-1 ring-ring',
  nonFocus: 'border-gray-300 hover:border-gray-400',
  disabled: 'cursor-not-allowed hover:cursor-not-allowed opacity-50',
};
const placeholderStyles = 'text-sm';
const selectInputStyles = '';
const valueContainerStyles = 'p-1 gap-1';
const singleValueStyles = 'leading-7 ml-1';
const multiValueStyles = 'bg-gray-100 rounded items-center py-0.5 pl-2 pr-1 gap-1.5';
const multiValueLabelStyles = 'leading-6 py-0.5';
const multiValueRemoveStyles =
  'border border-gray-200 bg-white hover:bg-red-50 hover:text-red-800 text-gray-500 hover:border-red-300 rounded-md';
const indicatorsContainerStyles = 'p-1 gap-1';
const clearIndicatorStyles = 'text-gray-500 p-1 rounded-md hover:bg-red-50 hover:text-red-800';
const indicatorSeparatorStyles = '';
const dropdownIndicatorStyles = 'p-1 hover:bg-gray-100 text-gray-500 rounded-md hover:text-black';
const menuStyles =
  'p-1 mt-2 z-50 max-h-96 min-h-9 min-w-[8rem] shadow-md text-sm overflow-hidden rounded-md border bg-popover text-popover-foreground';
const groupHeadingStyles = 'ml-3 mt-2 mb-1 text-gray-500 text-sm';
const optionStyles = {
  base: 'hover:cursor-pointer px-3 py-2 rounded',
  focus: 'bg-gray-100 active:bg-gray-200',
  selected: "after:content-['✔'] after:ml-2 after:text-green-500 text-gray-500",
};
const noOptionsMessageStyles = 'text-gray-500 p-1';

const GoogleAutocompleteInput = React.forwardRef<HTMLInputElement, GoogleAutocompleteInputProps>(
  ({ className, disabled, id, ...props }, ref) => {
    return (
      <GooglePlacesAutocomplete
        ref={ref as any}
        selectProps={{
          id: props.id,
          unstyled: true,
          isDisabled: disabled,
          components: { DropdownIndicator: DropdownIndicator as any },
          theme: (theme) => ({
            ...theme,
            borderRadius: 6,
          }),
          classNames: {
            control: ({ isFocused, isDisabled }) =>
              cn(isFocused ? controlStyles.focus : controlStyles.nonFocus, controlStyles.base, isDisabled ? controlStyles.disabled : ''),
            placeholder: () => placeholderStyles,
            input: () => selectInputStyles,
            valueContainer: () => valueContainerStyles,
            singleValue: () => singleValueStyles,
            multiValue: () => multiValueStyles,
            multiValueLabel: () => multiValueLabelStyles,
            multiValueRemove: () => multiValueRemoveStyles,
            indicatorsContainer: () => indicatorsContainerStyles,
            clearIndicator: () => clearIndicatorStyles,
            indicatorSeparator: () => indicatorSeparatorStyles,
            dropdownIndicator: () => dropdownIndicatorStyles,
            menu: () => menuStyles,
            groupHeading: () => groupHeadingStyles,
            option: ({ isFocused, isSelected }) =>
              cn(isFocused && optionStyles.focus, isSelected && optionStyles.selected, optionStyles.base),
            noOptionsMessage: () => noOptionsMessageStyles,
          },
        }}
        {...props}
      />
    );
  }
);
GoogleAutocompleteInput.displayName = 'GoogleAutocompleteInput';

export { GoogleAutocompleteInput };
