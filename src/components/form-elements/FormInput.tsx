import { FC } from 'react';
import { Controller, Control } from 'react-hook-form';
import { Input } from '../ui/input';

interface FormInputProps {
  name: string;
  control: Control;
  label: string;
  max?: number;
  type?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean; // Add a disabled prop
  isRequired?: boolean; // Add a disabled prop
}

const FormInput: FC<FormInputProps> = ({ name, control, label, max, type = 'text', error, placeholder, disabled, isRequired = false }) => (
  <div className="form-group">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {isRequired && <span className="text-gray-600">*</span>}
    </label>
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Input
          {...field}
          type={type}
          placeholder={placeholder}
          max={max}
          className="input border text-gray-600 border-gray-300"
          disabled={disabled} // Pass the disabled prop here
        />
      )}
    />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

export default FormInput;
