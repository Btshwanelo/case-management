import React, { useEffect } from 'react';
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
  useFacilityRetrievePrevFacilityDataQuery,
  useFacilityUpsertRecordReqMutation,
  useUpdateAmenityMutation,
} from '@/services/apiService';
import { showSuccessToast } from '@/components/SuccessToast';
import { showErrorToast } from '@/components/ErrorToast ';
import { useRetrieveMasterValues1Mutation } from '@/services/masterValueService';
import { useCapacityAddMultipleReqMutation, useCapacityUpsertRecordReqMutation } from '@/services/capacityEntity';
import { useRetrivePrevFacilityDataMutation } from '@/services/facilityService';

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
  const options = ['None', '1', '2', '3'];
  return (
    <div className="space-y-3" data-testid="">
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
            {option === '3' ? '3+' : option}
          </Button>
        ))}
      </div>
    </div>
  );
};

const AmenitiesDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isUpdate = searchParams.get('update');
  const residentDetails = useSelector((state: RootState) => state.resident);
  const facilityId = residentDetails.facilityId;
  // API mutations and queries
  const [RetrieveMasterValues1, { data }] = useRetrieveMasterValues1Mutation();
  const [CapacityAddMultipleReq, { isLoading, isSuccess }] = useCapacityAddMultipleReqMutation();
  const [CapacityUpsertRecordReq, { isLoading: updateIsLoading, isError: updateIsError, isSuccess: updateIsSuccess }] =
    useCapacityUpsertRecordReqMutation();
  const [RetrivePrevFacilityData, { data: prevData, isSuccess: isSuccessPrev }] = useRetrivePrevFacilityDataMutation();

  // Initialize amenities state from API options
  const [amenities, setAmenities] = React.useState<AmenityState>({});

  const getOptions = (schemaName: string): AmenityOption[] => {
    return data?.staticData?.find((item) => item.schemaName === schemaName)?.options || [];
  };

  const amenityOptions = getOptions('AmenityId');

  // Initialize amenities state when options are loaded
  useEffect(() => {
    if (amenityOptions.length > 0) {
      const initialState = amenityOptions.reduce(
        (acc, option) => ({
          ...acc,
          [option.value]: 'None',
        }),
        {}
      );
      setAmenities(initialState);
    }
  }, [amenityOptions]);
  useEffect(() => {
    RetrivePrevFacilityData({
      body: {
        entityName: 'Facility',
        requestName: 'RetrievePrevFacilityData',
        inputParamters: {
          Page: 'describe-rooms',
          FacilityId: residentDetails.facilityId,
        },
      },
    });
  }, []);

  const handleAmenityChange = (amenityId: string, value: string) => {
    if (isUpdate) {
      handleUpdateAmenity(amenityId, value);
      setAmenities((prev) => ({
        ...prev,
        [amenityId]: value,
      }));
    }

    if (!isUpdate) {
      setAmenities((prev) => ({
        ...prev,
        [amenityId]: value,
      }));
    }
  };

  const formatAmenitiesForSubmission = () => {
    return Object.entries(amenities)
      .filter(([_, quantity]) => quantity !== 'None')
      .map(([amenityId, quantity]) => ({
        Quantity: quantity === '3+' ? '3' : quantity,
        AmenityId: amenityId,
        FacilityId: facilityId,
      }));
  };

  const handleUpdateAmenity = (capacityId, quantity) => {
    const id = prevData?.roomDescriptions.find((a: any) => a.amenityId === capacityId)?.capacityId || '';
    CapacityUpsertRecordReq({
      body: {
        entityName: 'Capacity',
        requestName: 'UpsertRecordReq',
        recordId: id,
        inputParamters: {
          Entity: {
            Quantity: quantity,
          },
        },
      },
    });
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
    RetrieveMasterValues1({
      body: {
        entityName: 'Facility',
        requestName: 'RetrieveMasterValues',
        inputParamters: {
          Page: 'describe-rooms',
        },
      },
    });
  }, []);

  useEffect(() => {
    if (isUpdate && prevData && amenityOptions.length > 0) {
      for (const amenityOption of amenityOptions) {
        const amenityId = amenityOption.value;
        const quantity = prevData.roomDescriptions.find((a: any) => a.amenityId === amenityOption.value)?.quantity || '';
        setAmenities((prev) => ({
          ...prev,
          [amenityId]: quantity.toString(),
        }));
      }
    }
  }, [prevData, isUpdate, data, amenityOptions]);

  const handleBackClick = () => {
    navigate(`/residence-summary?update=true`);
  };

  if (isSuccess) {
    navigate(isUpdate ? '/more-about-property?update=true' : '/more-about-property');
  }

  if (updateIsSuccess) {
    showSuccessToast('Amenity Updated Successfully');
    window.location.reload();
  }
  if (updateIsError) {
    showErrorToast('Error Updating Amenity');
  }

  return (
    <div className="lg:col-span-9">
      <Card>
        <CardHeader>
          <CardTitle>Amenities</CardTitle>
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
  );
};

export default AmenitiesDetails;
