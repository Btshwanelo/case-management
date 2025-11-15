import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CreditCard, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGenerateInspectionInvoiceMutation, useRetrieveAPInspectionFeeQuery } from '@/services/apiService';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import DashboardLayout from '@/layouts/DashboardLayout';
import Sidebar from './Sidebar';

const PaymentDetails = () => {
  const navigate = useNavigate();
  const residentDetails = useSelector((state: RootState) => state.resident);
  const [generateInspectionInvoice, { isLoading: isGeneratingInspectionInvoice }] = useGenerateInspectionInvoiceMutation();

  const { data, isLoading } = useRetrieveAPInspectionFeeQuery({
    recordId: residentDetails.facilityId,
  });

  const handlePaymentSelection = (destination: 'payment-options' | 'dashboard') => async () => {
    try {
      await generateInspectionInvoice({
        recordId: residentDetails.facilityId,
      });
      navigate(`/${destination}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4 max-w-[1200px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Progress Steps */}
          <Sidebar currentStep={5} />

          <div className="lg:col-span-9">
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Complete your property registration payment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Inspector Information */}
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-5 w-5 text-blue-500" />
                  <AlertTitle className="text-blue-700">Inspection Process</AlertTitle>
                  <AlertDescription className="text-blue-600">
                    An inspector will be assigned to inspect your student residence for accreditation.
                  </AlertDescription>
                </Alert>

                {/* Non-refundable Notice */}
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <AlertDescription className="text-red-600 font-medium">
                    Please note that the amount stipulated is non-refundable
                  </AlertDescription>
                </Alert>

                {/* Amount Card */}
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="text-sm text-gray-600 mb-2">Inspection Fee</div>
                  <div className="text-4xl font-bold mb-2">R{data?.AdminFee.toFixed(2)}</div>
                  <Badge variant="secondary" className="bg-gray-200">
                    Including VAT
                  </Badge>
                </div>

                {/* Payment Options */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">You have an option to pay inspection fee now or later.</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pay Now Option */}
                    <Button
                      className="bg-orange-500 hover:bg-orange-600 h-auto py-6"
                      disabled={isGeneratingInspectionInvoice}
                      onClick={handlePaymentSelection('payment-options')}
                    >
                      <div className="flex flex-col items-center">
                        <CreditCard className="h-6 w-6 mb-2" />
                        <span className="text-lg font-medium">Pay Now</span>
                        <span className="text-sm opacity-90">Proceed to payment</span>
                      </div>
                    </Button>

                    {/* Pay Later Option */}
                    <Button
                      variant="outline"
                      className="h-auto py-6 border-2"
                      disabled={isGeneratingInspectionInvoice}
                      onClick={handlePaymentSelection('dashboard')}
                    >
                      <div className="flex flex-col items-center">
                        <Clock className="h-6 w-6 mb-2" />
                        <span className="text-lg font-medium">Pay Later</span>
                        <span className="text-sm opacity-70">Continue without payment</span>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                  <h4 className="font-medium">Important Information:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Payment is secure and encrypted</li>
                    <li>You will receive a payment confirmation email</li>
                    <li>Inspection scheduling will begin after payment</li>
                    <li>Support is available for payment-related queries</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentDetails;
