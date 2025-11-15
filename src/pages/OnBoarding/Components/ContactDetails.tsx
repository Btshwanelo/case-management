import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useSupplierMutation } from '@/services/apiService';
import { Spinner } from '@/components/ui/spinner';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { showSuccessToast } from '@/components/SuccessToast';
import StepperItem from './Steppertem';
import { ButtonLoader } from '@/components/ui/button-loader';
import OnboardingNavHeader from '@/components/OnboardingNavHeader';
import { Stepper } from '@/components/ui/stepper-item';
import { showErrorToast } from '@/components/ErrorToast ';

// const StepperItem = ({ active, completed, first, last }) => (
//   <div className="flex items-center">
//     <div
//       className={cn(
//         'w-8 h-8 rounded-full flex items-center justify-center border-2',
//         active && 'bg-orange-500 border-orange-500 text-white',
//         completed && 'bg-green-500 border-green-500 text-white',
//         !active && !completed && 'border-gray-300 text-gray-300'
//       )}
//     >
//       {completed ? '✓' : '•'}
//     </div>
//     {!last && <div className={cn('h-[2px] w-24', completed ? 'bg-green-500' : 'bg-gray-300')} />}
//   </div>
// );

const ContactDetails = ({ personName = '{person.name}', onNext }) => {
  const [formData, setFormData] = React.useState({
    emailAddress: '',
    contactNumber: '',
  });

  const [errors, setErrors] = React.useState({
    emailAddress: '',
    contactNumber: '',
  });

  const userDetails = useSelector((state: RootState) => state.auth);
  const profileDetails = useSelector((state: RootState) => state.details);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear the error for the field being updated
    setErrors({
      ...errors,
      [name]: '',
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact Number is required.';
    } else if (!/^\d+$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Contact Number must contain only digits.';
    }

    if (!formData.emailAddress.trim()) {
      newErrors.emailAddress = 'Email is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.emailAddress)) {
      newErrors.emailAddress = 'Please enter a valid email address.';
    }

    setErrors(newErrors);

    // Return true if no errors exist
    return Object.keys(newErrors).length === 0;
  };

  const [supplier, { isSuccess, isLoading, isError, data, error }] = useSupplierMutation();

  useEffect(() => {
    setFormData({
      emailAddress: profileDetails.requestResults.logonDetails.email || '',
      contactNumber: profileDetails.requestResults.logonDetails.mobile || '',
    });
  }, []);

  const handleSubmit = () => {
    if (!validateForm()) {
      return; // Block submission if validation fails
    }

    supplier({
      body: {
        entityName: 'Supplier',
        recordId: userDetails.user.relatedObjectId,
        requestName: 'UpsertRecordReq',
        inputParamters: {
          Entity: {
            Mobile: formData.contactNumber,
            Email: formData.emailAddress,
            ProfileSteps: 1081,
          },
        },
      },
    });
  };

  useEffect(() => {
    if (isSuccess) {
      // showSuccessToast(data?.clientMessage);
      showSuccessToast('Profile Update!!');

      onNext();
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      showErrorToast(error?.data || 'Error updating profile.');
    }
  }, [isError]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <OnboardingNavHeader />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Stepper */}
        {/* <div className="flex justify-center mb-12 overflow-x-auto py-4">
          <div className="flex items-center">
            <StepperItem active={true} completed={true} first={true} last={false} />
            <StepperItem active={true} completed={false} first={false} last={false} />
            <StepperItem active={false} completed={false} first={false} last={false} />
            <StepperItem active={false} completed={false} first={false} last={false} />
            <StepperItem active={false} completed={false} first={false} last={false} />
            <StepperItem active={false} completed={false} first={false} last={true} />
          </div>
        </div> */}
        <div className="mb-12">
          <Stepper steps={6} currentStep={1} />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-4">Complete your profile, {userDetails.user.name}</h1>
          <p className="text-gray-600">
            Congratulations on signing up to the NSFAS portal. We require additional information to ensure that you're set up for the best
            experience regardless of your selected profile.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-6">Contact Details</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="contactNumber">
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  placeholder="Contact Number"
                  disabled
                  value={formData.contactNumber}
                  onChange={handleChange}
                />
                {errors.contactNumber && <p className="text-red-500 text-sm">{errors.contactNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailAddress">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input id="emailAddress" disabled name="emailAddress" placeholder="Email" value={formData.emailAddress} onChange={handleChange} />
                {errors.emailAddress && <p className="text-red-500 text-sm">{errors.emailAddress}</p>}
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            {/* <Button variant="outline">Previous</Button> */}
            <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600">
              {isLoading ? <ButtonLoader /> : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetails;
