import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

const PDFViewer = ({ base64Content, onClose }) => {
  const pdfUrl = `data:application/pdf;base64,${base64Content}`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full">
      <CardContent className="px-6 py-2">
        <div className="flex justify-end mb-1">
          {/* <Button 
            onClick={handleDownload}
            variant="outline"
            className="flex gap-2 items-center"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button> */}
          <Button
            onClick={onClose}
            variant="ghost"
            // className="flex gap-2 bg-orange-500 hover:bg-orange-500 hover:text-white text-white items-center"
          >
            <X className="h-4 w-4" />
            {/* Close{' '} */}
          </Button>
        </div>

        <iframe src={pdfUrl} className="w-full h-[800px] border rounded-lg" title="PDF Viewer" />
      </CardContent>
    </Card>
  );
};

export default PDFViewer;
