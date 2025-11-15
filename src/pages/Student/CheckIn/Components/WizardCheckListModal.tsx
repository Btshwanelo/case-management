import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface WizardChecklistProps {
  isSelfieDone?: boolean;
  isRoomPictureDone?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmUpload?: boolean;
}

const WizardChecklistDialog = ({
  isSelfieDone = false,
  isRoomPictureDone = false,
  onConfirm,
  onCancel,
  confirmUpload = false,
}: WizardChecklistProps) => (
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <div className="flex items-center">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
        <DialogTitle className="text-left">Property viewing</DialogTitle>
      </div>
    </DialogHeader>

    <div className="flex flex-col space-y-4">
      {/* Illustration */}
      <div className="flex justify-center">
        <img src={illustrationSrc} alt="property viewing process illustration" className="max-w-full h-auto" />
      </div>

      {/* Instructions */}
      {!confirmUpload && <p className="text-muted-foreground py-2">This should take around 1-3 mins, you'll need:</p>}

      {/* Checklist Items */}
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Checkbox id="selfie-check" checked={isSelfieDone} disabled className="mt-1" />
          <Label
            htmlFor="selfie-check"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            To take a selfie using your phone
          </Label>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox id="room-check" checked={isRoomPictureDone} disabled className="mt-1" />
          <Label
            htmlFor="room-check"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            To take some pictures of the room you'll be staying in
          </Label>
        </div>
      </div>

      {/* Action Button */}
      <Button className="w-full mt-4" onClick={onConfirm}>
        {confirmUpload ? 'Upload' : 'Next'}
      </Button>
    </div>
  </DialogContent>
);

// Hook for managing the dialog state
const useWizardChecklist = () => {
  const [open, setOpen] = React.useState(false);
  const [config, setConfig] = React.useState<Omit<WizardChecklistProps, 'open'>>({
    onConfirm: () => {},
  });

  const show = (props: Omit<WizardChecklistProps, 'open'>) => {
    setConfig(props);
    setOpen(true);
  };

  const hide = () => {
    setOpen(false);
    config.onCancel?.();
  };

  const component = (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && hide()}>
      <WizardChecklistDialog {...config} onCancel={hide} />
    </Dialog>
  );

  return { show, hide, component };
};

export { useWizardChecklist };

// Example usage with the hook
const ExampleUsage = () => {
  const wizardChecklist = useWizardChecklist();

  const showStatusModal = () => {
    wizardChecklist.show({
      onConfirm: () => {
        wizardChecklist.hide();
      },
      onCancel: () => {
        console.log('Cancelled');
      },
    });
  };

  return (
    <>
      <Button onClick={showStatusModal}>Open Checklist</Button>
      {wizardChecklist.component}
    </>
  );
};
