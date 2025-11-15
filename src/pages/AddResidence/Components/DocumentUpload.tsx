import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChevronRight, Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import useResidence from '@/hooks/useResidence';

const DocumentUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const residenceDetails = useResidence();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    setUploadedFiles((prev) => [...prev, ...imageFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const isMinimumMet = uploadedFiles.length >= 4;

  return (
    <div className="lg:col-span-9">
      <Card>
        <CardHeader>
          <CardTitle>John Doe - Images</CardTitle>
          <CardDescription>Upload images of your property</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Required Images Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please upload pictures of facility including:
              <ul className="list-disc ml-6 mt-2">
                <li>Outdoor</li>
                <li>Room / Bedroom</li>
                <li>Kitchen / Kitchenette</li>
                <li>Bathroom</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Upload Area */}
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 transition-colors',
              isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-200',
              'text-center cursor-pointer'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Input id="file-input" type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-10 w-10 text-orange-500" />
              <h3 className="font-semibold">Upload your attachments</h3>
              <p className="text-sm text-gray-500">Drag and drop or click to upload (Minimum of 4 images)</p>
            </div>
          </div>

          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="relative group border rounded-lg p-2 bg-gray-50">
                  <div className="aspect-square rounded-lg overflow-hidden">
                    <img src={URL.createObjectURL(file)} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <p className="mt-2 text-xs text-gray-500 truncate">{file.name}</p>
                </div>
              ))}
            </div>
          )}

          {/* Upload Status */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{uploadedFiles.length} / 4 images uploaded</span>
            {!isMinimumMet && <span className="text-orange-500">{4 - uploadedFiles.length} more required</span>}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button variant="outline">Back</Button>
            <Button className="bg-orange-500 hover:bg-orange-600" disabled={!isMinimumMet}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentUpload;
