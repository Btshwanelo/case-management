import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFacilityPaymenyReceivedReqMutation } from '@/services/apiService';
import { Card } from '@/components/ui/card';
import { showErrorToast } from '@/components/ErrorToast ';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const SuccessPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [facilityPaymenyReceivedReq, { isLoading, isSuccess, error }] = useFacilityPaymenyReceivedReqMutation();
  const resident = useSelector((state: RootState) => state.resident);

  const amount = searchParams.get('amount');
  const regrade = searchParams.get('regrade');

  const handlePaymentSuccess = async () => {
    try {
      const payload = {
        entityName: 'Facility',
        requestName: 'PaymenyReceivedReq',
        recordId: resident.facilityId,
        inputParamters: {
          AmountPaid: {
            Amount: amount,
            PaymentFor: regrade ? 'Regrade' : 'NewProperty',
          },
        },
      };

      await facilityPaymenyReceivedReq({ body: payload }).unwrap();
    } catch (error) {
      showErrorToast('Payment processing failed');
    }
  };

  useEffect(() => {
    handlePaymentSuccess();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 shadow-xl">
        <div className="flex flex-col items-center text-center space-y-6">
          {isLoading ? (
            <>
              <div className="relative">
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Processing Your Payment</h2>
                <p className="mt-2 text-gray-600">Please wait while we confirm your transaction...</p>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <div className="absolute -inset-1 bg-green-500 rounded-full opacity-20 animate-pulse" />
                <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">Payment Successful!</h2>
                <p className="text-gray-600">Your transaction has been processed successfully</p>
                {amount && <p className="text-2xl font-semibold text-green-600">Amount: R{parseFloat(amount).toLocaleString()}</p>}
              </div>
              <div className="w-full max-w-sm bg-green-50 rounded-lg p-4 border border-green-100">
                <p className="text-sm text-green-800">A confirmation email will be sent to your registered email address</p>
              </div>
              <div className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors">
                <Button className="" variant="ghost" onClick={() => navigate('/')}>
                  <span>Redirecting to homepage</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SuccessPayment;
// <section className="container p-4">
//   <div className="p-6">
//     <div className="payment-screen-panel text-center">
//       <h2 className="text-2xl font-semibold mb-3">Successful</h2>
//       <p className="text-gray-600">Payment Done Successfully</p>
//       {isLoading && (
//         <div className="mt-4">
//           <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
//           <p className="mt-2 text-sm text-gray-500">Processing payment...</p>
//         </div>
//       )}
//       {isSuccess && <Button onClick={()=> navigate('/')} >Ok</Button> }
//     </div>
//   </div>
// </section>
