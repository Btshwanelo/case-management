import React from 'react';
import { toast } from 'react-toastify';
import { CircleCheckBig, Send, X } from 'lucide-react';

const MessageToast = ({ message }) => (
  <div className="flex items-start gap-3 min-w-[300px] bg-white text-black p-4 rounded border border-gray-400">
    <div className="flex-1 flex items-start gap-3">
      <div className="w-5 h-5 flex-shrink-0 mt-0.5">
        <Send className="text-red-500" />
      </div>
      <div>{message}</div>
    </div>
    <button onClick={() => toast.dismiss()} className="text-black/80 hover:text-black">
      <X className="w-5 h-5" />
    </button>
  </div>
);

// Keep track of active toasts to prevent duplicates
let activeToasts = new Set();

// Utility function to show the error toast
export const showMessageToast = (message?: string) => {
  if (!message) {
    return;
  }
  // If this message is already being shown, don't show it again
  if (activeToasts.has(message)) {
    return;
  }

  // Add message to active toasts
  activeToasts.add(message);

  toast(<MessageToast message={message} />, {
    position: 'top-right',
    autoClose: 20000,
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

export default MessageToast;
