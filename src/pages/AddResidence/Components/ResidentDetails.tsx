import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronRight, Info, MapPin, AlertCircle } from 'lucide-react';
import { RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ButtonLoader } from '@/components/ui/button-loader';
import { showSuccessToast } from '@/components/SuccessToast';
import { updateResidenceField } from '@/slices/residentSlice';
import { useEffect, useState, useRef } from 'react';
import { showErrorToast } from '@/components/ErrorToast ';
import SelectDropdown from './SelectDropdown';
import { useFacilityUpsertRecordReqMutation, useRetrivePrevFacilityDataMutation } from '@/services/facilityService';
import {
  useRetrieveMasterValues1Mutation,
  useRetrieveMasterValues2Mutation,
  useRetrieveMasterValues3Mutation,
} from '@/services/masterValueService';
import useDistanceMatrix from '@/hooks/useGetDistance';
import AddressModal, { AddressData } from '@/components/AddressModal';
import config from '@/config';

// Type for form validation errors
interface AddressValidationError {
  address?: string;
  postalCode?: string;
  province?: string;
  city?: string;
}

const ResidentDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isUpdate = searchParams.get('update');

  // State management
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [provinceNum, setProvinceNum] = useState(0);
  const [campusNum, setCampusNum] = useState(0);
  const [addressErrors, setAddressErrors] = useState<AddressValidationError>({});
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<AddressData | undefined>();

  // Redux selectors
  const residentDetails = useSelector((state: RootState) => state.resident);
  const { relatedObjectId } = useSelector((state: RootState) => state.auth.user);
  const userDetails = useSelector((state: RootState) => state.details.requestResults);

  // API mutations and queries
  const [facilityUpsertRecordReq, { isLoading: isLoadingUpsert, isSuccess, error, isError, data: dataUpsert }] =
    useFacilityUpsertRecordReqMutation();

  const [RetrieveMasterValues1, { data: provinceData, isLoading: isLoadingProvinces, isSuccess: isProvinceSuccess }] =
    useRetrieveMasterValues1Mutation();

  const [RetrieveMasterValues2, { data: campusData, isLoading: isLoadingCampuses, isSuccess: isCampusSuccess }] =
    useRetrieveMasterValues2Mutation();

  const [RetrieveMasterValues3, { data: institutionData, isLoading: isLoadingInstitutions, isSuccess: isInstitutionSuccess }] =
    useRetrieveMasterValues3Mutation();

  const [RetrivePrevFacilityData, { data: prevData, isSuccess: isSuccessPrev }] = useRetrivePrevFacilityDataMutation();

  // Form setup with default values
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    clearErrors,
    setError,
    trigger,
    getValues,
  } = useForm({
    defaultValues: {
      Name: '',
      ProvinceId: '',
      InstitutionId: '',
      CampusId: '',
      KMToCampus: '',
      AccomodationProviderId: userDetails.supplierId,
      Address: '',
      FacilityStatusId: 872,
    },
    mode: 'onChange',
  });

  // Watch form values
  const ProvinceId = watch('ProvinceId');
  const CampusId = watch('CampusId');
  const InstitutionId = watch('InstitutionId');
  const Address = watch('Address');

  // Distance matrix setup
  const {
    getDistance,
    data: distanceData,
    loading: distanceLoading,
    error: distanceError,
  } = useDistanceMatrix({
    origin: '',
    destination: '',
    mode: 'driving',
  });

  // Helper functions for options
  const getProvinceOptions = () => {
    return provinceData?.staticData?.find((item) => item.schemaName === 'ProvinceId')?.options || [];
  };

  const getCampusOptions = () => {
    return campusData?.staticData?.find((item) => item.schemaName === 'CampusId')?.options || [];
  };

  const getInstitutionOptions = () => {
    return institutionData?.staticData?.find((item) => item.schemaName === 'InstitutionId')?.options || [];
  };

  const parseExistingAddress = (formattedAddress: string): AddressData | null => {
    try {
      if (!formattedAddress) return null;

      // Split the address into parts and clean them
      const addressParts = formattedAddress.split(',').map((part) => part.trim());

      // Create address data object with default empty values
      const addressData: AddressData = {
        formatted_address: formattedAddress,
        addressLine1: '',
        suburb: '',
        city: '',
        postalCode: '',
        province: '',
        lat: null,
        lng: null,
      };

      // For a South African address like "7387 Moleofi St, Orlando West, Soweto, 1804, South Africa"
      // Let's extract each component

      // Street address is the first part
      if (addressParts.length > 0) {
        addressData.addressLine1 = addressParts[0]; // "7387 Moleofi St"
      }

      // Suburb is the second part
      if (addressParts.length > 1) {
        addressData.suburb = addressParts[1]; // "Orlando West"
      }

      // City is typically the third part
      if (addressParts.length > 2) {
        addressData.city = addressParts[2]; // "Soweto"
      }

      // Postal code is typically the fourth part in South Africa
      if (addressParts.length > 3) {
        // Postal code is usually a numeric-only field
        const potentialPostalCode = addressParts[3].trim();
        if (/^\d+$/.test(potentialPostalCode)) {
          addressData.postalCode = potentialPostalCode; // "1804"
        }
      }

      return addressData;
    } catch (error) {
      console.error('Error parsing formatted address:', error);
      return null;
    }
  };

  // Function to handle the province mapping from name to ID
  const mapProvinceNameToId = (provinceName: string, provinceOptions: any[]): string | null => {
    if (!provinceName || !provinceOptions?.length) return null;

    // First try direct mapping (if provinceName is already an ID)
    if (/^\d+$/.test(provinceName)) {
      const exists = provinceOptions.some((option) => option.value === provinceName);
      if (exists) return provinceName;
    }

    // Try to find a match in the province options based on name
    const matchedProvince = provinceOptions.find((option) => option.lable.toLowerCase() === provinceName.toLowerCase());

    return matchedProvince ? matchedProvince.value : null;
  };

  // Validate address completeness
  const validateAddress = (addressData: AddressData | undefined): boolean => {
    if (!addressData) {
      setAddressErrors({ address: 'Address is required' });
      return false;
    }

    const newErrors: AddressValidationError = {};

    // Check for complete address info
    if (!addressData.formatted_address && !addressData.addressLine1) {
      newErrors.address = 'Complete address is required';
    }

    // Validate postal code
    if (!addressData.postalCode) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^\d{4,}$/.test(addressData.postalCode)) {
      newErrors.postalCode = 'Please enter a valid postal code (minimum 4 digits)';
    }

    // Handle province - can be an ID or a name
    if (!addressData.province) {
      newErrors.province = 'Province is required';
    } else if (!/^\d+$/.test(addressData.province)) {
      // If it's not a numeric ID, check if we can find a match
      const provinceOptions = getProvinceOptions();
      const provinceId = mapProvinceNameToId(addressData.province, provinceOptions);

      if (!provinceId) {
        newErrors.province = 'Invalid province selected';
      } else {
        // Update the province to use the ID
        addressData.province = provinceId;
      }
    }

    // Check city
    if (!addressData.city) {
      newErrors.city = 'City is required';
    }

    setAddressErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate distance between campus and address
  const calculateDistance = async (addressData: AddressData, campusId: string) => {
    if (!campusId || !addressData.formatted_address) return;

    // Get campus address from selected campus
    const selectedCampus = getCampusOptions().find((option) => option.value === campusId);
    if (!selectedCampus || !selectedCampus.address) return;

    setIsCalculatingDistance(true);

    try {
      const result = await getDistance({
        origin: addressData.formatted_address,
        destination: selectedCampus.address,
        mode: 'driving',
      });

      if (result && result.rows && result.rows[0] && result.rows[0].elements && result.rows[0].elements[0]) {
        const distanceText = result.rows[0].elements[0].distance.text;
        const distanceValue = result.rows[0].elements[0].distance.value;

        // Convert meters to kilometers and round to 1 decimal place
        const kmValue = Math.round((distanceValue / 1000) * 10) / 10;
        setValue('KMToCampus', kmValue.toString());
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  // ======= IMPROVED API CALL FUNCTIONS =======

  // Load provinces
  const loadProvinces = () => {
    RetrieveMasterValues1({
      body: {
        entityName: 'Facility',
        requestName: 'RetrieveMasterValues',
        inputParamters: {
          Page: 'add-residence',
        },
      },
    });
  };

  // Load campuses based on selected province
  const loadCampusesForProvince = (provinceId: string) => {
    if (!provinceId) return;

    // Clear dependent selections
    setValue('CampusId', '');
    setValue('InstitutionId', '');

    RetrieveMasterValues2({
      body: {
        entityName: 'Facility',
        requestName: 'RetrieveMasterValues',
        inputParamters: {
          Page: 'add-residence',
          ProvinceId: provinceId,
        },
      },
    });
  };

  // Load institutions based on selected campus
  const loadInstitutionsForCampus = (campusId: string) => {
    if (!campusId) return;

    // Clear dependent selections
    setValue('InstitutionId', '');

    RetrieveMasterValues3({
      body: {
        entityName: 'Facility',
        requestName: 'RetrieveMasterValues',
        inputParamters: {
          Page: 'add-residence',
          CampusId: campusId,
        },
      },
    });
  };

  // Initial data loading
  useEffect(() => {
    // Load existing facility data if updating
    if (isUpdate) {
      RetrivePrevFacilityData({
        body: {
          entityName: 'Facility',
          requestName: 'RetrievePrevFacilityData',
          inputParamters: {
            Page: 'add-residence',
            FacilityId: residentDetails.facilityId,
          },
        },
      });
    }

    // Always load provinces first
    loadProvinces();
  }, []);

  // Watch for province changes and load campuses
  useEffect(() => {
    // Skip initial render
    if (isInitialLoad) return;

    if (ProvinceId) {
      console.log(`Province changed to: ${ProvinceId}, loading campuses...`);
      loadCampusesForProvince(ProvinceId);
    }
  }, [ProvinceId]);

  // Watch for campus changes and load institutions
  useEffect(() => {
    // Skip initial render
    if (isInitialLoad) return;

    if (CampusId) {
      console.log(`Campus changed to: ${CampusId}, loading institutions...`);
      loadInstitutionsForCampus(CampusId);

      // If we have an address, calculate the distance to the new campus
      if (currentAddress && CampusId) {
        calculateDistance(currentAddress, CampusId);
      }
    }
  }, [CampusId]);

  // Handle province data loading success
  useEffect(() => {
    if (isProvinceSuccess && provinceData) {
      console.log('Provinces loaded successfully');

      // If this is update mode and we already have prevData, then set the province
      if (isUpdate && isSuccessPrev && prevData?.FacilityDetails?.provinceId) {
        setTimeout(() => {
          setValue('ProvinceId', prevData.FacilityDetails.provinceId);
          loadCampusesForProvince(prevData.FacilityDetails.provinceId);
        }, 0);
      }
    }
  }, [isProvinceSuccess, provinceData]);

  // Handle campus data loading success
  useEffect(() => {
    if (isCampusSuccess && campusData) {
      console.log('Campuses loaded successfully');

      // If this is update mode and we already have prevData
      if (isUpdate && isSuccessPrev && prevData?.FacilityDetails?.campusId) {
        setTimeout(() => {
          setValue('CampusId', prevData.FacilityDetails.campusId);
          loadInstitutionsForCampus(prevData.FacilityDetails.campusId);
        }, 0);
      }
    }
  }, [isCampusSuccess, campusData]);

  // Handle institution data loading success
  useEffect(() => {
    if (isInstitutionSuccess && institutionData) {
      console.log('Institutions loaded successfully');

      // If this is update mode and we already have prevData
      if (isUpdate && isSuccessPrev && prevData?.FacilityDetails?.institutionId) {
        setTimeout(() => {
          setValue('InstitutionId', prevData.FacilityDetails.institutionId);
        }, 0);
      }
    }
  }, [isInstitutionSuccess, institutionData]);

  // Handle update case - populate form with existing data once we have all the data
  useEffect(() => {
    if (isUpdate && isSuccessPrev && prevData?.FacilityDetails) {
      console.log('Previous facility data loaded:', prevData.FacilityDetails);

      // Set the name
      setValue('Name', prevData.FacilityDetails.name);

      // Set KM to campus if available
      if (prevData.FacilityDetails.kmToCampus !== null && prevData.FacilityDetails.kmToCampus !== undefined) {
        setValue('KMToCampus', prevData.FacilityDetails.kmToCampus.toString());
      }

      // Set the address field
      if (prevData.FacilityDetails.address) {
        setValue('Address', prevData.FacilityDetails.address);

        // Parse the existing address
        const parsedAddress = parseExistingAddress(prevData.FacilityDetails.address);

        if (parsedAddress) {
          // If we have a provinceId from the database, set it in the address data
          if (prevData.FacilityDetails.provinceId) {
            parsedAddress.province = prevData.FacilityDetails.provinceId;
          }

          setCurrentAddress(parsedAddress);
          setIsAddressValid(validateAddress(parsedAddress));
        }
      }

      // Mark initial load as complete after a short delay
      // to ensure all form values are properly set
      setTimeout(() => {
        setIsInitialLoad(false);
      }, 500);
    } else if (!isUpdate) {
      // If not update mode, mark initial load as complete
      setIsInitialLoad(false);
    }
  }, [prevData, isUpdate, isSuccessPrev]);

  // Effect to validate address whenever it changes
  useEffect(() => {
    if (Address) {
      clearErrors('Address');
    } else {
      setError('Address', { type: 'manual', message: 'Address is required' });
    }
  }, [Address, setError, clearErrors]);

  // Form submission handler
  const onSubmit = async (formData) => {
    // Validate address before submission
    if (!isAddressValid || !currentAddress) {
      setError('Address', { type: 'manual', message: 'Please enter a valid address' });
      return;
    }

    const payload = {
      entityName: 'Facility',
      requestName: 'UpsertRecordReq',
      ...(isUpdate ? { recordId: residentDetails.facilityId } : {}),
      inputParamters: { Entity: formData },
    };

    try {
      await facilityUpsertRecordReq({ body: payload });
    } catch (err) {
      showErrorToast('Failed to save residence details');
    }
  };

  // Handle API responses
  useEffect(() => {
    if (isError) {
      showErrorToast(error?.data || 'An error occurred');
    }
    if (isSuccess) {
      showSuccessToast(dataUpsert?.clientMessage || 'Successfully saved');
      dispatch(updateResidenceField({ field: 'facilityId', value: dataUpsert.UpsertResponse.recordId }));
      navigate(isUpdate ? `/residence-summary?update=true&residenceId=${residentDetails.facilityId}` : '/add-room');
    }
  }, [isError, isSuccess]);

  const handleOpenAddressModal = () => {
    setIsAddressModalOpen(true);
  };

  const handleCloseAddressModal = () => {
    setIsAddressModalOpen(false);
  };

  // Helper function to construct formatted_address from address components
  const constructFormattedAddress = (address: AddressData): string => {
    if (address.formatted_address) {
      return address.formatted_address;
    }

    // Build formatted address from components
    const addressParts = [
      address.streetNumber && address.addressLine1
        ? `${address.streetNumber} ${address.addressLine1}`
        : address.addressLine1,
      address.suburb,
      address.city,
      address.postalCode,
    ].filter(Boolean);

    return addressParts.join(', ');
  };

  const handleConfirmAddress = (address: AddressData) => {
    console.log('Confirmed address:', address);
    
    // Construct formatted_address if it's missing (for manually entered addresses)
    const formattedAddress = constructFormattedAddress(address);
    const addressWithFormatted = {
      ...address,
      formatted_address: formattedAddress,
    };
    
    setCurrentAddress(addressWithFormatted);

    // Validate the address
    const isValid = validateAddress(addressWithFormatted);
    setIsAddressValid(isValid);

    if (isValid) {
      setValue('Address', formattedAddress);

      // If address has province info, try to match it with the province dropdown
      if (address.province && provinceData) {
        const provinceOptions = getProvinceOptions();

        // If the province is already a numeric ID
        if (/^\d+$/.test(address.province)) {
          const matchedProvinceById = provinceOptions.find((option) => option.value === address.province);
          if (matchedProvinceById && !ProvinceId) {
            setValue('ProvinceId', matchedProvinceById.value);
          }
        }
        // If it's a province name, try to match by label
        else {
          const matchedProvinceByName = provinceOptions.find((option) => option.lable.toLowerCase() === address.province?.toLowerCase());

          if (matchedProvinceByName && !ProvinceId) {
            setValue('ProvinceId', matchedProvinceByName.value);
          }
        }
      }

      // If we have both address and campus, calculate distance
      if (formattedAddress && CampusId) {
        calculateDistance(addressWithFormatted, CampusId);
      }
    } else {
      setError('Address', { type: 'manual', message: 'Please enter a complete and valid address' });
    }

    setIsAddressModalOpen(false);
  };

  return (
    <div className="lg:col-span-9">
      <Card>
        <CardHeader>
          <CardTitle>{isUpdate ? 'Update' : 'Add'} Residence</CardTitle>
          <CardDescription>Enter your property details below</CardDescription>
        </CardHeader>
        <AddressModal
          isOpen={isAddressModalOpen}
          onClose={handleCloseAddressModal}
          onConfirm={handleConfirmAddress}
          defaultAddress={currentAddress}
          googleApiKey={config.googleKey}
        />
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Name Field */}
              <div className="space-y-2">
                <Label htmlFor="propertyName">Name of Property</Label>
                <Input
                  id="propertyName"
                  {...register('Name', {
                    required: 'Property name is required',
                    pattern: {
                      value: /^[a-zA-Z0-9\s-]+$/,
                      message: 'Property name can only contain letters, numbers, spaces, and hyphens',
                    },
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(/[^a-zA-Z0-9\s-]/g, '');
                    },
                  })}
                  className={errors.Name ? 'border-red-500' : ''}
                />
                <span className="text-xs flex">
                  <Info className="mr-1" size={15} />
                  Property name can only contain letters, numbers, spaces, and hyphens
                </span>
                {errors.Name && <span className="text-sm text-red-500">{errors.Name.message}</span>}
              </div>

              {/* Province Dropdown */}
              <div className="space-y-2">
                <Label>Province</Label>
                <SelectDropdown
                  name="ProvinceId"
                  control={control}
                  required
                  options={getProvinceOptions().map(({ value, lable }) => ({
                    value,
                    label: lable,
                  }))}
                  error={errors.ProvinceId?.message}
                  placeholder={isLoadingProvinces ? 'Loading provinces...' : 'Select province'}
                  classNames={{ errorMessage: 'text-sm' }}
                  isLoading={isLoadingProvinces}
                  isDisabled={isLoadingProvinces}
                  onChange={(selectedOption) => {
                    if (selectedOption) {
                      setProvinceNum(parseInt(selectedOption.value) || 0);
                    } else {
                      setProvinceNum(0);
                    }
                  }}
                />
              </div>

              {/* Campus Dropdown */}
              <div className="space-y-2">
                <Label>Target Campus</Label>
                <SelectDropdown
                  name="CampusId"
                  control={control}
                  required
                  options={getCampusOptions().map(({ value, lable }) => ({
                    value,
                    label: lable,
                  }))}
                  error={errors.CampusId?.message}
                  placeholder={isLoadingCampuses ? 'Loading campuses...' : 'Select a campus'}
                  classNames={{ errorMessage: 'text-sm' }}
                  isLoading={isLoadingCampuses}
                  isDisabled={!ProvinceId || isLoadingCampuses}
                  onChange={(selectedOption) => {
                    if (selectedOption) {
                      setCampusNum(parseInt(selectedOption.value) || 0);
                    } else {
                      setCampusNum(0);
                    }
                  }}
                />
              </div>

              {/* Institution Dropdown */}
              <div className="space-y-2">
                <Label>Target Institution</Label>
                <SelectDropdown
                  name="InstitutionId"
                  control={control}
                  required
                  options={getInstitutionOptions().map(({ value, lable }) => ({
                    value,
                    label: lable,
                  }))}
                  error={errors.InstitutionId?.message}
                  placeholder={isLoadingInstitutions ? 'Loading institutions...' : 'Select target institution'}
                  classNames={{ errorMessage: 'text-sm' }}
                  isLoading={isLoadingInstitutions}
                  isDisabled={!CampusId || isLoadingInstitutions}
                />
              </div>

              {/* KM To Campus - Now auto-calculated but can still be manually edited */}
              <div className="space-y-2">
                <Label htmlFor="KMToCampus">KM To Campus</Label>
                <div className="relative">
                  <Input
                    id="KMToCampus"
                    {...register('KMToCampus', {
                      required: 'KM To Campus is required',
                      pattern: {
                        value: /^\d+(\.\d{1,2})?$/,
                        message: 'Please enter a valid number (up to 2 decimal places)',
                      },
                    })}
                    className={errors.KMToCampus ? 'border-red-500 pr-10' : 'pr-10'}
                    disabled={isCalculatingDistance}
                  />
                  {isCalculatingDistance && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ButtonLoader className="h-5 w-5" />
                    </div>
                  )}
                </div>
                {errors.KMToCampus && <span className="text-sm text-red-500">{errors.KMToCampus.message}</span>}
                <span className="text-xs flex">
                  <Info className="mr-1" size={15} />
                  This will be auto-calculated when both address and campus are selected
                </span>
              </div>
            </div>

            <div className="border-t pt-5">
              <div className="space-y-2 mb-4 flex flex-col">
                <Label htmlFor="address" className="mb-2">
                  Address
                  {!isAddressValid && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <div className="mb-4 flex flex-col gap-4">
                  <Button
                    type="button"
                    onClick={handleOpenAddressModal}
                    className={`${currentAddress ? 'bg-gray-600 hover:bg-gray-700' : 'bg-orange-500 hover:bg-orange-600'} text-white w-fit`}
                  >
                    {currentAddress ? 'Change Address' : 'Add Address'}
                  </Button>

                  {currentAddress ? (
                    <div
                      className={`flex items-start w-full gap-2 p-3 rounded-md ${isAddressValid ? 'bg-gray-100' : 'bg-red-100 border border-red-300'}`}
                    >
                      <MapPin className={`h-5 w-5 mt-0.5 ${isAddressValid ? 'text-gray-500' : 'text-red-500'}`} />
                      <div className="flex-1">
                        <p className="font-medium">
                          {currentAddress.formatted_address ||
                            [
                              currentAddress.addressLine1,
                              currentAddress.suburb,
                              currentAddress.city,
                              currentAddress.province,
                              currentAddress.postalCode,
                            ]
                              .filter(Boolean)
                              .join(', ')}
                        </p>
                        {!isAddressValid && (
                          <div className="mt-2 text-sm text-red-600 border-t border-red-200 pt-2">
                            {Object.entries(addressErrors).map(([key, value]) => (
                              <div key={key} className="flex items-center gap-1 mt-1">
                                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                <span>{value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-600">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <span>No address has been added. Please add an address to continue.</span>
                    </div>
                  )}

                  <input type="hidden" {...register('Address', { required: 'Address is required' })} />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-between pt-6">
              <div></div>
              <Button type="submit" disabled={isLoadingUpsert || !isAddressValid} className="bg-orange-500 hover:bg-orange-600">
                {isLoadingUpsert ? <ButtonLoader className="text-white" /> : 'Next'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResidentDetails;
