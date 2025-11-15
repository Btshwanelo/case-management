import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { useSupplierMutation } from '@/services/apiService';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { showSuccessToast } from '@/components/SuccessToast';
import StepperItem from './Steppertem';
import { ButtonLoader } from '@/components/ui/button-loader';
import { X } from 'lucide-react';
import OnboardingNavHeader from '@/components/OnboardingNavHeader';
import { Stepper } from '@/components/ui/stepper-item';
import { showErrorToast } from '@/components/ErrorToast ';

const StudentNextOfKin = ({ personName = '{person.name}', onNext }) => {
  const [formData, setFormData] = React.useState({
    fullName: '',
    relationship: '',
    mobileNumber: '',
    emailAddress: '',
  });

  const [errors, setErrors] = React.useState({
    fullName: '',
    relationship: '',
    mobileNumber: '',
    emailAddress: '',
  });

  const [touched, setTouched] = React.useState({
    fullName: false,
    relationship: false,
    mobileNumber: false,
    emailAddress: false,
  });

  const userDetails = useSelector((state: RootState) => state.auth);

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          error = 'Full name is required';
        } else if (value.trim().length < 2) {
          error = 'Full name must be at least 2 characters';
        }
        break;
      case 'relationship':
        if (!value.trim()) {
          error = 'Relationship is required';
        }
        break;
      case 'mobileNumber':
        if (!value.trim()) {
          error = 'Mobile number is required';
        } else if (!/^[0-9+\-\s()]{10,}$/.test(value)) {
          error = 'Please enter a valid mobile number';
        }
        break;
      case 'emailAddress':
        if (!value.trim()) {
          error = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, formData[name]),
    }));
  };

  const validateForm = () => {
    const newErrors = {
      fullName: validateField('fullName', formData.fullName),
      relationship: validateField('relationship', formData.relationship),
      mobileNumber: validateField('mobileNumber', formData.mobileNumber),
      emailAddress: validateField('emailAddress', formData.emailAddress),
    };

    setErrors(newErrors);
    setTouched({
      fullName: true,
      relationship: true,
      mobileNumber: true,
      emailAddress: true,
    });

    return !Object.values(newErrors).some((error) => error !== '');
  };

  const [supplier, { isSuccess, isLoading, isError, data, error }] = useSupplierMutation();

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    supplier({
      body: {
        entityName: 'Employee',
        recordId: userDetails.user.relatedObjectId,
        requestName: 'UpsertRecordReq',
        inputParamters: {
          Entity: {
            NextOfKinFullName: formData.fullName,
            NextOfKinRelationship: formData.relationship,
            NextOfKinMobile: formData.mobileNumber,
            NextOfKinEmail: formData.emailAddress,
            ProfileSteps: 1081,
          },
        },
      },
    });
  };

  useEffect(() => {
    if (isSuccess) {
      // showSuccessToast(data?.clientMessage);
      showSuccessToast('Profile Updated!!');

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
            <StepperItem active={true} completed={true} first={false} last={false} />
            <StepperItem active={true} completed={false} first={false} last={false} />
            <StepperItem active={false} completed={false} first={false} last={false} />
            <StepperItem active={false} completed={false} first={false} last={false} />
            <StepperItem active={false} completed={false} first={false} last={true} />
          </div>
        </div> */}
        <div className="mb-12">
          <Stepper steps={4} currentStep={1} />
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
            <h2 className="text-xl font-semibold mb-6">Next Of Kin Details</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={cn(touched.fullName && errors.fullName && 'border-red-500')}
                />
                {touched.fullName && errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">
                  Relationship <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="relationship"
                  name="relationship"
                  placeholder="Enter relationship"
                  value={formData.relationship}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={cn(touched.relationship && errors.relationship && 'border-red-500')}
                />
                {touched.relationship && errors.relationship && <p className="text-sm text-red-500 mt-1">{errors.relationship}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobileNumber">
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mobileNumber"
                  name="mobileNumber"
                  placeholder="Enter mobile number"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={cn(touched.mobileNumber && errors.mobileNumber && 'border-red-500')}
                />
                {touched.mobileNumber && errors.mobileNumber && <p className="text-sm text-red-500 mt-1">{errors.mobileNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailAddress">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="emailAddress"
                  name="emailAddress"
                  placeholder="Enter email address"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={cn(touched.emailAddress && errors.emailAddress && 'border-red-500')}
                />
                {touched.emailAddress && errors.emailAddress && <p className="text-sm text-red-500 mt-1">{errors.emailAddress}</p>}
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            {/* <Button variant="outline">Previous</Button> */}
            <Button
              onClick={handleSubmit}
              className="bg-orange-500 hover:bg-orange-600"
              disabled={isLoading || Object.values(errors).some((error) => error !== '')}
            >
              {isLoading ? <ButtonLoader /> : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentNextOfKin;
