import React from 'react';
import { toast } from 'react-toastify';
import { CircleCheckBig, X } from 'lucide-react';

const SuccessToast = ({ message }) => (
  <div className="flex items-start gap-3 min-w-[300px] bg-green-700 text-white p-4 rounded-xl">
    <div className="flex-1 flex items-start gap-3">
      <div className="w-5 h-5 flex-shrink-0 mt-0.5">
        <CircleCheckBig />
      </div>
      <div>{message}</div>
    </div>
    <button onClick={() => toast.dismiss()} className="text-white/80 hover:text-white">
      <X className="w-5 h-5" />
    </button>
  </div>
);

// Keep track of active toasts to prevent duplicates
let activeToasts = new Set();

// Utility function to show the error toast
export const showSuccessToast = (message?: string) => {
  if (!message) {
    return;
  }
  // If this message is already being shown, don't show it again
  if (activeToasts.has(message)) {
    return;
  }

  // Add message to active toasts
  activeToasts.add(message);

  toast(<SuccessToast message={message} />, {
    position: 'top-right',
    autoClose: 10000,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    closeButton: false,
    className: '!p-0 !bg-transparent !shadow-none',
    onClose: () => {
      // Remove message from active toasts when toast is closed
      activeToasts.delete(message);
    },
  });
};

export default SuccessToast;
