import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRetrievePageMasterValuesQuery } from '@/services/apiService';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import { showErrorToast } from '@/components/ErrorToast ';
import { showSuccessToast } from '@/components/SuccessToast';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import SelectDropdown from '@/components/form-elements/SelectDropDown';
import useResidence from '@/hooks/useResidence';
import { useFacilityUpsertRecordReqMutation } from '@/services/facilityService';
import { useRetrieveMasterValues1Mutation } from '@/services/masterValueService';

const genderDataIconMap: Record<string, string> = {
  Unisex: '👥',
  Female: '👩',
  Male: '👨',
};

const calcBedCount = (roomLabel: string, numberOfRooms: string) => {
  const regex = /\d+/;
  const match = roomLabel.match(regex);
  if (!match) {
    return 0;
  }
  return parseInt(match[0], 10) * parseInt(numberOfRooms, 10);
};

const RoomDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isUpdate = searchParams.get('update');

  const location = useLocation();
  const residentDetails = useResidence();

  // API mutations and queries
  const [FacilityUpsertRecordReq, { isLoading: isLoadingUpsert, isSuccess, isError, error, data: dataUpsert }] =
    useFacilityUpsertRecordReqMutation();
  const [RetrieveMasterValues1, { data }] = useRetrieveMasterValues1Mutation();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      gender: '',
      AmenityId: '',
      Quantity: '',
      totalBeds: '',
      DisablilityStatusId: '',
      CateringId: '',
      price: 500,
    },
  });

  const gender = useWatch({ name: 'gender', control });
  const totalRooms = useWatch({ name: 'Quantity', control });
  const AmenityId = useWatch({ name: 'AmenityId', control });

  useEffect(() => {
    const selectedRoomTypeLabel = amenityOptions.find((option) => option.value === AmenityId)?.lable || '';
    setValue('totalBeds', calcBedCount(selectedRoomTypeLabel, totalRooms).toString());
  }, [totalRooms, AmenityId]);

  useEffect(() => {
    RetrieveMasterValues1({
      body: {
        entityName: 'Facility',
        requestName: 'RetrieveMasterValues',
        inputParamters: {
          Page: 'add-room',
        },
      },
    });
  }, []);

  useEffect(() => {
    if (isUpdate && location.state && location.state.prevData) {
      const prevData = location.state.prevData;
      setValue('gender', prevData.genderId ? prevData.genderId.toString() : '');
      setValue('AmenityId', prevData.amenityId);
      if (!totalRooms) {
        setValue('Quantity', prevData.quantity);
      }
      setValue('totalBeds', prevData.totalCapacity);
      setValue('DisablilityStatusId', prevData.disabilityId);
      setValue('CateringId', prevData.cateringId);
    }
  }, [location.state, isUpdate, data]);

  // Helper function to get options from staticData
  const getOptions = (schemaName) => {
    return data?.staticData?.find((item) => item.schemaName === schemaName)?.options || [];
  };

  const amenityOptions = getOptions('AmenityId');
  const disabilityOptions = getOptions('DisablilityStatusId');
  const cateringOptions = getOptions('CateringId');
  const genderOptions = getOptions('GenderId');

  const getLabelByValue = (options: { lable: string; value: string }[], targetValue: string): string => {
    const option = options.find((opt) => opt.value === targetValue);
    return option?.lable || '';
  };

  const onSubmit = async (formData) => {
    const payload = {
      entityName: 'Capacity',
      requestName: 'UpsertRecordReq',
      recordId: location.state?.prevData?.capacityId || undefined,
      inputParamters: {
        Entity: {
          Quantity: formData.Quantity,
          GenderId: formData.gender,
          DisabilityAccessId: formData.DisablilityStatusId,
          Capacity: getLabelByValue(amenityOptions, formData.AmenityId), //need label
          AmenityId: formData.AmenityId,
          CateringId: formData.CateringId,
          FacilityId: residentDetails.facilityId,
          AmenityTypeId: 859,
          // PricePerBed: formData.price,
          // Beds: formData.totalBeds,
        },
      },
    };
    await FacilityUpsertRecordReq({ body: payload });
  };

  useEffect(() => {
    if (isError) {
      showErrorToast(error?.data || 'Something went wrong when adding room');
    }
  }, [isError]);

  useEffect(() => {
    if (isSuccess) {
      navigate('/residence-summary');
      showSuccessToast(dataUpsert?.data || 'room added successfullly');
    }
  }, [isSuccess]);

  const handleBackClick = () => {
    navigate(`/add-residence?update=true&residenceId=${residentDetails.facilityId}`);
  };

  return (
    <div className="lg:col-span-9">
      <Card>
        <CardHeader>
          <CardTitle>Room Details</CardTitle>
          <CardDescription>Configure your room details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base">
                Gender<span className="text-red-500">*</span>
              </Label>
              <Controller
                key={gender}
                name="gender"
                rules={{ required: 'Gender is required' }}
                control={control}
                render={({ field: { value, onChange, disabled } }) => (
                  <RadioGroup
                    className="grid grid-cols-3 gap-4"
                    disabled={disabled}
                    defaultValue={value}
                    value={value}
                    onValueChange={onChange}
                  >
                    {genderOptions.map((option) => (
                      <Label
                        key={option.value}
                        className={cn(
                          'flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer',
                          gender === option.value && 'border-orange-500 bg-orange-50'
                        )}
                      >
                        <RadioGroupItem value={option.value} className="sr-only" />
                        <span className="text-2xl mb-2">{genderDataIconMap[option.lable]}</span>
                        <span className="text-sm font-medium">{option.lable}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                )}
              />
              {errors.gender && <span className="text-sm text-red-500">{errors.gender.message}</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>
                  Room Type<span className="text-red-500">*</span>
                </Label>
                <SelectDropdown
                  name="AmenityId"
                  control={control}
                  required
                  options={amenityOptions.map(({ value, lable }) => ({
                    value,
                    label: lable,
                  }))}
                  error={errors.AmenityId?.message}
                  placeholder="Select room type"
                  classNames={{ errorMessage: 'text-sm' }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="Quantity">
                  Total Number of rooms<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="Quantity"
                  type="number"
                  {...register('Quantity', {
                    required: 'Total rooms is required',
                    min: { value: 1, message: 'Must have at least 1 room' },
                  })}
                />
                {errors.Quantity && <span className="text-sm text-red-500">{errors.Quantity.message}</span>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalBeds">Total Number of beds</Label>
                <Input
                  id="totalBeds"
                  type="number"
                  readOnly
                  {...register('totalBeds', {
                    min: { value: 1, message: 'Must have at least 1 bed' },
                  })}
                />
                {errors.totalBeds && <span className="text-sm text-red-500">{errors.totalBeds.message}</span>}
              </div>

              <div className="space-y-2">
                <Label>
                  Disability Friendly Access<span className="text-red-500">*</span>
                </Label>
                <SelectDropdown
                  name="DisablilityStatusId"
                  control={control}
                  required
                  options={disabilityOptions.map(({ value, lable }) => ({
                    value,
                    label: lable,
                  }))}
                  error={errors.DisablilityStatusId?.message}
                  placeholder="Select accessibility option"
                  classNames={{ errorMessage: 'text-sm' }}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Catering<span className="text-red-500">*</span>
                </Label>
                <SelectDropdown
                  name="CateringId"
                  control={control}
                  required
                  options={cateringOptions.map(({ value, lable }) => ({
                    value,
                    label: lable,
                  }))}
                  error={errors.CateringId?.message}
                  placeholder="Select accessibility option"
                  classNames={{ errorMessage: 'text-sm' }}
                />
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={handleBackClick}>
                Back
              </Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={isLoadingUpsert}>
                {isLoadingUpsert ? 'Saving...' : 'Next'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomDetails;
