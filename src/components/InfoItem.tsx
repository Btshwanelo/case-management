import React, { useState } from 'react';
import { Copy, CheckCircle2, Phone, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const InfoItem = ({ icon: Icon, label, value }) => {
  const [copied, setCopied] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const isPhoneNumber = label === 'Contact Number';
  const isEmail = label === 'Email';
  const isContactType = isPhoneNumber || isEmail;

  const handleCopy = async () => {
    if (isContactType) {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setShowAlert(true);

        setTimeout(() => {
          setCopied(false);
          setShowAlert(false);
        }, 2000);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    }
  };

  const handleAction = (e) => {
    e.stopPropagation();
    if (isPhoneNumber) {
      window.location.href = `tel:${value.replace(/\s+/g, '')}`;
    } else if (isEmail) {
      window.location.href = `mailto:${value}`;
    }
  };

  const getActionIcon = () => {
    if (isPhoneNumber) {
      return <Phone className="h-6 w-6 text-green-500 hover:text-green-600 cursor-pointer" onClick={handleAction} />;
    } else if (isEmail) {
      return <Mail className="h-6 w-6 text-green-500 hover:text-green-600 cursor-pointer" onClick={handleAction} />;
    }
    return <Icon className="h-6 w-6 text-green-500" />;
  };

  const getAlertMessage = () => {
    if (isPhoneNumber) return 'Phone number copied to clipboard';
    if (isEmail) return 'Email address copied to clipboard';
    return '';
  };

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-4 ${isContactType ? 'cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors' : ''}`}
        onClick={handleCopy}
      >
        {getActionIcon()}

        <div className="flex-grow overflow-x-auto">
          <p className="text-gray-600">{label}</p>
          <div className="flex items-center gap-2">
            <p className="font-medium">{value}</p>
            {isContactType && (
              <Copy className={`h-4 w-4 ${copied ? 'text-green-500' : 'text-gray-400'} hover:text-gray-600 cursor-pointer`} />
            )}
          </div>
        </div>
      </div>

      {showAlert && (
        <div className="absolute bottom-full left-0 mb-2 w-full">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">{getAlertMessage()}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default InfoItem;
