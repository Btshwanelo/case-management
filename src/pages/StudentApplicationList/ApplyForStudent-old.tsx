import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Logo from '@/assets/logo-black.png';
import { useNavigate } from 'react-router-dom';
import { useFacilityUpsertRecordReqMutation, useLazyFacilityRetrieveMasterValuesQuery } from '@/services/apiService';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { showSuccessToast } from '@/components/SuccessToast';
import ApplicationSuccess from './ApplicationSuccess';
import { showErrorToast } from '@/components/ErrorToast ';

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

  const [facilityRetrieveMasterValues, { data, isLoading }] = useLazyFacilityRetrieveMasterValuesQuery();
  const [facilityUpsertRecordReq, { isLoading: isLoadingfacilityUpsert, isSuccess: isSuccessFacility }] =
    useFacilityUpsertRecordReqMutation();

  useEffect(() => {
    facilityRetrieveMasterValues({
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
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

    // Validate all fields
    Object.keys(formData).forEach((field) => {
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
    return data?.staticData?.find((item) => item.schemaName === schemaName)?.options || [];
  };

  const campuses = getOptions('CampusId');
  const processCycles = getOptions('ProcessCycle');
  const facilities = getOptions('FacilityId');
  const allowanceTypes = getOptions('AllowanceTypeId');
  const genders = getOptions('GenderId');

  const handleSubmit = async () => {
    if (!validateForm()) {
      showErrorToast('Please fix all errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      await facilityUpsertRecordReq({
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
    } catch (error) {
      showErrorToast('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccessFacility) {
    return <ApplicationSuccess message={'Application submitted successfully'} />;
  }

  const renderInput = (field: keyof FormData, label: string, placeholder: string, type: string = 'text') => (
    <div className="space-y-1">
      <label className="text-sm text-black">{label}</label>
      <Input
        type={type}
        className={`border-gray-400 ${errors[field] ? 'border-red-500' : ''}`}
        placeholder={placeholder}
        value={formData[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
      />
      {errors[field] && <span className="text-red-500 text-sm">{errors[field]}</span>}
    </div>
  );

  const renderSelect = (field: keyof FormData, label: string, options: any[], placeholder: string) => (
    <div className="space-y-1">
      <label className="text-sm text-black">{label}</label>
      <Select value={formData[field]} onValueChange={(value) => handleInputChange(field, value)}>
        <SelectTrigger className={`w-full border-gray-400 ${errors[field] ? 'border-red-500' : ''}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.lable}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors[field] && <span className="text-red-500 text-sm">{errors[field]}</span>}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="hidden md:block border-b bg-white border-orange-500">
        <div className="container mx-auto px-4 py-4 flex justify-between">
          <img src={Logo} alt="NSFAS Logo" className="h-8" />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/student-application-list')}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 max-w-7xl mt-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-1">Apply For Student</h1>
          <p className="text-gray-500">Complete student details below</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h1 className="text-lg font-medium">Student Details</h1>
              {renderInput('firstName', 'First Name', 'Enter first name')}
              {renderInput('lastName', 'Last Name', 'Enter last name')}
              {renderInput('idNumber', 'ID Number', 'Enter 13-digit ID number')}
              {renderSelect('gender', 'Gender', genders, 'Select gender')}
              {renderInput('mobile', 'Mobile', 'Enter 10-digit mobile number')}
              {renderInput('email', 'Email', 'Enter email address', 'email')}
            </div>

            <div className="space-y-4">
              <h1 className="text-lg font-medium">Institution Details</h1>
              {renderSelect('campus', 'Campus', campuses, 'Select campus')}
              {renderSelect('processCycle', 'Process Cycle', processCycles, 'Select process cycle')}
              {renderSelect('allowanceType', 'Allowance Type', allowanceTypes, 'Select allowance type')}
              {renderSelect('facility', 'Property', facilities, 'Select facility')}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-2">
            <Button variant="outline" onClick={() => navigate('/student-application-list')} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isSubmitting || isLoadingfacilityUpsert}
              onClick={handleSubmit}
            >
              {isSubmitting || isLoadingfacilityUpsert ? (
                <div className="flex items-center gap-2">
                  <Spinner size="small" className="text-white" />
                  <span>Submitting...</span>
                </div>
              ) : (
                'Apply For Student'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyForStudent;
