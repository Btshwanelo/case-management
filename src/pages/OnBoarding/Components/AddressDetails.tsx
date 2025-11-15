import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAddressMutation, useProvinceRetrieveMasterValuesMutation } from '@/services/apiService';
import { ButtonLoader } from '@/components/ui/button-loader';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import GoogleAutocomplete from '@/components/GoogleAutocomplete';
import { cleanAddressString } from '@/utils';
import { showSuccessToast } from '@/components/SuccessToast';
import StepperItem from './Steppertem';
import OnboardingNavHeader from '@/components/OnboardingNavHeader';
import { Stepper } from '@/components/ui/stepper-item';
import { showErrorToast } from '@/components/ErrorToast ';

const AddressDetails = ({ onNext }) => {
  const [formData, setFormData] = React.useState({
    addressLine1: '',
    streetNumber: '',
    city: '',
    suburb: '',
    postalCode: '',
    province: '',
  });

  const [errors, setErrors] = React.useState({
    addressLine1: '',
    streetNumber: '',
    city: '',
    suburb: '',
    postalCode: '',
    province: '',
  });

  const [touched, setTouched] = React.useState({
    addressLine1: false,
    streetNumber: false,
    city: false,
    suburb: false,
    postalCode: false,
    province: false,
  });

  const userDetails = useSelector((state: RootState) => state.auth);
  const [address, { isLoading, isSuccess, error, isError }] = useAddressMutation();
  const [provinceRetrieveMasterValues, { data: dataMaster }] = useProvinceRetrieveMasterValuesMutation();

  // Helper function to get options from staticData
  const getOptions = (schemaName) => {
    return dataMaster?.staticData?.find((item) => item.schemaName === schemaName)?.options || [];
  };

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'addressLine1':
        if (!value.trim()) {
          error = 'Street name is required';
        } else if (value.trim().length < 3) {
          error = 'Street name must be at least 3 characters';
        }
        break;
      case 'streetNumber':
        if (!value.trim()) {
          error = 'Street number is required';
        }
        break;
      case 'city':
        if (!value.trim()) {
          error = 'City is required';
        }
        break;
      case 'suburb':
        if (!value.trim()) {
          error = 'Suburb is required';
        }
        break;
      case 'postalCode':
        if (!value.trim()) {
          error = 'Postal code is required';
        } else if (!/^\d{4,}$/.test(value.trim())) {
          error = 'Please enter a valid postal code';
        }
        break;
      case 'province':
        if (!value) {
          error = 'Province is required';
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));

    setTouched((prev) => ({
      ...prev,
      [name]: true,
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
      addressLine1: validateField('addressLine1', formData.addressLine1),
      streetNumber: validateField('streetNumber', formData.streetNumber),
      city: validateField('city', formData.city),
      suburb: validateField('suburb', formData.suburb),
      postalCode: validateField('postalCode', formData.postalCode),
      province: validateField('province', formData.province),
    };

    setErrors(newErrors);
    setTouched({
      addressLine1: true,
      streetNumber: true,
      city: true,
      suburb: true,
      postalCode: true,
      province: true,
    });

    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    address({
      body: {
        entityName: 'Address',
        requestName: 'UpsertRecordReq',
        inputParamters: {
          Entity: {
            StreetNumber: formData.streetNumber,
            StreetName: formData.addressLine1,
            City: formData.city,
            Suburb: formData.suburb,
            PostalCode: formData.postalCode,
            Province: formData.province,
            RelatedObjectId: userDetails.user.relatedObjectId,
            RelatedObjectIdObjectTypeCode: 'Supplier',
            ProfileSteps: 1083,
          },
        },
      },
    });
  };

  const handlePlaceSelected = (place: google.maps.places.PlaceResult | null) => {
    if (!place?.address_components) return;

    function getLongNameByType(components: google.maps.GeocoderAddressComponent[], type: string): string | undefined {
      const component = components.find((comp) => comp.types.some((t) => t.startsWith(type)));
      return component?.long_name || '';
    }

    const streetNumber = getLongNameByType(place.address_components, 'street_number');
    const route = getLongNameByType(place.address_components, 'route');
    const locality = getLongNameByType(place.address_components, 'locality');
    const sublocalitylevel1 = getLongNameByType(place.address_components, 'sublocality_level_1');
    const administrativeAreaLevel1 = getLongNameByType(place.address_components, 'administrative_area_level_1');
    const postalCode = getLongNameByType(place.address_components, 'postal_code');

    // Find matching province ID from options
    const provinceOption = getOptions('ProvinceId').find((opt) => opt.lable.toLowerCase() === administrativeAreaLevel1?.toLowerCase());

    const newFormData = {
      streetNumber: streetNumber || '',
      addressLine1: cleanAddressString(streetNumber, route, locality, sublocalitylevel1),
      city: locality || '',
      suburb: sublocalitylevel1 || '',
      postalCode: postalCode || '',
      province: provinceOption?.value || '',
    };

    setFormData(newFormData);

    // Validate all fields after Google Autocomplete
    Object.keys(newFormData).forEach((key) => {
      setErrors((prev) => ({
        ...prev,
        [key]: validateField(key, newFormData[key]),
      }));
      setTouched((prev) => ({
        ...prev,
        [key]: true,
      }));
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
    provinceRetrieveMasterValues({
      body: {
        entityName: 'ExternlaLogon',
        requestName: 'RetrieveMasterValues',
        inputParamters: {
          Page: 'onboarding?provinces=true',
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
            {[1, 2, 3, 4, 5, 6].map((step, index) => (
              <StepperItem key={step} active={step <= 3} completed={step < 3} first={index === 0} last={index === 5} />
            ))}
          </div>
        </div> */}
        <div className="mb-12">
          <Stepper steps={6} currentStep={3} />
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
            <h2 className="text-xl font-semibold mb-6">Address Details</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="addressLine1">
                  Search for address <span className="text-red-500">*</span>
                </Label>
                <GoogleAutocomplete onPlaceSelected={handlePlaceSelected} />
                <p className="text-sm text-gray-500">Search for your address or fill in the fields below manually.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine1">
                  Street Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="addressLine1"
                  name="addressLine1"
                  placeholder="Street name"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={cn(touched.addressLine1 && errors.addressLine1 && 'border-red-500')}
                />
                {touched.addressLine1 && errors.addressLine1 && <p className="text-sm text-red-500 mt-1">{errors.addressLine1}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="streetNumber">
                  Street Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="streetNumber"
                  name="streetNumber"
                  placeholder="Street number"
                  value={formData.streetNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={cn(touched.streetNumber && errors.streetNumber && 'border-red-500')}
                />
                {touched.streetNumber && errors.streetNumber && <p className="text-sm text-red-500 mt-1">{errors.streetNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Your City"
                  value={formData.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={cn(touched.city && errors.city && 'border-red-500')}
                />
                {touched.city && errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="suburb">
                    Suburb <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="suburb"
                    name="suburb"
                    placeholder="Suburb"
                    value={formData.suburb}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn(touched.suburb && errors.suburb && 'border-red-500')}
                  />
                  {touched.suburb && errors.suburb && <p className="text-sm text-red-500 mt-1">{errors.suburb}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">
                    Postal code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    placeholder="Postal code"
                    value={formData.postalCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn(touched.postalCode && errors.postalCode && 'border-red-500')}
                  />
                  {touched.postalCode && errors.postalCode && <p className="text-sm text-red-500 mt-1">{errors.postalCode}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">
                  Province <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.province} onValueChange={(value) => handleSelectChange('province', value)}>
                  <SelectTrigger className={cn(touched.province && errors.province && 'border-red-500')}>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {getOptions('ProvinceId').map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.lable}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {touched.province && errors.province && <p className="text-sm text-red-500 mt-1">{errors.province}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
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

export default AddressDetails;
