import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSupplierMutation } from '@/services/apiService';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { showSuccessToast } from '@/components/SuccessToast';
import StepperItem from './Steppertem';
import Logo from '@/assets/logo-black.png';

import { ButtonLoader } from '@/components/ui/button-loader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import OnboardingNavHeader from '@/components/OnboardingNavHeader';
import { Stepper } from '@/components/ui/stepper-item';
import { showErrorToast } from '@/components/ErrorToast ';

const INITIAL_ENTITY_STATE = {
  tradingName: '',
  registeredName: '',
  registrationNumber: '',
  vatNumber: '',
};

const INITIAL_INDIVIDUAL_STATE = {
  firstName: '',
  lastName: '',
  idNumber: '',
};

const CompanyDetails = ({ onNext }) => {
  const navigate = useNavigate();
  const [providerType, setProviderType] = React.useState('864');
  const [entityData, setEntityData] = React.useState(INITIAL_ENTITY_STATE);
  const [individualData, setIndividualData] = React.useState(INITIAL_INDIVIDUAL_STATE);
  const [errors, setErrors] = React.useState({});

  const userDetails = useSelector((state: RootState) => state.auth);
  const profileDetails = useSelector((state: RootState) => state.details);
  console.log('profileDetails', profileDetails);
  const [supplier, { isSuccess, isLoading, isError, error }] = useSupplierMutation();

  const handleEntityChange = (e) => {
    const { name, value } = e.target;
    setEntityData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const handleIndividualChange = (e) => {
    const { name, value } = e.target;
    setIndividualData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const validateEntityForm = () => {
    const newErrors = {};
    const requiredFields = ['tradingName', 'registeredName', 'registrationNumber', 'vatNumber'];

    requiredFields.forEach((field) => {
      if (!entityData[field]?.trim()) {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required.`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateIndividualForm = () => {
    const newErrors = {};
    const requiredFields = ['firstName', 'lastName', 'idNumber'];

    requiredFields.forEach((field) => {
      if (!individualData[field]?.trim()) {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required.`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    const isValid = providerType === '865' ? validateEntityForm() : validateIndividualForm();

    if (!isValid) return;

    const payload = {
      entityName: 'Supplier',
      recordId: userDetails.user.relatedObjectId,
      requestName: 'UpsertRecordReq',
      inputParamters: {
        Entity:
          providerType === '865'
            ? {
                RegistrationNo: entityData.registrationNumber,
                Name: entityData.tradingName,
                RegistrationName: entityData.registeredName,
                VATNumber: entityData.vatNumber,
                APtypeId: providerType,
                ProfileSteps: 1080,
              }
            : {
                Name: individualData.firstName,
                LastName: individualData.lastName,
                IdNumber: individualData.idNumber,
                APtypeId: providerType,
                ProfileSteps: 1080,
              },
      },
    };

    supplier({ body: payload });
  };

  useEffect(() => {
    if (isSuccess) {
      showSuccessToast('Profile Updated!');
      onNext();
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      showErrorToast(error?.data || 'Error updating profile.');
    }
  }, [isError]);

  useEffect(() => {
    setIndividualData((prev) => ({
      ...prev,
      ['idNumber']: profileDetails.requestResults.logonDetails.rsaId || '',
    }));
    setIndividualData((prev) => ({
      ...prev,
      ['firstName']: profileDetails.requestResults.logonDetails.firstName || '',
    }));
    setIndividualData((prev) => ({
      ...prev,
      ['lastName']: profileDetails.requestResults.logonDetails.lastName || '',
    }));
  }, []);

  const renderEntityFields = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="tradingName">
          Trading name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="tradingName"
          name="tradingName"
          placeholder="Company trading name"
          value={entityData.tradingName}
          onChange={handleEntityChange}
        />
        {errors.tradingName && <p className="text-red-500 text-sm">{errors.tradingName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="registeredName">
          Registered name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="registeredName"
          name="registeredName"
          placeholder="Company registered name"
          value={entityData.registeredName}
          onChange={handleEntityChange}
        />
        {errors.registeredName && <p className="text-red-500 text-sm">{errors.registeredName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="registrationNumber">
          Registration number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="registrationNumber"
          name="registrationNumber"
          placeholder="Company registration number"
          value={entityData.registrationNumber}
          onChange={handleEntityChange}
        />
        {errors.registrationNumber && <p className="text-red-500 text-sm">{errors.registrationNumber}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="vatNumber">
          VAT number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="vatNumber"
          name="vatNumber"
          placeholder="Company VAT number"
          value={entityData.vatNumber}
          onChange={handleEntityChange}
        />
        {errors.vatNumber && <p className="text-red-500 text-sm">{errors.vatNumber}</p>}
      </div>
    </>
  );

  const renderIndividualFields = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="firstName">
          First name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="firstName"
          name="firstName"
          placeholder="First name"
          disabled
          value={individualData.firstName}
          onChange={handleIndividualChange}
        />
        {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">
          Last name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="lastName"
          name="lastName"
          disabled
          placeholder="Last name"
          value={individualData.lastName}
          onChange={handleIndividualChange}
        />
        {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="idNumber">
          ID number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="idNumber"
          disabled
          name="idNumber"
          placeholder="ID number"
          value={individualData.idNumber}
          onChange={handleIndividualChange}
        />
        {errors.idNumber && <p className="text-red-500 text-sm">{errors.idNumber}</p>}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <OnboardingNavHeader />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Stepper */}
        {/* <div className="flex justify-center mb-12 overflow-x-auto py-4">
          <div className="flex items-center">
            {[...Array(6)].map((_, index) => (
              <StepperItem key={index} active={index === 0} completed={false} first={index === 0} last={index === 5} />
            ))}
          </div>
        </div> */}
        <div className="mb-12">
          <Stepper steps={6} currentStep={0} />
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
            <h2 className="text-xl font-semibold mb-6">Details</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="providerType">
                  Accommodation Provider Type <span className="text-red-500">*</span>
                </Label>
                <Select value={providerType} onValueChange={setProviderType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="865">Entity</SelectItem>
                    <SelectItem value="864">Individual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {providerType === '865' ? renderEntityFields() : renderIndividualFields()}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600">
              {isLoading ? <ButtonLoader /> : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;
