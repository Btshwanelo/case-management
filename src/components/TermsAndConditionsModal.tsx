import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { showSuccessToast } from './SuccessToast';

interface TermsModalProps {
  isOpen: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  onAcceptTerms: () => void;
  pdfUrl: string;
}

const TermsAndConditionsModal = ({ isOpen, onAcceptTerms, isSuccess, isLoading, pdfUrl }: TermsModalProps) => {
  const navigate = useNavigate();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAccept = async () => {
    if (!isChecked) return;

    try {
      setIsAccepting(true);
      await onAcceptTerms();
    } catch (error) {
      console.error('Failed to accept terms:', error);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = () => {
    navigate('/login');
  };

  if (isSuccess) {
    showSuccessToast('Terms and Conditions accepted');
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent className="w-full max-w-4xl mx-auto p-4 md:p-6 rounded-none" showClose={false}>
        <DialogHeader className="space-y-2 md:space-y-4">
          <DialogTitle className="text-xl md:text-2xl font-semibold">Terms and Conditions</DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            Please read and accept our terms and conditions to continue using the application.
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full h-[40vh] md:h-[60vh] mt-4 md:mt-6">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80">
              <Spinner size="large" />
            </div>
          )}

          <ScrollArea className="h-full rounded-none border bg-gray-50">
            <iframe src={`${pdfUrl}#toolbar=0`} className="w-full h-full" style={{ minHeight: isMobile ? '300px' : '800px' }} />
          </ScrollArea>
        </div>

        <div className="flex items-start md:items-center space-x-3 py-4">
          <Checkbox
            id="terms"
            checked={isChecked}
            onCheckedChange={(checked) => setIsChecked(checked as boolean)}
            className="mt-1 md:mt-0"
          />
          <Label htmlFor="terms" className="text-sm md:text-base font-medium leading-relaxed md:leading-none">
            I have read and agree to the terms and conditions
          </Label>
        </div>

        <DialogFooter className="flex flex-col-reverse md:flex-row gap-4 mt-4 md:mt-6">
          <Button variant="destructive" onClick={handleDecline} className="w-full md:w-auto">
            Decline and Logout
          </Button>
          <Button
            className="w-full md:w-auto bg-orange-500 hover:bg-orange-600"
            onClick={handleAccept}
            disabled={isAccepting || !isChecked}
          >
            {isAccepting ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner size="small" />
                <span>Accepting...</span>
              </div>
            ) : (
              'Accept Terms'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAndConditionsModal;
