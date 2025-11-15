import {
  useDeleteRoomMutation,
  useLazyFacilityRetrieveMasterValuesQuery,
  useLazyFacilityRetrievePrevFacilityDataQuery,
} from '@/services/apiService';
import { RootState } from '@/store';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ChevronRight, CircleX, Delete, DeleteIcon } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Bed } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from './Components/Sidebar';
import { Spinner } from '@/components/ui/spinner';
import { showSuccessToast } from '@/components/SuccessToast';
import { showErrorToast } from '@/components/ErrorToast ';
import { useRetrieveMasterValues1Mutation } from '@/services/masterValueService';
import { useRetrivePrevFacilityDataMutation } from '@/services/facilityService';
import { useCapacityRemoveRecordMutation } from '@/services/capacityEntity';

const ResidenceSummary = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isUpdate = searchParams.get('update');
  const residentDetails = useSelector((state: RootState) => state.resident);

  const handleOnAddRoom = () => {
    navigate('/add-room');
  };

  const getGenderLabel = (genderId: number) => {
    switch (genderId) {
      case 1:
        return 'Male';
      case 2:
        return 'Female';
      case 841:
        return 'Unisex';
      default:
        return 'Unknown';
    }
  };

  // API mutations and queries
  const [RetrivePrevFacilityData, { data: dataPerv, isLoading: isLoadingPrev, isSuccess: isSuccessPrev }] =
    useRetrivePrevFacilityDataMutation();
  const [RetrieveMasterValues1, { data, isLoading }] = useRetrieveMasterValues1Mutation();
  const [
    CapacityRemoveRecord,
    { data: dataDeleteRoom, isLoading: deleteIsLoading, isError: isErrorDelete, error: errorDelete, isSuccess: deleteIsSuccess },
  ] = useCapacityRemoveRecordMutation();

  useEffect(() => {
    RetrieveMasterValues1({
      body: {
        entityName: 'Facility',
        requestName: 'RetrieveMasterValues',
        inputParamters: {
          Page: 'residence-summary',
        },
      },
    });

    RetrivePrevFacilityData({
      body: {
        entityName: 'Facility',
        requestName: 'RetrievePrevFacilityData',
        inputParamters: {
          Page: 'residence-summary',
          FacilityId: residentDetails.facilityId,
        },
      },
    });
  }, []);

  const handleBackClick = () => {
    navigate(`/add-residence?update=true&residenceId=${residentDetails.facilityId}`);
  };

  const getOnEditClickHandler = (prevData: Record<string, any>) => () => {
    navigate(`/add-room?update=true&residenceId=${residentDetails.facilityId}`, { state: { prevData } });
  };

  const handleDeleteRoom = (capacityId, roomCapacity) => {
    CapacityRemoveRecord({
      body: {
        entityName: 'Capacity',
        requestName: 'RemoveRecordReq',
        recordId: capacityId,
        inputParamters: {
          capacity: roomCapacity,
        },
      },
    });
  };

  if (deleteIsSuccess) {
    showSuccessToast('Room deleted');
    window.location.reload();
  }
  if (isErrorDelete) {
    showErrorToast('Something went wrong when removing room');
  }

  const getTotalCapacity = (rooms) => {
    return rooms?.reduce((total, room) => total + room.totalCapacity, 0);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4 max-w-[1200px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Progress Steps */}
          <Sidebar currentStep={2} />

          {/* Main Content */}
          <div className="lg:col-span-9">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Room Capacity Summary</CardTitle>
                    <CardDescription>Overview of your residence rooms</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                      <Bed className="h-4 w-4" />
                      <span className="text-sm font-medium">Total Beds: {getTotalCapacity(dataPerv?.RoomSummary?.rooms)}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-600">Inspection Fee: R{dataPerv?.RoomSummary?.inspectionFee}</div>
                  </div>
                </div>
              </CardHeader>
              {deleteIsLoading && (
                <div>
                  <Spinner />
                </div>
              )}
              <CardContent className="space-y-6">
                {dataPerv?.RoomSummary?.rooms.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No rooms added yet</p>
                    <Button onClick={handleOnAddRoom} className="mt-4 bg-orange-500 hover:bg-orange-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Room
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {dataPerv?.RoomSummary?.rooms.map((room, index) => (
                        <div key={room.capacityId} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:justify-between">
                            <div className="space-y-1">
                              <h3 className="font-semibold text-lg">{room.name}</h3>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center gap-6">
                                  <span>Gender: {getGenderLabel(room.genderId)}</span>
                                  <span>Room Type: {room.amenityIdName}</span>
                                  <span>Quantity: {room.quantity} rooms</span>
                                </div>
                                <div className="flex items-center gap-6">
                                  <span>Catering: {room.catering}</span>
                                  <span>Disability Friendly: {room.disabilityFriendly || 'Unknown'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={getOnEditClickHandler(room)} className="">
                                <Edit2 className="h-4 max-w-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteRoom(room.capacityId, room.totalCapacity)}
                                className="border border-red-500 text-red-500"
                              >
                                <CircleX className="h-4 max-w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button onClick={() => navigate('/add-room')} className=" bg-orange-500 hover:bg-orange-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Add another room type
                    </Button>
                  </>
                )}
                <div className="flex justify-between pt-6">
                  <Button variant="outline" type="button" onClick={handleBackClick}>
                    Back
                  </Button>
                  <Button
                    onClick={() => navigate(isUpdate ? '/describe-rooms?update=true' : '/describe-rooms')}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Next
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

export default ResidenceSummary;
