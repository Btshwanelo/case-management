import React, { useEffect } from 'react';
import { Home, FolderClosed, User, ChevronRight, ChevronDown, X, ArrowLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetCheckInRoomTypesMutation } from '@/services/apiService';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { ButtonLoader } from '@/components/ui/button-loader';
import { showErrorToast } from '@/components/ErrorToast ';
import { Progress } from '@/components/ui/progress';

const RoomInformation = ({ onNextStep, onBack, onClose, onConfirm, isSuccessCheckIn, isErrorCheckIn, isLoadingCheckIn }) => {
  const { id: checkInId } = useParams<{ id: string }>();

  const [options, setOptions] = React.useState<{ label: string; value: string }[]>([]);

  const userDetails = useSelector((state: RootState) => state.details.requestResults);
  const navigate = useNavigate();

  const [getCheckInRoomTypes, { isLoading, isError, isSuccess, data, error }] = useGetCheckInRoomTypesMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useFormContext();

  useEffect(() => {
    getCheckInRoomTypes({
      body: {
        entityName: 'CheckIn',
        requestName: 'GetCheckInRoomTypes',
        recordId: checkInId,
      },
    });
  }, []);

  useEffect(() => {
    if (isSuccess) {
      setOptions(
        data.RoomTypes.map((roomType) => ({
          label: roomType.name,
          value: roomType.capacityId,
        }))
      );
    }
  }, [isSuccess]);

  const onSubmit = handleSubmit((data) => {
    console.log('data', data);
    onConfirm({
      RoomNumber: data.roomName,
      NumberofBeds: data.NumberOfBeds,
      CapacityId: data.roomType,
    });
  });

  useEffect(() => {
    if (isSuccessCheckIn) {
      onNextStep();
    }
  }, [isSuccessCheckIn]);

  if (isErrorCheckIn) {
    showErrorToast('Error capturing room details');
  }

  if (isError) {
    showErrorToast(error?.data || 'Something went wrong when getting room types.');
  }
  const progressValue = Math.min(100, Math.max(0, (4 / 10) * 100));

  return (
    <DashboardLayout>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-3xl space-y-4 ">
        <div className="mb-2">
          <div className="flex justify-between items-center mb-4">
            {/* <button className="p-2" onClick={onClose}>
              <ArrowLeft className="w-5 h-5" />
            </button> */}
            <div></div>
            <button className="p-2" onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 w-full bg-gray-200 rounded-full">
            <Progress className="bg-gray-300" value={progressValue} />
          </div>
          <div className="text-right text-sm text-gray-500 mt-1">{progressValue}%</div>
        </div>
        <h2 className="text-black text-xl font-medium mb-2">ROOM INFORMATION</h2>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Room Name/Number */}
          <div className="space-y-1">
            <label className="block text-gray-600">Room number/name</label>
            <Input
              type="text"
              placeholder="eg: 001"
              className={`w-full border rounded-md  ${errors.roomName ? 'border-red-500' : ''}`}
              {...register('roomName', {
                required: 'This field is required',
              })}
            />
            {errors.roomName && <p className="text-red-500 mt-1">{errors?.roomName?.message}</p>}
          </div>

          {/* Room Type */}
          <div className="space-y-1">
            <label className="block text-gray-600">Room type</label>
            <Select
              {...register('roomType', {
                required: 'This field is required',
              })}
              onValueChange={(value) => setValue('roomType', value)} // Update form value when selection changes
            >
              <SelectTrigger className={`w-full  ${errors.roomType ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
              <SelectContent>
                {options.map((type, index) => (
                  <SelectItem key={index} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roomType && <p className="text-red-500 mt-1">{errors?.roomType?.message}</p>}
          </div>

          {/* Room Size */}
          <div className="space-y-1">
            <label className="block text-gray-600">Number of beds in the room (Number)</label>
            <Input
              type="number"
              placeholder="eg: 12"
              className={`w-full border rounded-md  ${errors.NumberOfBeds ? 'border-red-500' : ''}`}
              {...register('NumberOfBeds', {
                required: 'This field is required',
              })}
            />
            {errors.NumberOfBeds && <p className="text-red-500 mt-1">{errors?.NumberOfBeds?.message}</p>}
          </div>

          {/* Floor Number */}
          {/* <div className="space-y-2">
            <label className="block text-gray-600">Floor number</label>
            <Select>
              <SelectTrigger className="w-full p-6">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                {floorNumbers.map(number => (
                  <SelectItem key={number} value={number.toString()}>
                    {number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}

          {/* Get Started Button */}
          <button className="w-full py-2  bg-orange-500 hover:bg-orange-600 text-white rounded-lg mt-10 flex items-center justify-center gap-2">
            {isLoadingCheckIn ? (
              <ButtonLoader size="large" className="text-white" />
            ) : (
              <>
                Lets go
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Cancel Button */}
        </form>
        {/* <button
          onClick={() => navigate('/student/checkin/')}
          className="w-full mt-4 py-4 flex items-center justify-center gap-2 text-gray-600"
        >
          <X className="w-5 h-5" />
          Cancel
        </button> */}
      </div>
    </DashboardLayout>
  );
};

export default RoomInformation;
