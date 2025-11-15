import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ButtonLoader } from '@/components/ui/button-loader';
import { showSuccessToast } from '@/components/SuccessToast';
import {
  useCampusRetrieveMasterValuesMutation,
  useExternlaLogonRetrieveMasterValuesMutation,
  useSupplierMutation,
  useTermTypeRetrieveMasterValuesMutation,
} from '@/services/apiService';
import { RootState } from '@/store';
import StepperItem from './Steppertem';
import OnboardingNavHeader from '@/components/OnboardingNavHeader';
import { Stepper } from '@/components/ui/stepper-item';
import { showErrorToast } from '@/components/ErrorToast ';

const TERM_TYPE_OPTIONS = [
  { value: '61', label: 'Annual' },
  { value: '64', label: 'Trimester' },
  { value: '62', label: 'Semester' },
];

const AcademicDetails = ({ onNext }) => {
  const userDetails = useSelector((state: RootState) => state.auth);
  const { isProfileComplete, inProgressStep, profileDetails } = useSelector((state: RootState) => state.details);

  const [supplier, { isSuccess, isLoading, isError, error }] = useSupplierMutation();
  const [externlaLogonRetrieveMasterValues, { data: dataMaster, isLoading: isLoadingMaster }] =
    useExternlaLogonRetrieveMasterValuesMutation();
  const [campusRetrieveMasterValues, { data: dataCampusMaster, isLoading: isLoadingCampusMaster }] =
    useCampusRetrieveMasterValuesMutation();
  const [termTypeRetrieveMasterValues, { data: dataTermTypeMaster, isLoading: isLoadingTermTypeMaster }] =
    useTermTypeRetrieveMasterValuesMutation();

  const [formData, setFormData] = React.useState({
    InstitutionId: '',
    CompanyId: '',
    CampusId: '',
    TermTypeId: '',
  });

  const [errors, setErrors] = React.useState({
    InstitutionId: '',
    // CompanyId: '',
    CampusId: '',
    TermTypeId: '',
  });

  // Helper function to get options from staticData
  const getOptions = (schemaName) => {
    return dataMaster?.staticData?.find((item) => item.schemaName === schemaName)?.options || [];
  };
  const getCampusOptions = (schemaName) => {
    return dataCampusMaster?.staticData?.find((item) => item.schemaName === schemaName)?.options || [];
  };
  const getTermTypeOptions = (schemaName) => {
    return dataTermTypeMaster?.staticData?.find((item) => item.schemaName === schemaName)?.options || [];
  };

  const institutionOptions = getOptions('InstitutionId');
  const termTypeOptions = getTermTypeOptions('TermTypeId');
  const campusOptions = getCampusOptions('CampusId');

  useEffect(() => {
    handleChange('InstitutionId', profileDetails?.facilityInstitution?.institutionIdName || '');
    handleChange('CampusId', profileDetails?.facilityInstitution?.campusIdName || '');
    handleChange('TermTypeId', profileDetails?.facilityInstitution?.termTypeId || '');
  }, []);

  const handleChange = (name, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Reset campus selection when institution changes
      if (name === 'InstitutionId') {
        newData.CampusId = '';
      }

      return newData;
    });

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['InstitutionId', 'CampusId', 'TermTypeId'];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').trim()} is required.`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    supplier({
      body: {
        entityName: 'Employee',
        recordId: userDetails.user.relatedObjectId,
        requestName: 'UpsertRecordReq',
        inputParamters: {
          Entity: { CompanyId: formData.InstitutionId, TermTypeId: formData.TermTypeId, CampusId: formData.CampusId, ProfileSteps: 1082 },
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
    externlaLogonRetrieveMasterValues({
      body: {
        entityName: 'ExternlaLogon',
        requestName: 'RetrieveMasterValues',
        inputParamters: {
          Page: 'onboarding?academic-information=true',
        },
      },
    });
    termTypeRetrieveMasterValues({
      body: {
        entityName: 'ExternlaLogon',
        requestName: 'RetrieveMasterValues',
        inputParamters: {
          Page: 'onboarding?termtype=true',
        },
      },
    });
  }, []);

  useEffect(() => {
    if (formData.InstitutionId != '') {
      campusRetrieveMasterValues({
        body: {
          entityName: 'ExternlaLogon',
          requestName: 'RetrieveMasterValues',
          inputParamters: {
            Page: 'onboarding?academic-information=true',
            InstitutionId: formData.InstitutionId,
          },
        },
      });
    }
  }, [formData.InstitutionId]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <OnboardingNavHeader />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* <div className="flex justify-center mb-12 overflow-x-auto py-4">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((step, index) => (
              <StepperItem key={step} active={step <= 3} completed={step < 3} first={index === 0} last={index === 3} />
            ))}
          </div>
        </div> */}
        <div className="mb-12">
          <Stepper steps={4} currentStep={2} />
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
            <h2 className="text-xl font-semibold mb-6">Academic Details</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="InstitutionId">
                  Institution <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.InstitutionId} onValueChange={(value) => handleChange('InstitutionId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Institution" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.lable}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.InstitutionId && <p className="text-red-500 text-sm">{errors.InstitutionId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="CampusId">
                  Campus <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.CampusId}
                  onValueChange={(value) => handleChange('CampusId', value)}
                  disabled={!formData.InstitutionId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Campus" />
                  </SelectTrigger>
                  <SelectContent>
                    {campusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.lable}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.CampusId && <p className="text-red-500 text-sm">{errors.CampusId}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="TermTypeId">
                  Study Term <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.TermTypeId} onValueChange={(value) => handleChange('TermTypeId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Study Term" />
                  </SelectTrigger>
                  <SelectContent>
                    {termTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.lable}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.TermTypeId && <p className="text-red-500 text-sm">{errors.TermTypeId}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
              {isLoading ? <ButtonLoader className="text-white" /> : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicDetails;
