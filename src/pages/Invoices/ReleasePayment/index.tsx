import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import Logo from '@/assets/logo-black.png';
import {
  useExecuteRequest1Mutation,
  useExecuteRequest2Mutation,
  useExecuteRequest3Mutation,
  useExecuteRequest4Mutation,
  useExecuteRequest5Mutation,
} from '@/services/apiService';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Mail, User2, UserRoundX, X, CheckCircle, AlertTriangle, CreditCard, Building2, Hash, MoveLeft, PhoneCall } from 'lucide-react';
import { showErrorToast } from '@/components/ErrorToast ';
import { useDispatch } from 'react-redux';
import { clearAuthData } from '@/slices/authSlice';
import Breadcrumb from '@/components/BreadCrumb';
import DashboardLayout from '@/layouts/DashboardLayout';
import ErrorPage from '@/components/ErrorPage';
import PageLoder from '@/components/PageLoder';
import SuccessPage from '@/components/SuccessPage';
import { Checkbox } from '@/components/ui/checkbox';
import useCurrentUser from '@/hooks/useCurrentUser';
import OTPModal from '@/pages/AP/EditProfile/Components/OTPModal';

const ReleasePayment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [GetInvoice, getInvoiceReqProps] = useExecuteRequest1Mutation();
  const [BlockPaymentReq, blockPaymentReqProps] = useExecuteRequest2Mutation();
  const [ApprovePaymentReq, approvePaymentReqProps] = useExecuteRequest3Mutation();
  const [RequestOTP, requestOTPProps] = useExecuteRequest4Mutation();
  const [ConfirmOTP, confirmOTPProps] = useExecuteRequest5Mutation();

  const [isProcessed, setIsProcessed] = useState(false);
  const [processingType, setProcessingType] = useState(''); // 'approved' or 'blocked'
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [isApproveCheck, setIsApproveCheck] = useState(false);
  const dispatch = useDispatch();
  const userDetails = useCurrentUser();

  useEffect(() => {
    GetInvoice({
      body: {
        entityName: 'Supplier',
        requestName: 'UnprocessedInvoiceDetails',
        recordId: id,
      },
    });
  }, [id]);

  const handleRequestOTP = () => {
    RequestOTP({
      body: {
        entityName: 'Supplier',
        requestName: 'GenericOTPExecuteRequest',
        RecordId: userDetails.supplierId,
        inputParamters: {
          invoiceId: id,
          OtpType: 1132, //bank OTP
        },
      },
    });
  };
  const handleApprovePayment = () => {
    handleRequestOTP();
  };

  const handleBlockClick = () => {
    setShowBlockModal(true);
  };

  const handleConfirmBlock = () => {
    if (!blockReason.trim()) {
      showErrorToast('Please provide a reason for blocking the payment');
      return;
    }

    BlockPaymentReq({
      body: {
        entityName: 'Invoice',
        requestName: 'ReleasePaymentReq',
        recordId: id,
        inputParamters: {
          isReleasePayment: false,
          details: {
            amount: `${getInvoiceReqProps.data?.details?.invoiceAmount}`,
            invoiceNumber: `${getInvoiceReqProps.data?.details?.invoiceNumber}`,
            accountNumber: `${getInvoiceReqProps.data?.details?.accountNumber}`,
            apName: `${userDetails.firstName} ${userDetails.lastName}`,
            reason: blockReason,
          },
        },
      },
    });

    setShowBlockModal(false);
  };
  const handleConfirmApprove = async (otp) => {
    try {
      const confirmRes = await ConfirmOTP({
        body: {
          entityName: 'Supplier',
          requestName: 'GenericConfirmOtp',
          recordId: userDetails.supplierId,
          inputParamters: {
            OTPInformation: {
              OTPNo: otp,
              email: userDetails.email,
              mobile: userDetails.mobile,
            },
          },
        },
      }).unwrap();

      console.log('confirmRes', confirmRes);

      // On success, proceed with second call
      await ApprovePaymentReq({
        body: {
          entityName: 'Invoice',
          requestName: 'ReleasePaymentReq',
          recordId: id,
          inputParamters: {
            isReleasePayment: true,
          },
        },
      });

      setShowApproveModal(false);
    } catch (error) {
      console.error('OTP Confirmation failed:', error);
    }
  };

  const handleCancelModal = () => {
    setShowBlockModal(false);
    setBlockReason('');
  };
  const handleCancelApproveModal = () => {
    setShowApproveModal(false);
  };

  // Handle approval success
  useEffect(() => {
    if (approvePaymentReqProps.isSuccess) {
      //   setIsProcessed(true);
      setProcessingType('approved');
    }
  }, [approvePaymentReqProps.isSuccess]);

  // Handle block success
  useEffect(() => {
    if (blockPaymentReqProps.isSuccess) {
      //   setIsProcessed(true);
      setProcessingType('blocked');
      setBlockReason('');
    }
  }, [blockPaymentReqProps.isSuccess]);
  useEffect(() => {
    if (requestOTPProps.isError) {
      setShowApproveModal(false);
      showErrorToast(requestOTPProps.error.data);
    }
  }, [requestOTPProps.isError]);
  useEffect(() => {
    if (requestOTPProps.isSuccess) {
      setShowApproveModal(true);
    }
  }, [requestOTPProps.isSuccess]);

  // Handle errors
  useEffect(() => {
    if (approvePaymentReqProps.isError) {
      showErrorToast(approvePaymentReqProps.error?.data || 'Error approving payment');
    }
  }, [approvePaymentReqProps.isError]);

  useEffect(() => {
    if (blockPaymentReqProps.isError) {
      showErrorToast(blockPaymentReqProps.error?.data || 'Error blocking payment');
    }
  }, [blockPaymentReqProps.isError]);

  const breadcrumbItems = [{ path: '/Invoices', label: 'Invoices' }];
  const invoiceData = getInvoiceReqProps.data?.details;

  const formatCurrency = (amount) => {
    if (amount >= 1_000_000) {
      return `R${(amount / 1_000_000).toFixed(2)}M`;
    }
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (approvePaymentReqProps.isSuccess) {
    return (
      <SuccessPage
        description={approvePaymentReqProps.data?.clientMessage}
        title="Payment has been approved"
        secondaryAction={{
          label: 'Continue',
          onClick: () => navigate('/invoices'),
        }}
      />
    );
  }

  if (blockPaymentReqProps.isSuccess) {
    return (
      <SuccessPage
        description={blockPaymentReqProps.data?.clientMessage}
        title="Payment has been blocked"
        secondaryAction={{
          label: 'Continue',
          onClick: () => navigate('/invoices'),
        }}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <nav className=" md:block  border-b  border-orange-500">
        <div className="container mx-auto px-4 py-4 flex justify-between ">
          <img src={Logo} alt="NSFAS Logo" className="h-8" onClick={() => navigate('/')} />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/invoices`)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </nav>
      <div className="container mx-auto px-4 py-2 flex justify-between ">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <main className="min-h-[calc(100vh-135px)] justify-center flex ">
        {getInvoiceReqProps.isError && <ErrorPage message={getInvoiceReqProps.error?.data} />}
        {getInvoiceReqProps.isLoading && <PageLoder />}

        {getInvoiceReqProps.isSuccess && (
          <div className="max-w-2xl mx-auto p-6">
            {/* Invoice Header */}

            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{invoiceData?.invoiceNumber}</h1>
              <p className="text-lg text-gray-600">
                {isProcessed ? (processingType === 'approved' ? 'Payment Approved' : 'Payment Blocked') : 'Payment Approval Required'}
              </p>
            </div>

            {/* Payment Details Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
              {/* Amount */}
              <div className="text-center py-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Payment Amount</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(invoiceData?.invoiceAmount)}</p>
              </div>

              {(invoiceData?.approved || invoiceData?.blocked) && (
                <div className="text-center mt-4 p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-600">This invoice has already been {invoiceData?.approved ? 'approved' : 'blocked'}</p>
                </div>
              )}

              {/* Banking Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-[#FF692E]" />
                  Banking Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Bank Name</p>
                    <p className="text-base text-gray-900">{invoiceData?.bankName}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Account Type</p>
                    <p className="text-base text-gray-900">{invoiceData?.accountType}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Account Number</p>
                    <p className="text-base font-mono text-gray-900">{invoiceData?.accountNumber}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Branch Number</p>
                    <p className="text-base font-mono text-gray-900">{invoiceData?.branchNo}</p>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              {!isProcessed && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Security Check Required</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Please verify that this is your correct banking account before approving the payment. If this is not your account,
                        please block the payment immediately.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button
                variant="outline"
                className="px-8 py-5 w-full border border-red-500 text-red-500 hover:text-red-500 hover:border-red-500"
                onClick={handleBlockClick}
                disabled={
                  blockPaymentReqProps.isLoading ||
                  approvePaymentReqProps.isLoading ||
                  invoiceData?.approved === true ||
                  invoiceData?.blocked === true
                }
              >
                <UserRoundX className="h-4 w-4 mr-2" />
                Block Payment
              </Button>

              <Button
                className="px-8 py-5 w-full"
                variant="default"
                onClick={handleApprovePayment}
                disabled={
                  blockPaymentReqProps.isLoading ||
                  approvePaymentReqProps.isLoading ||
                  invoiceData?.approved === true ||
                  invoiceData?.blocked === true
                }
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {approvePaymentReqProps.isLoading ? 'Approving...' : 'Approve Payment'}
              </Button>
            </div>

            {/* Back Button for Processed State */}
            {isProcessed && (
              <div className="flex justify-center mt-8">
                <Button variant="outline" onClick={() => navigate('/invoices')} className="px-8 py-3">
                  ← Back to Invoices
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Block Confirmation Modal */}
      {showBlockModal && (
        <>
          <div className="fixed inset-0 bg-[#6B7280]/40 backdrop-blur-[2px]" aria-hidden="true" />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-[400px] w-full pt-6 p-6 space-y-4">
              {/* Modal Header */}
              <div className="text-center">
                <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-[#FFE6D5] flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-[#FF692E]" />
                </div>
                <h3 className="text-lg font-semibold text-[#181D27] mb-2 mx-auto">Block Payment</h3>
                <p className="text-center text-[#535862] font-normal text-sm">
                  You are about to block the payment for invoice {invoiceData?.invoiceNumber}. Once the payment has been blocked, out
                  support team will reach out to you.{' '}
                </p>
              </div>

              {/* Reason Input */}
              <div className="space-y-2">
                {/* <label htmlFor="blockReason" className="block text-left text-sm font-medium text-[#181D27]">
                  Reason for blocking payment *
                </label> */}
                <textarea
                  id="blockReason"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Reason for blocking payment..."
                  className="w-full min-h-[70px] text-sm px-3 py-2 border-2 border-orange-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF692E] focus:border-[#FF692E] resize-vertical"
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
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  onClick={handleConfirmBlock}
                  disabled={blockPaymentReqProps.isLoading || !blockReason.trim()}
                >
                  {blockPaymentReqProps.isLoading ? 'Blocking...' : 'Block Payment'}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
      {showApproveModal && (
        <OTPModal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          onConfirm={handleConfirmApprove}
          isLoading={requestOTPProps.isLoading}
          onNewOtp={handleRequestOTP}
          isLoadingSubmit={confirmOTPProps.isLoading}
          isError={confirmOTPProps.isError}
          errorMessage={confirmOTPProps.error?.data || 'Incorrect OTP'}
          description={`You are about to approve the payment of R${invoiceData?.invoiceAmount}, for  ${invoiceData?.invoiceNumber} into the bank account ${invoiceData?.bankName}-${invoiceData?.accountNumber}`}
          // description={`We've sent a code to ${maskMobile(userDetail.mobile, { showFirst: 2, showLast: 3 })}`}
          title={`Please check your phone.`}
          icon={<PhoneCall className="h-6 w-6 text-[#FF692E]" />}
        />
      )}
    </div>
  );
};

export default ReleasePayment;
