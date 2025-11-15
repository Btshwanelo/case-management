import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Logo from '@/assets/logo-black.png';
import { useNavigate } from 'react-router-dom';
import {
  useContactPersonUpsertMutation,
  useFacilityUpsertRecordReqMutation,
  useLazyFacilityRetrieveMasterValuesQuery,
} from '@/services/apiService';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useParams } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { showSuccessToast } from '@/components/SuccessToast';
import { showErrorToast } from '@/components/ErrorToast ';
import ApplicationSuccess from './ApplicationSuccess';

const InstitutionAddProperty = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    propertyName: '',
    address: '',
    totalCapacity: '',
    campusId: '',
    institutionId: '',
    housingTypes: '',
    contactPerson: {
      name: '',
      mobile: '',
      email: '',
    },
  });

  const [errors, setErrors] = useState({
    propertyName: '',
    address: '',
    totalCapacity: '',
    campusId: '',
    housingTypes: '',
    contactPerson: {
      name: '',
      mobile: '',
      email: '',
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const userDetails = useSelector((state: RootState) => state.details.requestResults);

  const [facilityRetrieveMasterValues, { data, isLoading }] = useLazyFacilityRetrieveMasterValuesQuery();
  const [contactPersonUpsert, { isLoading: isLoadingContactPerson, isSuccess: isSuccessContact }] = useContactPersonUpsertMutation();
  const [facilityUpsertRecordReq, { isLoading: isLoadingfacilityUpsert, isSuccess: isSuccessFacility }] =
    useFacilityUpsertRecordReqMutation();

  useEffect(() => {
    facilityRetrieveMasterValues({
      body: {
        entityName: 'Facility',
        requestName: 'RetrieveMasterValues',
        inputParamters: {
          Page: 'property-list/add-property',
          SupplierId: userDetails.supplierId,
        },
      },
    });
  }, []);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('contactPerson.')) {
      const contactField = field.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        contactPerson: {
          ...prev.contactPerson,
          [contactField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
    // Clear error when user starts typing
    handleClearError(field);
  };

  const handleClearError = (field: string) => {
    if (field.startsWith('contactPerson.')) {
      const contactField = field.split('.')[1];
      setErrors((prev) => ({
        ...prev,
        contactPerson: {
          ...prev.contactPerson,
          [contactField]: '',
        },
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      propertyName: '',
      address: '',
      totalCapacity: '',
      campusId: '',
      housingTypes: '',
      contactPerson: {
        name: '',
        mobile: '',
        email: '',
      },
    };

    let isValid = true;

    // Property Name validation
    if (!formData.propertyName.trim()) {
      newErrors.propertyName = 'Property name is required';
      isValid = false;
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
      isValid = false;
    }

    // Total Capacity validation
    if (!formData.totalCapacity) {
      newErrors.totalCapacity = 'Total capacity is required';
      isValid = false;
    } else {
      const capacity = parseInt(formData.totalCapacity);
      if (isNaN(capacity) || capacity <= 0 || capacity > 4000) {
        newErrors.totalCapacity = 'Capacity must be between 1 and 4000';
        isValid = false;
      }
    }

    // Campus validation
    if (!formData.campusId) {
      newErrors.campusId = 'Campus selection is required';
      isValid = false;
    }

    // Housing Types validation
    if (!formData.housingTypes) {
      newErrors.housingTypes = 'Accommodation type is required';
      isValid = false;
    }

    // Contact Person validations
    if (!formData.contactPerson.name.trim()) {
      newErrors.contactPerson.name = 'Contact person name is required';
      isValid = false;
    }

    if (!formData.contactPerson.mobile.trim()) {
      newErrors.contactPerson.mobile = 'Mobile number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.contactPerson.mobile)) {
      newErrors.contactPerson.mobile = 'Invalid mobile number format';
      isValid = false;
    }

    if (!formData.contactPerson.email.trim()) {
      newErrors.contactPerson.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactPerson.email)) {
      newErrors.contactPerson.email = 'Invalid email format';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const getOptions = (schemaName: string) => {
    return data?.staticData?.find((item) => item.schemaName === schemaName)?.options || [];
  };

  const accommodationTypes = getOptions('AccommodationTypeId');
  const campuses = getOptions('CampusId');

  const handleSubmit = async () => {
    if (!validateForm()) {
      showErrorToast('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      const facilityResponse = await facilityUpsertRecordReq({
        body: {
          entityName: 'Facility',
          requestName: 'UpsertRecordReq',
          inputParamters: {
            Entity: {
              Name: formData.propertyName,
              Address: formData.address,
              TotalCapacity: formData.totalCapacity,
              FacilityStatusId: 834,
              AccomodationProviderId: userDetails.supplierId,
              CampusId: formData.campusId,
              InstitutionId: formData.institutionId,
              HousingTypes: formData.housingTypes,
            },
          },
        },
      }).unwrap();

      if (facilityResponse?.UpsertResponse?.recordId) {
        await contactPersonUpsert({
          body: {
            entityName: 'ContactPerson',
            requestName: 'UpsertRecordReq',
            inputParamters: {
              Entity: {
                Name: formData.contactPerson.name,
                Mobile: formData.contactPerson.mobile,
                Email: formData.contactPerson.email,
                FacilityId: facilityResponse?.UpsertResponse?.recordId,
              },
            },
          },
        }).unwrap();

        // showSuccessToast('Property added successfully');
        // navigate('/property-list');
      }
    } catch (error) {
      showErrorToast('Failed to add property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccessContact) {
    return <ApplicationSuccess message={'Property added successfully'} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="hidden md:block border-b bg-white border-orange-500">
        <div className="container mx-auto px-4 py-4 flex justify-between">
          <img src={Logo} alt="NSFAS Logo" className="h-8" />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/property-list')}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 max-w-xl mt-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-1">Add Property</h1>
          <p className="text-gray-500">Complete your property details below</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm text-black">Name</label>
            <Input
              className={`border-gray-400 ${errors.propertyName ? 'border-red-500' : ''}`}
              placeholder="Enter property name"
              value={formData.propertyName}
              onChange={(e) => handleInputChange('propertyName', e.target.value)}
            />
            {errors.propertyName && <span className="text-red-500 text-sm">{errors.propertyName}</span>}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-black">Address</label>
            <Input
              className={`border-gray-400 ${errors.address ? 'border-red-500' : ''}`}
              placeholder="Enter property address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
            {errors.address && <span className="text-red-500 text-sm">{errors.address}</span>}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-black">Number of beds (max 4000)</label>
            <Input
              className={`border-gray-400 ${errors.totalCapacity ? 'border-red-500' : ''}`}
              placeholder="Enter total number of beds for this residence"
              value={formData.totalCapacity}
              onChange={(e) => handleInputChange('totalCapacity', e.target.value)}
              type="number"
              max="4000"
            />
            {errors.totalCapacity && <span className="text-red-500 text-sm">{errors.totalCapacity}</span>}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-black">Campus</label>
            <Select value={formData.campusId} onValueChange={(value) => handleInputChange('campusId', value)}>
              <SelectTrigger className={`w-full border-gray-400 ${errors.campusId ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select Campus" />
              </SelectTrigger>
              <SelectContent>
                {campuses.map((campus) => (
                  <SelectItem key={campus.value} value={campus.value}>
                    {campus.lable}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.campusId && <span className="text-red-500 text-sm">{errors.campusId}</span>}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-black">Accommodation type</label>
            <Select value={formData.housingTypes} onValueChange={(value) => handleInputChange('housingTypes', value)}>
              <SelectTrigger className={`w-full border-gray-400 ${errors.housingTypes ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select accommodation type" />
              </SelectTrigger>
              <SelectContent>
                {accommodationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.lable}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.housingTypes && <span className="text-red-500 text-sm">{errors.housingTypes}</span>}
          </div>

          <hr />
          <h1 className="text-lg font-medium">Contact Person</h1>

          <div className="space-y-1">
            <label className="text-sm text-black">Name</label>
            <Input
              className={`border-gray-400 ${errors.contactPerson.name ? 'border-red-500' : ''}`}
              placeholder="Enter name"
              value={formData.contactPerson.name}
              onChange={(e) => handleInputChange('contactPerson.name', e.target.value)}
            />
            {errors.contactPerson.name && <span className="text-red-500 text-sm">{errors.contactPerson.name}</span>}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-black">Mobile</label>
            <Input
              className={`border-gray-400 ${errors.contactPerson.mobile ? 'border-red-500' : ''}`}
              placeholder="Enter contact number"
              value={formData.contactPerson.mobile}
              onChange={(e) => handleInputChange('contactPerson.mobile', e.target.value)}
            />
            {errors.contactPerson.mobile && <span className="text-red-500 text-sm">{errors.contactPerson.mobile}</span>}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-black">Email</label>
            <Input
              className={`border-gray-400 ${errors.contactPerson.email ? 'border-red-500' : ''}`}
              placeholder="Enter email"
              value={formData.contactPerson.email}
              onChange={(e) => handleInputChange('contactPerson.email', e.target.value)}
              type="email"
            />
            {errors.contactPerson.email && <span className="text-red-500 text-sm">{errors.contactPerson.email}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="outline" onClick={() => navigate('/property-list')} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isSubmitting || isLoadingContactPerson || isLoadingfacilityUpsert}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Spinner size="small" className="text-white" />
                  <span>Adding...</span>
                </div>
              ) : (
                'Add Property'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionAddProperty;
