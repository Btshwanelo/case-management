import React, { useEffect, useState } from 'react';
import { X, ArrowLeft, User, Building2, Loader2, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Logo from '@/assets/logo-black.png';

// Components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { showSuccessToast } from '@/components/SuccessToast';
import ApplicationSuccess from './ApplicationSuccess';

// API
import { useLazyFacilityRetrieveMasterValuesQuery } from '@/services/apiService';

// Utils
import { cn } from '@/lib/utils';
import { showErrorToast } from '@/components/ErrorToast ';
import { useFilterFaciltyByCampusReqMutation, usePrepopulateStudentInfoReqMutation } from '@/services/accomodationApplicationsEntity';
import { useFacilityCreateDocumentExecuteRequestMutation } from '@/services/facilityService';
import { useRetrieveMasterValues1Mutation } from '@/services/masterValueService';
import SuccessPage from '@/components/SuccessPage';
import Navbar from '@/components/Navbar';
import SignwellLoader from '../Student/CheckIn/Components/GenerateSignwellLoader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface FormData {
  firstName: string;
  lastName: string;
  idNumber: string;
  gender: string;
  mobile: string;
  email: string;
  campus: string;
  processCycle: string;
  allowanceType: string;
  facility: string;
}

interface FormErrors {
  [key: string]: string;
}

