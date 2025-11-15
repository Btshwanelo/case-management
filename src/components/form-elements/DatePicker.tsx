import { FC } from 'react';
import { Controller, Control } from 'react-hook-form';

interface DatePickerProps {
  name: string;
  control: Control;
  label: string;
  error?: string;
}

const DatePicker: FC<DatePickerProps> = ({ name, control, label, error }) => (
  <div className="form-group">
    <label>{label}</label>
    <Controller name={name} control={control} render={({ field }) => <input {...field} type="date" className="input" />} />
    {error && <p className="error-text">{error}</p>}
  </div>
);

export default DatePicker;
