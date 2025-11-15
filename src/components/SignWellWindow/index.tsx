import React, { useEffect } from 'react';
import { Dialog, DialogPortal } from '@/components/ui/dialog';

const SignWellWindow = ({ url, show, onClose }: { url: string; show: boolean; onClose: () => void }) => {
  const isOpenedRef = React.useRef(false);

  useEffect(() => {
    if (isOpenedRef.current || !show || !url) {
      return;
    }

    // Initialize SignWell embed
    const signWellEmbed: any = new (window as any).SignWellEmbed({
      url,
      events: {
        completed: (e: any) => {
          console.log('completed event: ', e);
          // window.location.reload();
        },
        closed: (e: any) => {
          console.log('closed event: ', e);
          onClose();
        },
      },
    });

    signWellEmbed.open();
    isOpenedRef.current = true;
  }, [url, show, onClose]);

  if (!show) {
    return null;
  }

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogPortal>
        {/* Empty content as SignWell handles the UI */}
        &nbsp;
      </DialogPortal>
    </Dialog>
  );
};

export default SignWellWindow;
