import React, { useEffect, useState } from 'react';
import { Eye, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FilePreviewModal from '@/components/FilePreviewModal';
import { usePreviewDocumentReqMutation } from '@/services/genericService';
import useCurrentUser from '@/hooks/useCurrentUser';
import { showErrorToast } from './ErrorToast ';
import PDFIcon from '@/assets/pdf-icon-type.png';
import ImageIcon from '@/assets/image-icon-type.png';
import DocIcon from '@/assets/doc-icon-type.png';

interface FileUploadInputProps {
  label: string;
  DocumentTypeId: number;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  entityName?: string;
  required?: boolean;
  error?: any;
}

const FileUploadInput: React.FC<FileUploadInputProps> = ({
  label,
  DocumentTypeId,
  value,
  onChange,
  disabled = false,
  entityName,
  required = false,
  error,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const userDetails = useCurrentUser();

  const [PreviewDocumentReq, PreviewDocumentReqProps] = usePreviewDocumentReqMutation();

  // Function to get the appropriate file icon based on file extension
  const getFileIcon = (fileName: string | undefined): string => {
    if (!fileName) return DocIcon;

    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return PDFIcon;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp':
      case 'svg':
        return ImageIcon;
      case 'doc':
      case 'docx':
      case 'txt':
      case 'rtf':
      case 'odt':
        return DocIcon;
      case 'xlsx':
      case 'xls':
      case 'csv':
        return DocIcon;
      default:
        return DocIcon;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Content = reader.result?.toString().split(',')[1];
      if (base64Content) {
        onChange({
          FileName: file.name,
          DocumentTypeId: DocumentTypeId,
          FileExtention: file.name.split('.').pop(),
          FileContent: base64Content,
          ...(value?.RecordId ? { RecordId: value.RecordId } : {}),
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    onChange({});
  };

  const handlePreviewDoc = (recordId: any) => {
    PreviewDocumentReq({
      body: {
        entityName: userDetails.relatedObjectIdObjectTypeCode,
        requestName: 'PreviewDocumentReq',
        RecordId: recordId,
      },
    });
  };

  async function urlToBase64(fileUrl: string): Promise<string> {
    const response = await fetch(fileUrl);
    const blob = await response.blob();

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };

      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  useEffect(() => {
    if (PreviewDocumentReqProps.isSuccess) {
      (async () => {
        try {
          const base64String = await urlToBase64(PreviewDocumentReqProps?.data?.Document?.url);
          setFileUrl(base64String);
          setShowPreview(true);
        } catch (error) {
          showErrorToast('Error converting to base64');
          console.error('Error converting to base64:', error);
        }
      })();
    }
  }, [PreviewDocumentReqProps.isSuccess]);

  useEffect(() => {
    if (PreviewDocumentReqProps.isError) {
      showErrorToast('Error downloading File.');
    }
  }, [PreviewDocumentReqProps.isError]);

  const openPreview = () => {
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  const hasFile = value && value.FileName;
  const isLoadingPreview = PreviewDocumentReqProps.isLoading;
  const hasError = !!error;

  return (
    <div className="space-y-3 w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Responsive container */}
      <div className="w-full">
        {/* File info section - add red border if error */}
        <div className={`border rounded-lg p-3 sm:p-4 ${hasError ? 'border-red-500' : 'border-[#E9EAEB]'}`}>
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <img
                src={getFileIcon(hasFile ? value.FileName : undefined)}
                alt={hasFile ? `${value.FileExtention?.toUpperCase()} file icon` : 'file icon'}
                className="mr-3 w-6 h-6 sm:w-8 sm:h-8"
              />
            </div>
            {/* File name section - full width on mobile */}
            <div className="flex-1 min-w-0 pr-0 sm:pr-4">
              <p className="text-sm font-medium text-[#181D27] truncate">{hasFile ? value.FileName : 'No file selected'}</p>
              {hasFile && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mt-1">
                  <p className="text-sm text-[#535862]">{value.FileExtention?.toUpperCase()}</p>
                </div>
              )}
            </div>

            {/* Action buttons - responsive layout */}
            <div className="flex gap-2 flex-row">
              {hasFile && value.RecordId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePreviewDoc(value.RecordId)}
                  disabled={disabled || isLoadingPreview}
                  className="w-full sm:w-auto flex items-center rounded-lg border px-[14px] py-[10px] bg-[#fff] text-[#414651] shadow-sm justify-center gap-2 border-[#D5D7DA]"
                >
                  {isLoadingPreview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                  <span className="sm:hidden">Preview</span>
                  <span className="hidden sm:inline">Preview</span>
                </Button>
              )}

              {/* Local preview for newly uploaded files */}
              {hasFile && !value.RecordId && value.FileContent && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openPreview}
                  disabled={disabled}
                  className="w-full sm:w-auto flex items-center rounded-lg border px-[14px] py-[10px] bg-[#FF692E] text-white shadow-sm justify-center gap-2 border-[#D5D7DA]"
                >
                  <Eye className="h-4 w-4" />
                  <span className="sm:hidden">Preview</span>
                  <span className="hidden sm:inline">Preview</span>
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById(`file-input-${DocumentTypeId}`)?.click()}
                disabled={disabled}
                className="w-full sm:w-auto flex items-center rounded-lg hover:bg-[#FF692E] hover:text-white border-2 px-[14px] py-[10px] bg-[#FF692E] text-white shadow-sm justify-center gap-2 border-[#ffffff1f]"
              >
                <Upload className="h-4 w-4" />
                <span className="sm:hidden">{hasFile ? 'Replace' : 'Upload'}</span>
                <span className="hidden sm:inline">{hasFile ? 'Replace' : 'Upload'}</span>
              </Button>

              {/* {hasFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFile}
                  disabled={disabled}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span className="sm:hidden">Remove</span>
                  <span className="hidden sm:inline">Remove</span>
                </Button>
              )} */}
            </div>
          </div>
        </div>

        {/* Upload area for when no file is selected - add red border if error */}
        {!hasFile && (
          <div
            className={`mt-3 border-2 border-dashed rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 transition-colors cursor-pointer ${
              hasError ? 'border-red-500 hover:border-red-600' : 'border-gray-300'
            }`}
            onClick={() => document.getElementById(`file-input-${DocumentTypeId}`)?.click()}
          >
            <div className="flex flex-col items-center space-y-2">
              <Upload className={`h-6 w-6 sm:h-8 sm:w-8 ${hasError ? 'text-red-400' : 'text-gray-400'}`} />
              <div className="text-sm text-gray-600">
                <span className="font-medium text-blue-600 hover:text-blue-500">Tap to upload</span>
                <span className="hidden sm:inline"> or drag and drop</span>
              </div>
              <p className="text-xs text-gray-500 px-2 text-center">PDF, DOC, DOCX, JPG, PNG files supported</p>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoadingPreview && (
          <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Loading preview...
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        id={`file-input-${DocumentTypeId}`}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xlsx,.xls"
      />

      {/* Preview Modal */}
      {showPreview && hasFile && (
        <FilePreviewModal
          fileContent={fileUrl || value.FileContent}
          fileName={value.FileName}
          fileExtension={PreviewDocumentReqProps?.data?.Document?.fileExtention || value.FileExtention}
          onClose={closePreview}
        />
      )}
    </div>
  );
};

export default FileUploadInput;
