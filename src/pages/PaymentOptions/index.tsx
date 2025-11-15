import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet2, CreditCard, X, Upload, ArrowLeft } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useFacilityMakePaymentReqMutation, useInvoiceMutation } from '@/services/apiService';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import { showSuccessToast } from '@/components/SuccessToast';
import { useNavigate } from 'react-router-dom';
import AsyncContent from '@/components/AsyncContent';
import useResidence from '@/hooks/useResidence';

interface UploadedFile {
  file: File;
  preview?: string;
}

const PDFViewer = ({ base64Content, onClose, onUploadProof }) => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const pdfUrl = `data:application/pdf;base64,${base64Content}`;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile({ file });
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Content = reader.result?.toString().split(',')[1];
      if (base64Content) {
        await onUploadProof(base64Content, uploadedFile.file.name);
      }
    };
    reader.readAsDataURL(uploadedFile.file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4" onClick={onClose}>
      <Card
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-7xl max-h-[98vh] rounded-none sm:max-h-[95vh] overflow-hidden flex flex-col"
      >
        <CardContent className="p-6 rounded-none">
          <div className="mb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-2 justify-between mb-4">
              <h3 className="text-lg font-medium">EFT Payment Invoice</h3>
              <div className="flex gap-2">
                <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleFileChange} />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex gap-2 items-center"
                  disabled={!!uploadedFile}
                >
                  <Upload className="h-4 w-4" />
                  {uploadedFile ? 'File Selected' : 'Upload Proof'}
                </Button>
                {uploadedFile && (
                  <Button onClick={handleUpload} className="bg-orange-500 hover:bg-orange-600 text-white">
                    Submit Proof
                  </Button>
                )}
                <Button onClick={onClose} variant="outline" className="flex gap-2 items-center">
                  <X className="h-4 w-4" />
                  Close
                </Button>
              </div>
            </div>
            {uploadedFile && <div className="text-sm text-gray-600 mb-4">Selected file: {uploadedFile.file.name}</div>}
          </div>
          <iframe src={pdfUrl} className="w-full min-h-[400px] h-[calc(100vh-200px)] border" title="PDF Viewer" />
        </CardContent>
      </Card>
    </div>
  );
};

const PaymentOptions = () => {
  const [showEFTModal, setShowEFTModal] = useState(false);
  const payFastForm = useRef<HTMLFormElement>(null);
  const APP_URL = window.location.origin;
  const resident = useResidence();
  const navigate = useNavigate();
  console.log(showEFTModal);
  const [makePayment, { isLoading: isLoadingPaymentDetails, data: paymentDetails }] = useFacilityMakePaymentReqMutation();

  useEffect(() => {
    if (!resident.facilityId) {
      console.warn('Facility ID not found');
      return;
    }

    makePayment({
      recordId: resident.facilityId,
    });
  }, [makePayment]);

  const [invoice, { data: invoiceData, isLoading: isLoadingInvoice }] = useInvoiceMutation();

  const handlePayFastPayment = () => {
    if (payFastForm.current) {
      payFastForm.current.submit();
    }
  };

  const handledBack = () => {
    navigate('/dashboard');
    // if(resident.currentAction === 'Pay Now'){
    // }
    // if(resident.currentAction === 'Pay Now'){
    //   console.log('home')
    // }
  };

  const handleUploadProofOfPayment = async (base64Content: string, fileName: string) => {
    try {
      await invoice({
        body: {
          entityName: 'PaymentReceipt',
          requestName: 'UpsertRecordReq',
          inputParamters: {
            Entity: {
              InvoiceId: paymentDetails?.invoiceId,
              PaymentMode: 633,
              ReceiptStatusId: 666,
              TransactionDate: new Date().toISOString(),
            },
            Documents: [
              {
                FileName: fileName,
                FileExtention: 'pdf',
                FileContent: base64Content,
              },
            ],
          },
        },
      });
      showSuccessToast('Proof of payment uploaded successfully');
      setShowEFTModal(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error uploading proof:', error);
    }
  };

  useEffect(() => {
    if (showEFTModal) {
      invoice({
        body: {
          entityName: 'Invoice',
          recordId: paymentDetails?.invoiceId,
          requestName: 'DownloadRecordExecuteRequest',
        },
      });
    }
  }, [showEFTModal]);

  const renderPayFastForm = () => {
    if (!paymentDetails) return null;

    return (
      <form action={paymentDetails.action} ref={payFastForm} method="post">
        <input type="hidden" name="merchant_id" value={paymentDetails.merchant_id} />
        <input type="hidden" name="merchant_key" value={paymentDetails.merchant_key} />
        <input type="hidden" name="amount" value={paymentDetails.amount} />
        <input type="hidden" name="item_name" value={paymentDetails.item_name} />
        <input type="hidden" name="return_url" value={`${APP_URL}/success?amount=${paymentDetails.amount}`} />
        <input type="hidden" name="cancel_url" value={`${APP_URL}/cancel?amount=${paymentDetails.amount}`} />
        <input type="hidden" name="notify_url" value={`${APP_URL}?amount=${paymentDetails.amount}`} />
        <input type="hidden" name="name_first" value={paymentDetails.name_first} />
        <input type="hidden" name="name_last" value={paymentDetails.name_last} />
        <input type="hidden" name="email_address" value={paymentDetails.email_address} />
        <input type="hidden" name="cell_number" value={paymentDetails.cell_number} />
        <input type="hidden" name="m_payment_id" value={paymentDetails.m_payment_id} />
        <input type="hidden" name="item_description" value={paymentDetails.item_description} />
      </form>
    );
  };

  return (
    <DashboardLayout>
      <AsyncContent isLoading={isLoadingPaymentDetails}>
        {showEFTModal && invoiceData?.results && (
          <PDFViewer
            onClose={() => setShowEFTModal(false)}
            base64Content={invoiceData.results.replace(/[\n\r\s]/g, '')}
            onUploadProof={handleUploadProofOfPayment}
          />
        )}
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Button variant="ghost" className="pl-0 text-orange-500" onClick={handledBack}>
            <ArrowLeft /> Back
          </Button>
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight">Choose your payment method</h1>
          </div>

          <div className="space-y-10">
            <div>
              <p>
                <span className="font-medium">Online Payment:</span> You will get invoice with banking details in the next screen. After
                completing the payment then you can upload proof of payment
              </p>
              <Button
                onClick={handlePayFastPayment}
                className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-between px-6"
                disabled={isLoadingPaymentDetails || isLoadingInvoice}
              >
                <span className="text-lg font-medium">{isLoadingPaymentDetails ? 'Loading...' : 'Pay Online'}</span>
                <CreditCard className="h-6 w-6" />
              </Button>
            </div>

            <div>
              <p>
                <span className="font-medium">EFT (Electronic Funds Transfer):</span> Pay directly from your bank account. You will be
                directed to the next screen to complete the transaction
              </p>
              <Button
                onClick={() => setShowEFTModal(true)}
                variant="outline"
                className="w-full h-16 border-orange-500 text-orange-500 hover:bg-orange-50 flex items-center justify-between px-6"
                disabled={isLoadingInvoice || isLoadingPaymentDetails}
              >
                <span className="text-lg font-medium">{isLoadingInvoice || isLoadingPaymentDetails ? 'Loading...' : 'Pay Using EFT'}</span>
                <Wallet2 className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {renderPayFastForm()}
        </div>
      </AsyncContent>
    </DashboardLayout>
  );
};

export default PaymentOptions;
