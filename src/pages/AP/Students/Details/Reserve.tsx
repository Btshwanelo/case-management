import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Info, X } from 'lucide-react';
import Logo from '@/assets/logo-black.png';
import { useNavigate } from 'react-router-dom';
import { useAccomodationApplicationMutation } from '@/services/apiService';
import { RootState } from '@/store';
import { Spinner } from '@/components/ui/spinner';
import ReserveApplicationSuccess from './SuccessReserve';
import { Input } from '@/components/ui/input';
import FormInput from '@/components/form-elements/FormInput';
import { useForm } from '@/hooks/useForm';
import { APReserveApplication } from '@/utils/validations';
import SelectDropdown from '@/components/form-elements/SelectDropDown';
import { useSelector } from 'react-redux';
import { showErrorToast } from '@/components/ErrorToast ';
import { useGetRoomTypesFacilityMutation } from '@/services/facilityService';

type FormData = {
  reservationDuration: string;
  roomNumber: string;
  capacityId: string;
  // plannedMoveInDate: string;
};

const ReserveApplicationPage = () => {
  const navigate = useNavigate();

  const accomodationDetails = useSelector((state: RootState) => state.accommodation);
  const applicationDetails = useSelector((state: RootState) => state.applicationReserve.application);
  const [
    accomodationApplication,
    {
      data: Application,
      isLoading: isLoadingApplication,
      isSuccess: isSuccessApplication,
      isError: isErrorApplication,
      error: errorApplication,
    },
  ] = useAccomodationApplicationMutation();
  const [GetRoomTypesFacility, roomTypesProps] = useGetRoomTypesFacilityMutation();

  const { control, errors, onSubmit, setValue } = useForm<FormData>({
    defaultValues: {
      capacityId: '',
      roomNumber: '',
      reservationDuration: '',
      // plannedMoveInDate: '',
    },
    validationSchema: APReserveApplication,
    onSubmit: (data) => {
      accomodationApplication({
        body: {
          entityName: 'AccomodationApplications',
          requestName: 'UpsertRecordReq',
          recordId: accomodationDetails.accomodationApplicationsId,
          inputParamters: {
            Entity: {
              StatusId: 69,
              CapacityId: data.capacityId,
              RoomNumber: data.roomNumber,
              ReservationDuration: data.reservationDuration,
              // PlannedMoveInDate: data.plannedMoveInDate,
            },
          },
        },
      });
    },
  });

  useEffect(() => {
    GetRoomTypesFacility({
      body: {
        entityName: 'Facility',
        recordId: accomodationDetails.facilityId,
        requestName: 'GetRoomTypes',
      },
    });
  }, []);

  if (isSuccessApplication) {
    return (
      <ReserveApplicationSuccess
        studentName={accomodationDetails.studentName}
        response={Application}
        onConfirm={() => navigate(`/residences`)}
      />
    );
  }

  if (isErrorApplication) {
    showErrorToast(errorApplication?.data || 'Something went wrong');
  }

  return (
    <div className="min-h-screen bg-white">
      {
        <>
          {/* Header */}
          <nav className=" md:block  border-b  border-orange-500">
            <div className="container mx-auto px-4 py-4 flex justify-between ">
              <img src={Logo} alt="NSFAS Logo" className="h-8" onClick={() => navigate('/')} />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => navigate(`/ap/accomodation-applications/${accomodationDetails.accomodationApplicationsId}`)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </nav>

          {/* Main Content */}
          <div className="container mx-auto px-4 py-6 max-w-3xl">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold mb-1">Reserve An Application </h1>
              <p className="text-gray-500">Complete Reservation Below</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="font-bold text-lg mb-3">How your Reservation works.</h3>
              <p className="text-gray-600 leading-relaxed">
                A reservation means booking a bed for a student to view a property. As an accommodation provider You can select a date for
                the student to view the residence.
              </p>
              {/* <p className="pt-4">
                <span className="font-bold">Verified students</span> can proceed to sign the lease immediately.
              </p>
              <p className="pt-4">
                <span className="font-bold">Unverified students</span> will only sign the lease after completing the verification process.{' '}
              </p> */}
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Planned Move-In date</label>
                  <Input value={applicationDetails?.plannedMoveInDate || 'Not selected'} disabled />
                  {/* <SelectDropdown
                    name="plannedMoveInDate"
                    control={control}
                    label={'Planned Move-In date'}
                    options={applicationDetails?.plannedMoveInDates.map((item) => ({
                      value: item,
                      label: item,
                    }))}
                    error={errors.plannedMoveInDate?.message}
                    placeholder="Select planned move in date"
                    isRequired={true}
                  /> */}
                  <p className="text-sm text-gray-500 italic flex items-center">
                    <Info size={15} className="mr-2 text-green-600" /> This is the date a student is planning to move in.
                  </p>
                </div>

                <div className="space-y-2">
                  <FormInput
                    name="reservationDuration"
                    control={control}
                    type="number"
                    max={30}
                    label="Reservation Duration (Days)"
                    error={errors.reservationDuration?.message}
                    placeholder="eg: 5"
                    isRequired={true}
                  />
                  <p className="text-sm text-gray-500 italic flex">
                    <Info size={15} className="mr-2 text-green-600" />
                    Student will have these number of days to view and sign lease in your property
                  </p>{' '}
                </div>

                <div className="space-y-2">
                  <FormInput
                    name="roomNumber"
                    control={control}
                    label="Room Number"
                    error={errors.roomNumber?.message}
                    placeholder="eg: 11F"
                    isRequired={true}
                  />
                </div>
                <div className="space-y-2">
                  <SelectDropdown
                    name="capacityId"
                    control={control}
                    label={'Room type'}
                    options={roomTypesProps?.data?.RoomTypes.map((item) => ({
                      value: item.capacityId,
                      label: item.name,
                    }))}
                    error={errors.capacityId?.message}
                    placeholder="Select room type"
                    isRequired={true}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="min-w-28"
                    onClick={() => navigate(`/ap/accomodation-applications/${accomodationDetails.accomodationApplicationsId}`)}
                  >
                    Back
                  </Button>
                  <Button className="min-w-28 bg-orange-500 hover:bg-orange-600" type="submit">
                    {isLoadingApplication ? <Spinner size="medium" className="text-white" /> : 'Confirm'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </>
      }
    </div>
  );
};

export default ReserveApplicationPage;
