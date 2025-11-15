import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import Logo from '@/assets/logo-black.png';
import { useExecuteRequest1Mutation } from '@/services/apiService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, User2, UserRoundX, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { showErrorToast } from '@/components/ErrorToast ';
import { useDispatch } from 'react-redux';
import { clearAuthData } from '@/slices/authSlice';

const BlockProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [BlockPaymentReq, blockPaymentReqProps] = useExecuteRequest1Mutation();
  const [isBlocked, setIsBlocked] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearAuthData());
    navigate('/login');
  };

  // Get record ID from URL parameters
  const recordId = searchParams.get('id');

  const handleBlockProfileClick = () => {
    if (!recordId) {
      showErrorToast('No record ID provided in URL');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmBlock = () => {
    if (!blockReason.trim()) {
      showErrorToast('Please provide a reason for blocking the profile');
      return;
    }

    BlockPaymentReq({
      body: {
        entityName: 'Supplier',
        requestName: 'BlockPaymentReq',
        recordId: recordId,
        inputParamters: {
          reason: blockReason.trim(),
        },
      },
    });

    setShowConfirmModal(false);
  };

  const handleCancelModal = () => {
    setShowConfirmModal(false);
    setBlockReason('');
  };

  const handleCancel = () => {
    if (!isBlocked) {
      navigate('/');
    } else {
      handleLogout();
    }
  };

  useEffect(() => {
    if (blockPaymentReqProps.isError) {
      showErrorToast(blockPaymentReqProps.error.data || 'Error blocking profile');
    }
  }, [blockPaymentReqProps.isError]);

  useEffect(() => {
    if (blockPaymentReqProps.isSuccess) {
      setIsBlocked(true);
      setBlockReason(''); // Clear reason after successful block
    }
  }, [blockPaymentReqProps.isSuccess]);

  return (
    <div className="min-h-screen">
      <nav className=" md:block  border-b  border-orange-500">
        <div className="container mx-auto px-4 py-4 flex justify-between ">
          <img src={Logo} alt="NSFAS Logo" className="h-8" onClick={() => navigate('/')} />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/`)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </nav>
      <main className="min-h-[calc(100vh-65px)] justify-center flex items-center">
        <div className="max-w-xl w-full text-center space-y-6 mx-2">
          <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-[#FFE6D5] flex items-center justify-center">
            <UserRoundX className="h-6 w-6 text-[#FF692E]" />
          </div>

          <div className="space-y-4">
            {isBlocked ? (
              <>
                <h1 className="text-3xl font-semibold text-gray-700">Profile Successfully Blocked</h1>
                <p className="text-gray-500 text-lg">
                  Your profile has been blocked as a security measure. Our team will review your account and contact you if needed.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-semibold text-gray-700">Block Your Profile</h1>
                <p className="text-gray-500 text-lg">
                  After blocking your account, please contact our support team to assist you in retrieving your account.
                </p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row justify-center gap-4 pt-4">
            <Button className="border px-8 py-5" variant="outline" onClick={handleCancel}>
              ← Home
            </Button>
            {!isBlocked && (
              <Button className="px-8 py-5" variant="default" onClick={handleBlockProfileClick} disabled={!recordId}>
                Block Profile
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <>
          <div className="fixed inset-0 bg-[#6B7280]/40 backdrop-blur-[2px]" aria-hidden="true" />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-[400px] w-full pt-6 p-6 space-y-4">
              {/* Modal Header */}
              <div className="text-center">
                <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-[#FFE6D5] flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-[#FF692E]" />
                </div>
                <h3 className="text-lg font-semibold text-[#181D27] mb-2 mx-auto">Confirm Profile Block</h3>
                {/* <p className="text-center text-[#535862] font-normal text-sm">This action cannot be undone. Please provide a reason.</p> */}
              </div>

              {/* Reason Input */}
              <div className="space-y-2">
                {/* <label htmlFor="modalBlockReason" className="block text-left text-sm font-medium text-[#181D27]">
                  Reason for blocking profile *
                </label> */}
                <textarea
                  id="modalBlockReason"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Please provide a reason for blocking your profile..."
                  className="w-full text-sm min-h-[70px] px-3 py-2 border-2 border-orange-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF692E] focus:border-[#FF692E] resize-vertical"
                  maxLength={500}
                />
                {/* <div className="text-right text-xs text-[#535862]">
                  {blockReason.length}/500 characters
                </div> */}
              </div>

              {/* Modal Actions */}
              <div className="flex w-full gap-3">
                <Button variant="outline" className="flex-1" onClick={handleCancelModal} disabled={blockPaymentReqProps.isLoading}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[#FF692E] hover:bg-[#FF692E]"
                  variant="default"
                  onClick={handleConfirmBlock}
                  disabled={blockPaymentReqProps.isLoading || !blockReason.trim()}
                >
                  {blockPaymentReqProps.isLoading ? 'Blocking...' : 'Confirm Block'}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BlockProfile;
