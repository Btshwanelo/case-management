import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import {
  useLazyFacilityRetrieveMasterValuesQuery,
  useFacilityUpsertRecordReqMutation,
  useFacilityRetrievePrevFacilityDataQuery,
  useUpdateAmenityMutation,
} from '@/services/apiService';
import { showSuccessToast } from '@/components/SuccessToast';
import { showErrorToast } from '@/components/ErrorToast ';
import DashboardLayout from '@/layouts/DashboardLayout';
import Sidebar from './Sidebar';

interface AmenityOption {
  lable: string;
  value: string;
}

interface AmenityState {
  [key: string]: string;
}

const AmenitySelection = ({
  label,
  value,
  onChange,
  tooltip,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  tooltip: string;
}) => {
  const options = ['Yes', 'No'];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="text-base font-medium">{label}</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-orange-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex gap-3">
        {options.map((option) => (
          <Button
            key={option}
            variant="outline"
            className={cn('flex-1 border-2', value === option ? 'border-orange-500 bg-orange-50 text-orange-700' : 'hover:bg-orange-50')}
            onClick={() => onChange(option)}
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
};

const More = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isUpdate = searchParams.get('update');
  const residentDetails = useSelector((state: RootState) => state.resident);
  const facilityId = residentDetails.facilityId;
  const initialLoadRef = useRef(true);

  const [facilityRetrieveMasterValues, { data }] = useLazyFacilityRetrieveMasterValuesQuery();
  const [facilityUpsertRecordReq, { isLoading, isSuccess }] = useFacilityUpsertRecordReqMutation();
  const [updateAmenity, { isLoading: updateIsLoading, isError: updateIsError, isSuccess: updateIsSuccess }] = useUpdateAmenityMutation();

  // Initialize amenities state from API options
  const [amenities, setAmenities] = React.useState<AmenityState>({});

  const getOptions = (schemaName: string): AmenityOption[] => {
    return data?.staticData?.find((item) => item.schemaName === schemaName)?.options || [];
  };

  const amenityOptions = getOptions('AmenityId');

  // Initialize amenities state when options are loaded
  // useEffect(() => {
  //   if (amenityOptions.length > 0) {
  //     const initialState = amenityOptions.reduce(
  //       (acc, option) => ({
  //         ...acc,
  //         [option.value]: 'No',
  //       }),
  //       {}
  //     );
  //     setAmenities(initialState);
  //   }
  // }, [amenityOptions]);

  const handleAmenityChange = (amenityId: string, value: string) => {
    if (isUpdate) {
      handleUpdateAmenity(amenityId, value);
      setAmenities((prev) => ({
        ...prev,
        [amenityId]: value,
      }));
    } else {
      setAmenities((prev) => ({
        ...prev,
        [amenityId]: value,
      }));
    }
  };

  const handleUpdateAmenity = (capacityId: string, quantity: string) => {
    const id = prevData?.moreAboutProperty?.find((a: any) => a.amenityId === capacityId)?.capacityId || '';
    updateAmenity({
      body: {
        entityName: 'Capacity',
        requestName: 'UpsertRecordReq',
        recordId: id,
        inputParamters: {
          Entity: {
            Quantity: quantity === 'Yes' ? 1 : 0,
          },
        },
      },
    });
  };

  const { data: prevData } = useFacilityRetrievePrevFacilityDataQuery({
    FacilityId: residentDetails.facilityId,
    Page: 'more-about-property',
  });

  // useEffect(() => {
  //   if (isUpdate && prevData && amenityOptions.length > 0 && initialLoadRef.current) {
  //     initialLoadRef.current = false;
  //     const newAmenities = { ...amenities };

  //     for (const amenityOption of amenityOptions) {
  //       const amenityId = amenityOption.value;
  //       const value = prevData.moreAboutProperty.find((a: any) => a.amenityId === amenityOption.value)?.quantity === '1' ? 'Yes' : 'No';
  //       newAmenities[amenityId] = value;
  //     }

  //     setAmenities(newAmenities);
  //   }
  // }, [prevData, isUpdate, amenityOptions]);

  useEffect(() => {
    // Only run when updating with previous data, amenity options exist, and on initial load
    if (isUpdate && prevData && amenityOptions.length > 0 && initialLoadRef.current) {
      initialLoadRef.current = false;
      const newAmenities = { ...amenities };

      // Process each amenity option
      amenityOptions.forEach((amenityOption) => {
        const amenityId = amenityOption.value;

        // Find matching amenity in prevData
        const matchingAmenity = prevData.moreAboutProperty.find((amenity) => amenity.amenityId === amenityId);

        // Convert quantity to Yes/No value
        // Use optional chaining and explicitly convert to string for comparison
        const value = String(matchingAmenity?.quantity) === '1' ? 'Yes' : 'No';

        // Set the value in newAmenities
        newAmenities[amenityId] = value;
      });
      setAmenities(newAmenities);
    }
  }, [prevData, isUpdate, amenityOptions]);

  useEffect(() => {
    if (isUpdate && prevData && amenityOptions.length > 0 && initialLoadRef.current) {
      initialLoadRef.current = false;
      const newAmenities = { ...amenities };

      amenityOptions.forEach((amenityOption) => {
        const amenityId = amenityOption.value;

        // Find first (latest) entry for this amenityId
        const latestAmenity = prevData.moreAboutProperty.find((amenity) => amenity.amenityId === amenityId);

        // Convert to Yes/No based on the first occurrence's quantity
        const value = String(latestAmenity?.quantity) === '1' ? 'Yes' : 'No';

        newAmenities[amenityId] = value;
      });

      setAmenities(newAmenities);
    }
  }, [prevData, isUpdate, amenityOptions]);

  const formatAmenitiesForSubmission = () => {
    return Object.entries(amenities)
      .filter(([_, quantity]) => quantity !== 'None')
      .map(([amenityId, quantity]) => ({
        Quantity: quantity === 'No' ? 0 : 1,
        AmenityId: amenityId,
        FacilityId: facilityId,
      }));
  };

  const handleSubmit = async () => {
    const formattedAmenities = formatAmenitiesForSubmission();

    if (formattedAmenities.length === 0) return;

    const payload = {
      entityName: 'Capacity',
      requestName: 'AddMultipleReq',
      inputParamters: {
        Amenities: formattedAmenities,
      },
    };

    await facilityUpsertRecordReq({ body: payload });
  };

  useEffect(() => {
    facilityRetrieveMasterValues({
      body: {
        entityName: 'Facility',
        requestName: 'RetrieveMasterValues',
        inputParamters: {
          Page: 'more-about-property',
        },
      },
    });
  }, []);

  useEffect(() => {
    if (isSuccess) {
      navigate(isUpdate ? '/upload-property-images?update=true' : '/upload-property-images');
    }
  }, [isSuccess, isUpdate, navigate]);

  useEffect(() => {
    if (updateIsSuccess) {
      showSuccessToast('Amenity Updated Successfully');
      // Update local state instead of reloading
      setAmenities((prev) => ({ ...prev }));
    }
    if (updateIsError) {
      showErrorToast('Error Updating Amenity');
    }
  }, [updateIsSuccess, updateIsError]);

  const handleBackClick = () => {
    navigate(`/describe-rooms?update=true&residenceId=${residentDetails.facilityId}`);
  };

  console.log('amenities', amenities);
  console.log('amenityOptions', amenityOptions);
  console.log('1:', amenities['d2383494-e800-4d8e-9eea-dfad1fa63c52']);
  console.log('2:', amenities['3f6aad75-117e-46ce-a3f9-0c3f5835b912']);
  console.log('3:', amenities['ffe8e26f-abba-43a5-911d-e979f9e08c21']);
  console.log('4:', amenities['adbc5ba7-6aad-4ad9-a7c4-0d76ad94f254']);
  console.log('5:', amenities['6d2403fe-c476-463e-bc0a-9e16f5d1b7e1']);
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4 max-w-[1200px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Progress Steps */}
          <Sidebar currentStep={3} />
          {/* Main Content */}
          <div className="lg:col-span-9">
            <Card>
              <CardHeader>
                <CardTitle>Additional Offerings</CardTitle>
                <CardDescription>Select the amenities available in your accommodation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {amenityOptions.map((amenity) => (
                    <AmenitySelection
                      key={amenity.value}
                      label={amenity.lable}
                      value={amenities[amenity.value] || 'None'}
                      onChange={(value) => handleAmenityChange(amenity.value, value)}
                      tooltip={`Number of ${amenity.lable.toLowerCase()} available`}
                    />
                  ))}
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Select appropriate quantities for each amenity type
                    </p>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <Button variant="outline" type="button" onClick={handleBackClick}>
                    Back
                  </Button>
                  <Button
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={handleSubmit}
                    disabled={isLoading || Object.values(amenities).every((v) => v === 'None')}
                  >
                    {isLoading ? 'Saving...' : 'Next'}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default More;
