import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Download, ExternalLink, Eye, FileText, Smartphone } from 'lucide-react';

interface FilePreviewModalProps {
  fileContent: string; // base64 string
  fileName: string;
  fileExtension: string;
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ fileContent, fileName, fileExtension, onClose }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  const isPdf = fileExtension?.toLowerCase() === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension?.toLowerCase());

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);

      // Show warning for PDF on mobile
      if ((isMobileDevice || isSmallScreen) && isPdf) {
        setShowMobileWarning(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isPdf]);

  // Convert base64 to Blob URL
  const fileUrl = useMemo(() => {
    if (!fileContent) return '';

    if (isPdf) {
      const byteArray = Uint8Array.from(atob(fileContent), (char) => char.charCodeAt(0));
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      return URL.createObjectURL(blob);
    }

    if (isImage) {
      return `data:image/${fileExtension.toLowerCase()};base64,${fileContent}`;
    }

    return `data:application/octet-stream;base64,${fileContent}`;
  }, [fileContent, fileExtension]);

  // Cleanup blob URL
  useEffect(() => {
    return () => {
      if (isPdf && fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl, isPdf]);

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(fileUrl, '_blank');
  };

  // Mobile PDF Warning Component
  const MobilePdfWarning = () => (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <Smartphone className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-amber-800 mb-1">Mobile PDF Viewing</h4>
          <p className="text-xs text-amber-700 mb-3">
            PDF preview may not work properly on mobile devices. For the best experience, try one of these options:
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleOpenInNewTab}
              size="sm"
              variant="outline"
              className="flex items-center gap-2 text-amber-700 border-amber-300 hover:bg-amber-100"
            >
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </Button>
            <Button
              onClick={handleDownload}
              size="sm"
              variant="outline"
              className="flex items-center gap-2 text-amber-700 border-amber-300 hover:bg-amber-100"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
        <Button
          onClick={() => setShowMobileWarning(false)}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-amber-600 hover:text-amber-800"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // PDF Viewer Component
  const PdfViewer = () => {
    if (isMobile) {
      return (
        <div className="h-full flex flex-col">
          {/* {showMobileWarning && <MobilePdfWarning />} */}

          {/* Try to show PDF anyway, but with fallback */}
          <div className="flex-1 relative">
            <iframe
              src={`${fileUrl}#view=FitH`}
              className="w-full h-full border-0 rounded-lg"
              title="PDF Viewer"
              onError={() => {
                // If iframe fails, show download option
                console.log('PDF iframe failed to load');
              }}
            />

            {/* Overlay for better mobile experience */}
            <div className="absolute inset-0 bg-transparent" />
          </div>

          {/* Mobile-specific actions */}
          <div className="mt-4 flex gap-2">
            <Button onClick={handleOpenInNewTab} className="flex-1 flex items-center justify-center gap-2" variant="outline">
              <ExternalLink className="h-4 w-4" />
              Open in Browser
            </Button>
            <Button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      );
    }

    // Desktop PDF viewer
    return (
      <div className="w-full h-full min-h-[80vh] sm:min-h-[80vh]">
        <iframe
          src={`${fileUrl}#view=FitH`}
          className="w-full h-[80vh] border-0 sm:border rounded-none"
          title="PDF Viewer"
          style={{ minHeight: '50vh' }}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4" onClick={onClose}>
      <Card
        className={`w-full ${isMobile ? 'max-w-full h-full' : 'max-w-7xl max-h-[95vh]'} overflow-hidden rounded-none flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-3 sm:p-4 border-b bg-white">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="text-sm sm:text-lg font-medium truncate">{fileName}</h3>
                <p className="text-xs text-gray-500">
                  {fileExtension?.toUpperCase()}
                  {isMobile && isPdf && ' • Mobile View'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {!isMobile && (
                <>
                  <Button
                    onClick={handleOpenInNewTab}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 sm:gap-2"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Open</span>
                  </Button>

                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 sm:gap-2"
                    title="Download file"
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                </>
              )}

              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 text-gray-500 hover:text-gray-700"
                title="Close preview"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Close</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <CardContent className="flex-1 p-2 sm:p-4 overflow-hidden">
          <div className="h-full overflow-auto">
            {isPdf ? (
              <PdfViewer />
            ) : isImage ? (
              <div className="flex items-center justify-center h-full p-2">
                <img
                  src={fileUrl}
                  alt={fileName}
                  className="max-w-full max-h-full object-contain rounded-npne shadow-sm"
                  style={{
                    minHeight: '200px',
                    maxHeight: 'calc(100vh - 200px)',
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <div className="p-6 sm:p-8 border rounded-lg text-center bg-gray-50 max-w-md mx-auto">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="h-8 w-8 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Preview not available</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        This file type ({fileExtension?.toUpperCase()}) cannot be previewed in the browser.
                      </p>
                    </div>
                    <Button onClick={handleDownload} className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download {fileName}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FilePreviewModal;
