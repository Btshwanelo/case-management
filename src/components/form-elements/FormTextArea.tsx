import { FC } from 'react';
import { Controller, Control } from 'react-hook-form';
import { Textarea } from '../ui/textarea'; // Adjust the import path based on your project

interface FormTextAreaProps {
  name: string;
  control: Control;
  label: string;
  error?: string;
  placeholder?: string;
  rows?: number;
}

const FormTextArea: FC<FormTextAreaProps> = ({ name, control, label, error, placeholder, rows = 4 }) => (
  <div className="form-group">
    <label className="block text-sm font-medium mb-1">{label}</label>
    <Controller
      name={name}
      control={control}
      render={({ field }) => <Textarea {...field} placeholder={placeholder} rows={rows} className="textarea" />}
    />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

export default FormTextArea;
