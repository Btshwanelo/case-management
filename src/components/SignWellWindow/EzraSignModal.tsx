import React, { useEffect, useRef, useCallback } from 'react';

interface EzraSignModalProps {
  show: boolean;
  url: string;
  width?: string;
  height?: string;
  onCompleted?: (data: any) => void;
  onClose?: () => void;
  onError?: (error: any) => void;
}

const EzraSignModal: React.FC<EzraSignModalProps> = ({ show, url, width = '90%', height = '90%', onCompleted, onClose, onError }) => {
  const ezraSignRef = useRef<any>(null);
  const isOpenRef = useRef(false);
  const previousShowRef = useRef(false);

  // Memoize callbacks to prevent unnecessary re-renders
  const handleCompleted = useCallback(
    (data: any) => {
      onCompleted?.(data);
      // EzraSign will automatically close after completion
    },
    [onCompleted]
  );

  const handleClosed = useCallback(() => {
    isOpenRef.current = false;
    onClose?.();
  }, [onClose]);

  const handleError = useCallback(
    (error: any) => {
      onError?.(error);
    },
    [onError]
  );

  // Handle opening and closing the modal
  useEffect(() => {
    // Only act when show prop actually changes
    if (show === previousShowRef.current) return;
    previousShowRef.current = show;

    if (show && url) {
      // Open modal
      if (!isOpenRef.current) {
        try {
          ezraSignRef.current = new (window as any).EzraSign.Embed({
            width,
            height,
            onCompleted: handleCompleted,
            onClosed: handleClosed,
            onError: handleError,
          });

          ezraSignRef.current.open(url);
          isOpenRef.current = true;
        } catch (error) {
          console.error('Failed to open EzraSign modal:', error);
          handleError(error);
        }
      }
    } else if (!show && isOpenRef.current && ezraSignRef.current) {
      // Close modal - use the new close method with false to prevent callback loop
      try {
        ezraSignRef.current.close(false); // Don't trigger onClosed callback
        isOpenRef.current = false;
      } catch (error) {
        console.error('Failed to close EzraSign modal:', error);
      }
      ezraSignRef.current = null;
    }
  }, [show, url, width, height, handleCompleted, handleClosed, handleError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ezraSignRef.current && isOpenRef.current) {
        try {
          ezraSignRef.current.close(false); // Don't trigger callback on cleanup
        } catch (error) {
          console.error('Failed to cleanup EzraSign modal:', error);
        }
        ezraSignRef.current = null;
        isOpenRef.current = false;
      }
    };
  }, []);

  return null;
};

export default EzraSignModal;
