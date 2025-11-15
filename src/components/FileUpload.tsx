import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

interface FileUploadValue {
  FileName?: string;
  DocumentTypeId?: string | number;
  FileExtention?: string;
  FileContent?: string;
  RecordId?: string;
}

interface FileUploadInputProps {
  label?: string;
  name?: string;
  value?: string | FileUploadValue;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  DocumentTypeId?: string | number;
  disabled?: boolean;
  required?: boolean;
  ref?: React.Ref<HTMLInputElement>;
}

const FileUploadInput = forwardRef<HTMLInputElement, FileUploadInputProps>(
  ({ label, name, value, onChange, onBlur, DocumentTypeId, disabled = false, required = false }, ref) => {
    const [fileLabel, setFileLabel] = useState<string>('Upload file');
    const [fileValue, setFileValue] = useState<FileUploadValue | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (typeof value === 'object' && value?.FileName) {
        setFileValue(value as FileUploadValue);
        setFileLabel(`${value.FileName}`);
      } else if (typeof value === 'string' && value != '' && value != null) {
        setFileLabel(`${value}`);
      }
    }, [value]);

    const convertFileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const base64String = reader.result as string;
          // Remove the data URL prefix
          const base64Content = base64String.split(',')[1];
          resolve(base64Content);
        };
        reader.onerror = reject;
      });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        alert('File size exceeds 2MB limit');
        e.target.value = '';
        return;
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        alert('Invalid file type. Please upload a PDF or image file');
        e.target.value = '';
        return;
      }

      try {
        const base64Content = await convertFileToBase64(file);
        const FileName = file.name.split('.').slice(0, -1).join('.');
        const FileExtention = file.name.split('.').pop() || '';

        const newValue: FileUploadValue = {
          FileName,
          DocumentTypeId,
          FileExtention,
          FileContent: base64Content,
          RecordId: fileValue?.RecordId,
        };

        setFileValue(newValue);
        setFileLabel(file.name);
        onChange?.({
          target: {
            name,
            value: newValue,
          },
        });
      } catch (error) {
        console.error('Error processing file:', error);
        alert('Error processing file');
      }
    };

    const handleUploadClick = () => {
      fileInputRef.current?.click();
    };

    const handleCopy = () => {
      if (fileLabel && fileLabel !== 'Upload file') {
        navigator.clipboard.writeText(fileLabel);
      }
    };

    return (
      <FormItem>
        {label && (
          <FormLabel>
            {label}
            {required && ' *'}
          </FormLabel>
        )}
        <FormControl>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input value={fileLabel} readOnly className={cn('pr-20', fileLabel === 'Upload file' && 'text-muted-foreground')} />
              <Input
                type="file"
                ref={fileInputRef}
                name={name}
                onChange={handleFileChange}
                onBlur={onBlur}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                disabled={disabled}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="lg" onClick={handleUploadClick} disabled={disabled} type="button">
                <Upload className="h-4 w-4" /> Upload
              </Button>
            </div>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  }
);

FileUploadInput.displayName = 'FileUploadInput';

export default FileUploadInput;
