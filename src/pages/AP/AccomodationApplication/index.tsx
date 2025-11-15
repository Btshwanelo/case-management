import DashboardLayout from '@/layouts/DashboardLayout';
import { useGetStudentDetailsMutation } from '@/services/apiService';
import { useGetRoomTypesFacilityMutation } from '@/services/facilityService';
import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const AccomodatinoApplication = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  let { id } = useParams();

  console.log('id', id);
  const [
    getStudentDetails,
    {
      isLoading: isLoadingStudentDetails,
      isSuccess: isSuccessStudentDetails,
      isError: isErrorStudentDetails,
      error: errorStudentDetails,
      data: dataStudentDetails,
    },
  ] = useGetStudentDetailsMutation();

  const [GetRoomTypesFacility, roomTypesProps] = useGetRoomTypesFacilityMutation();

  useEffect(() => {
    getStudentDetails({
      body: {
        entityName: 'AccomodationApplications',
        requestName: 'StudentDetailsReq',
        recordId: id,
        Inputparamters: {
          accomodationProviderId: 'c8b6f76b-9db8-4788-bb90-f4cccd0ad57b',
        },
      },
    });
  }, [id]);

  return (
    <DashboardLayout>
      <div>
        {isLoadingStudentDetails && <div>Loading...</div>}
        {isErrorStudentDetails && <div>Error...</div>}
        {isSuccessStudentDetails && <div>Success Data</div>}
      </div>
    </DashboardLayout>
  );
};

export default AccomodatinoApplication;