const ApplyForStudent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    idNumber: '',
    gender: '',
    mobile: '',
    email: '',
    campus: '',
    processCycle: '',
    allowanceType: '',
    facility: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userDetails = useSelector((state: RootState) => state.details.requestResults);

  //API Queries
  const [RetrieveMasterValues1, retriveMasterData] = useRetrieveMasterValues1Mutation();
  const [FacilityUpsertRecordReq, facilityUpsertData] = useFacilityCreateDocumentExecuteRequestMutation();
  const [PrepopulateStudentInfoReq, prepopulateData] = usePrepopulateStudentInfoReqMutation();
  const [FilterFaciltyByCampusReq, campusesData] = useFilterFaciltyByCampusReqMutation();

  useEffect(() => {
    RetrieveMasterValues1({
      body: {
        entityName: 'Facility',
        requestName: 'RetrieveMasterValues',
        inputParamters: {
          Page: 'student-application-list/apply',
          SupplierId: userDetails.supplierId,
        },
      },
    });
  }, []);

  useEffect(() => {
    if (formData.idNumber.length === 13) {
      handleGetStudentDetails(formData.idNumber);
    }
  }, [formData.idNumber]);

  useEffect(() => {
    if (formData?.allowanceType && formData?.campus) {
      handleGetCampuses(formData.campus, formData.allowanceType);
    }
  }, [formData.campus, formData.allowanceType]);

  const handleGetCampuses = (campusId: string, allowanceType: string) => {
    FilterFaciltyByCampusReq({
      body: {
        EntityName: 'AccomodationApplications',
        requestName: 'FilterFaciltyByCampusReq',
        inputParamters: {
          filters: {
            campusId,
            allowanceType,
          },
        },
      },
    });
  };

  const handleGetStudentDetails = (idNumber: string) => {
    PrepopulateStudentInfoReq({
      body: {
        EntityName: 'AccomodationApplications',
        requestName: 'PrepopulateStudentInfoReq',
        inputParamters: {
          idNumber: idNumber,
        },
      },
    });
  };

  useEffect(() => {
    if (prepopulateData.isSuccess) {
      setFormData({
        ...formData,
        firstName: prepopulateData?.data?.Student?.firstName || '',
        lastName: prepopulateData?.data?.Student?.lastName || '',
        email: prepopulateData?.data?.Student?.email || '',
        mobile: prepopulateData?.data?.Student?.mobile || '',
        gender: prepopulateData?.data?.Student?.genderId || '',
      });
    }
  }, [prepopulateData.isSuccess]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return !value.trim()
          ? `${name === 'firstName' ? 'First' : 'Last'} name is required`
          : !/^[a-zA-Z\s]{2,30}$/.test(value)
            ? 'Name should be 2-30 characters long and contain only letters'
            : '';

      case 'idNumber':
        return !value.trim() ? 'ID Number is required' : !/^\d{13}$/.test(value) ? 'ID Number must be exactly 13 digits' : '';

      case 'mobile':
        return !value.trim()
          ? 'Mobile number is required'
          : !/^0\d{9}$/.test(value)
            ? 'Mobile number must be 10 digits starting with 0'
            : '';

      case 'email':
        return !value.trim() ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Please enter a valid email address' : '';

      case 'gender':
        return !value.trim() ? 'Gender is required' : '';
      case 'campus':
      case 'processCycle':
      case 'allowanceType':
      case 'facility':
        return !value.trim() ? `${name.charAt(0).toUpperCase() + name.slice(1)} is required` : '';

      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(formData)?.forEach((field) => {
      const error = validateField(field, formData[field as keyof FormData]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const getOptions = (schemaName: string) => {
    return retriveMasterData.data?.staticData?.find((item) => item.schemaName === schemaName)?.options || [];
  };

  useEffect(() => {
    if (formData.allowanceType) {
      formData.allowanceType === '1103' && setFormData({ ...formData, facility: '0' });
    }
  }, [formData.allowanceType]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      showErrorToast('Please fix all errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      await FacilityUpsertRecordReq({
        body: {
          requestName: 'CreateApplicationForStudent',
          inputParamters: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            idNumber: formData.idNumber,
            gender: formData.gender,
            mobile: formData.mobile,
            email: formData.email,
            campusId: formData.campus,
            facilityId: formData.facility,
            processCycleId: formData.processCycle,
            allowanceType: Number(formData.allowanceType),
          },
        },
      }).unwrap();
      // showSuccessToast('Application submitted successfully');
    } catch (error) {
      console.log('error', error);
      console.log('error', error);
      showErrorToast(facilityUpsertData?.error?.data || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (field: keyof FormData, label: string, placeholder: string, type: string = 'text', isDisabled?: boolean) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        <span className="text-red-500 ml-1">*</span>
      </label>
      <Input
        type={type}
        disabled={isDisabled}
        className={cn(
          'w-full rounded-lg border bg-white transition-colors',
          'focus:border-orange-500 focus:ring-orange-500',
          errors[field] ? 'border-red-500' : 'border-gray-300'
        )}
        placeholder={placeholder}
        value={formData[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
      />
      {errors[field] && <span className="text-sm text-red-500 flex items-center gap-1">{errors[field]}</span>}
    </div>
  );

  const renderSelect = (field: keyof FormData, label: string, options: any[], placeholder: string, isDisabled?: boolean) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        <span className="text-red-500 ml-1">*</span>
      </label>
      <Select disabled={isDisabled} value={formData[field]} onValueChange={(value) => handleInputChange(field, value)}>
        <SelectTrigger
          className={cn('w-full rounded-lg bg-white', 'focus:ring-orange-500', errors[field] ? 'border-red-500' : 'border-gray-300')}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="hover:bg-orange-50 focus:bg-orange-50">
              {option.lable}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors[field] && <span className="text-sm text-red-500 flex items-center gap-1">{errors[field]}</span>}
    </div>
  );

  const getFundingStatusClass = (status) => {
    if (!status) return '';

    if (status.toLowerCase().includes('eligible')) {
      return 'bg-green-100 border-green-300 text-green-800';
    } else if (status.toLowerCase().includes('not eligible') || status.toLowerCase().includes('ineligible')) {
      return 'bg-red-100 border-red-300 text-red-800';
    } else {
      return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  const getFundingStatusIcon = (status) => {
    if (!status) return <Info className="h-5 w-5" />;

    if (status.toLowerCase().includes('eligible')) {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    } else if (status.toLowerCase().includes('not eligible') || status.toLowerCase().includes('ineligible')) {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    } else {
      return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  if (retriveMasterData.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size={'large'} />
      </div>
    );
  }

  if (facilityUpsertData.isSuccess) {
    return (
      <SuccessPage
        description="Student application successfully submitted."
        title="Application Submitted"
        secondaryAction={{
          label: 'View Applications',
          onClick: () => navigate('/student-application-list'),
        }}
      />
    );
  }

  const campuses = getOptions('CampusId');
  const processCycles = getOptions('ProcessCycle');
  const facilities = getOptions('FacilityId');
  const allowanceTypes = getOptions('AllowanceTypeId');
  const genders = getOptions('GenderId');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Form Header */}
        <div className="max-w-3xl mx-auto mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Application Form</h1>
          <p className="text-gray-600">Please fill in all required information to process the application</p>
        </div>

        <Card className="max-w-5xl mx-auto bg-white shadow-md rounded-xl p-6 md:p-8">
          {/* Funding Status Alert */}
          {prepopulateData?.data?.Student?.fundingStatus && (
            <Alert className={`mb-6 ${getFundingStatusClass(prepopulateData?.data?.Student?.fundingStatus)}`}>
              <div className="flex items-center">
                {getFundingStatusIcon(prepopulateData?.data?.Student?.fundingStatus)}
                <div className="ml-3">
                  <AlertTitle className="text-lg font-bold">Funding Status</AlertTitle>
                  <AlertDescription className="text-base font-medium">{prepopulateData?.data?.Student?.fundingStatus}</AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          {prepopulateData?.isError && (
            <Alert className="mb-6 bg-red-100 border-red-300">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <AlertDescription className="ml-3 text-base font-medium text-red-700">{prepopulateData?.error?.data}</AlertDescription>
              </div>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
            {/* Personal Details */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <User className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-900">Personal Details</h2>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  ID Number
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  type="text"
                  disabled={prepopulateData.isLoading}
                  className={cn(
                    'w-full rounded-lg border bg-white transition-colors',
                    'focus:border-orange-500 focus:ring-orange-500',
                    errors.idNumber ? 'border-red-500' : 'border-gray-300'
                  )}
                  placeholder="Enter 13-digit ID number"
                  value={formData.idNumber}
                  onChange={(e) => handleInputChange('idNumber', e.target.value)}
                />
                {errors.idNumber && <span className="text-sm text-red-500 flex items-center gap-1">{errors.idNumber}</span>}

                {/* ID Number Loading Indicator */}
                {prepopulateData.isLoading && (
                  <div className="flex items-center gap-2 py-2 px-3 bg-blue-50 rounded-md border border-blue-100 mt-2">
                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                    <span className="text-blue-700 font-medium">Verifying student information...</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('firstName', 'First Name', 'Enter first name', 'text', prepopulateData.isLoading)}
                {renderInput('lastName', 'Last Name', 'Enter last name', 'text', prepopulateData.isLoading)}
              </div>
              {renderSelect('gender', 'Gender', genders, 'Select gender', prepopulateData.isLoading)}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('mobile', 'Mobile', 'Enter 10-digit mobile number', 'text', prepopulateData.isLoading)}
                {renderInput('email', 'Email', 'Enter email address', 'email', prepopulateData.isLoading)}
              </div>
            </section>

            {/* Institution Details */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Building2 className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-900">Institution Details</h2>
              </div>

              {renderSelect('campus', 'Campus', campuses, 'Select campus')}
              {renderSelect('processCycle', 'Process Cycle', processCycles, 'Select process cycle')}
              {renderSelect('allowanceType', 'Allowance Type', allowanceTypes, 'Select allowance type')}
              {formData.allowanceType != '1103' &&
                renderSelect(
                  'facility',
                  'Property',
                  campusesData?.data?.facilities?.map(({ facilityId, name }) => ({
                    lable: name,
                    value: facilityId,
                  })) || [],
                  'Select facility',
                  formData.allowanceType === '1103'
                )}
            </section>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-6 border-t">
            <Button
              variant="outline"
              className="flex-1 text-gray-700 hover:bg-gray-50"
              onClick={() => navigate('/student-application-list')}
              disabled={isSubmitting}
            >
              Cancel Application
            </Button>
            <Button
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isSubmitting || facilityUpsertData.isLoading}
              onClick={handleSubmit}
            >
              {isSubmitting || facilityUpsertData.isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default ApplyForStudent;
