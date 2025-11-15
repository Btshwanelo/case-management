import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ButtonLoader } from '@/components/ui/button-loader';
import { showSuccessToast } from '@/components/SuccessToast';
import { useEmployeeMutation, useTermTypeRetrieveMasterValuesMutation } from '@/services/apiService';
import { RootState } from '@/store';
import Logo from '@/assets/logo-black.png';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { clearAuthData } from '@/slices/authSlice';
import OnboardingNavHeader from '@/components/OnboardingNavHeader';
import { Stepper } from '@/components/ui/stepper-item';
import { showErrorToast } from '@/components/ErrorToast ';

const GENDER_OPTIONS = [
  { value: '1', label: 'Male' },
  { value: '2', label: 'Female' },
];
const RACE_OPTIONS = [
  { value: '1', label: 'Black' },
  { value: '2', label: 'Colored' },
];

const StudentPersonalDetails = ({ onNext }) => {
  const userDetails = useSelector((state: RootState) => state.auth);
  const [employee, { isSuccess, isLoading, isError, error }] = useEmployeeMutation();

  const [termTypeRetrieveMasterValues, { data: dataTermTypeMaster, isLoading: isLoadingTermTypeMaster }] =
    useTermTypeRetrieveMasterValuesMutation();

  const [formData, setFormData] = React.useState({
    RaceId: '',
    GenderId: '',
    DisabledId: '',
  });

  const [errors, setErrors] = React.useState({
    RaceId: '',
    GenderId: '',
    DisabledId: '',
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const getOptions = (schemaName) => {
    return dataTermTypeMaster?.staticData?.find((item) => item.schemaName === schemaName)?.options || [];
  };

  const genderOptions = getOptions('GenderId');
  const raceOptions = getOptions('EthnicityId');
  const disabledOptions = getOptions('DisabledId');

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['RaceId', 'GenderId', 'DisabledId'];

    requiredFields.forEach((field) => {
      if (!formData[field]?.trim()) {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').trim()} is required.`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    employee({
      body: {
        entityName: 'Employee',
        recordId: userDetails.user.relatedObjectId,
        requestName: 'UpsertRecordReq',
        inputParamters: {
          Entity: {
            EthnicityId: formData.RaceId,
            GenderId: formData.GenderId,
            DisabledId: formData.DisabledId,
            ProfileSteps: 1080,
          },
        },
      },
    });
  };

  useEffect(() => {
    if (isSuccess) {
      showSuccessToast('Profile Updated!');
      onNext();
    }
  }, [isSuccess, onNext]);
  useEffect(() => {
    if (isError) {
      showErrorToast(error?.data || 'Error updating profile.');
    }
  }, [isError]);

  useEffect(() => {
    termTypeRetrieveMasterValues({
      body: {
        entityName: 'ExternlaLogon',
        requestName: 'RetrieveMasterValues',
        inputParamters: {
          Page: 'onboarding?student-details',
        },
      },
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <OnboardingNavHeader />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* <div className="flex justify-center mb-12 overflow-x-auto py-4">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((step, index) => (
              <StepperItem key={step} active={step === 1} completed={false} first={index === 0} last={index === 3} />
            ))}
          </div>
        </div> */}

        <div className="mb-12">
          <Stepper steps={4} currentStep={0} />
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-4">Complete your profile, {userDetails.user.name}</h1>
          <p className="text-gray-600">
            Congratulations on signing up to the NSFAS portal. We require additional information to ensure that you're set up for the best
            experience regardless of your selected profile.
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-6">My Details</h2>
            <div className="space-y-6">
              {/* {[
                { id: 'FirstName', label: 'First name' },
                { id: 'LastName', label: 'Last name' },
              ].map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>
                    {field.label} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={field.id}
                    name={field.id}
                    placeholder={field.label}
                    value={formData[field.id]}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                  />
                  {errors[field.id] && <p className="text-red-500 text-sm">{errors[field.id]}</p>}
                </div>
              ))} */}

              <div className="space-y-2">
                <Label htmlFor="RaceId">
                  Race <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.RaceId} onValueChange={(value) => handleChange('RaceId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select race" />
                  </SelectTrigger>
                  <SelectContent>
                    {raceOptions.map(({ value, lable }) => (
                      <SelectItem key={value} value={value}>
                        {lable}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.RaceId && <p className="text-red-500 text-sm">{errors.RaceId}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="GenderId">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.GenderId} onValueChange={(value) => handleChange('GenderId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map(({ value, lable }) => (
                      <SelectItem key={value} value={value}>
                        {lable}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.GenderId && <p className="text-red-500 text-sm">{errors.GenderId}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="DisabledId">
                  Do you have any physical disabality? <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.DisabledId} onValueChange={(value) => handleChange('DisabledId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select disability" />
                  </SelectTrigger>
                  <SelectContent>
                    {disabledOptions.map(({ value, lable }) => (
                      <SelectItem key={value} value={value}>
                        {lable}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.DisabledId && <p className="text-red-500 text-sm">{errors.DisabledId}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Button onClick={handleSubmit} disabled={isLoading} className="bg-orange-500 hover:bg-orange-600">
              {isLoading ? <ButtonLoader className="text-white" /> : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPersonalDetails;
