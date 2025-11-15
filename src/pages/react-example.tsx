import React, { useState } from 'react';
import EzraSignModal from '../components/SignWellWindow/EzraSignModal';

const SignApp: React.FC = () => {
  const [showSigning, setShowSigning] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  console.log('showSigning, setShowSigning', showSigning, setShowSigning);
  console.log('status, setStatus', status, setStatus);
  const handleSign = () => {
    setShowSigning(true);
    setStatus(null);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <button
        onClick={handleSign}
        style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Sign Document
      </button>

      {status && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            borderRadius: '4px',
            backgroundColor: status.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: status.type === 'success' ? '#16a34a' : '#dc2626',
          }}
        >
          {status.message}
        </div>
      )}

      {showSigning && (
        <EzraSignModal
          url="http://192.168.1.227:3000/document/sign.html?token=5dcb93a8ebcc082cb2d729a10f0557e33692d671"
          onCompleted={(data) => {
            setShowSigning(false);
            setStatus({
              message: 'Document signed successfully!',
              type: 'success',
            });
          }}
          show={showSigning}
          onClose={() => {
            setShowSigning(false);
            setStatus({
              message: 'Signing window closed',
              type: 'error',
            });
          }}
          onError={(error) => {
            setShowSigning(false);
            setStatus({
              message: `Error: ${error.message}`,
              type: 'error',
            });
          }}
        />
      )}
    </div>
  );
};

export default SignApp;
