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
import { useFacilityRetrievePrevFacilityDataQuery, useUpdateAmenityMutation } from '@/services/apiService';
import { showSuccessToast } from '@/components/SuccessToast';
import { showErrorToast } from '@/components/ErrorToast ';
import DashboardLayout from '@/layouts/DashboardLayout';
import Sidebar from './Components/Sidebar';
import { useRetrieveMasterValues1Mutation } from '@/services/masterValueService';
import { useFacilityUpsertRecordReqMutation, useRetrivePrevFacilityDataMutation } from '@/services/facilityService';
import { useCapacityAddMultipleReqMutation, useCapacityUpsertRecordReqMutation } from '@/services/capacityEntity';

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

const MoreAboutProperty = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isUpdate = searchParams.get('update');
  const residentDetails = useSelector((state: RootState) => state.resident);
  const facilityId = residentDetails.facilityId;
  const initialLoadRef = useRef(true);

  const [RetrieveMasterValues1, { data }] = useRetrieveMasterValues1Mutation();
  const [CapacityAddMultipleReq, { isLoading, isSuccess }] = useCapacityAddMultipleReqMutation();
  const [CapacityUpsertRecordReq, { isLoading: updateIsLoading, isError: updateIsError, isSuccess: updateIsSuccess }] =
    useCapacityUpsertRecordReqMutation();
  const [RetrivePrevFacilityData, { data: prevData }] = useRetrivePrevFacilityDataMutation();

  // Initialize amenities state from API options
  const [amenities, setAmenities] = React.useState<AmenityState>({});

  const getOptions = (schemaName: string): AmenityOption[] => {
    return data?.staticData?.find((item) => item.schemaName === schemaName)?.options || [];
  };

  const amenityOptions = getOptions('AmenityId');

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
    CapacityUpsertRecordReq({
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

    await CapacityAddMultipleReq({ body: payload });
  };

  useEffect(() => {
    RetrivePrevFacilityData({
      body: {
        entityName: 'Facility',
        requestName: 'RetrievePrevFacilityData',
        inputParamters: {
          FacilityId: residentDetails.facilityId,
          Page: 'more-about-property',
        },
      },
    });
    RetrieveMasterValues1({
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

export default MoreAboutProperty;
