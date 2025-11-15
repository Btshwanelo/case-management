import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, SnailIcon } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import config from '@/config';
import { useNavigate } from 'react-router-dom';
import DeletePropertyModal from './DeletePropertyModal';
import WithdrawModal from './WithdrawModal';
import {
  useFacilityRemoveRecordReqMutation,
  useFacilityUpsertRecordReqMutation,
  useFetchRecordWithDocsReqMutation,
  useRetrieveAPFacilitiesMutation,
} from '@/services/apiService';
import { RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner } from '@/components/ui/spinner';
import { resetResidence, setResidence, updateResidenceField } from '@/slices/residentSlice';
import PageLoder from '@/components/PageLoder';
import Breadcrumb from '@/components/BreadCrumb';
import ErrorPage from '@/components/ErrorPage';
import EmptyState from '@/components/EmptyState';
import EmptyStateIcon from '@/assets/NoDocuments__1.png';
import { showSuccessToast } from '@/components/SuccessToast';
import { showErrorToast } from '@/components/ErrorToast ';

const APDashboard = ({ userDetails }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState({});
  const [retrieveAPFacilities, { data, isLoading, isSuccess, isError, error }] = useRetrieveAPFacilitiesMutation();
  console.log('withdrawModal', withdrawModal);
  const [
    facilityRemoveRecordReq,
    { data: dataRemove, isLoading: removeIsLoading, isSuccess: removeIsSuccess, isError: removeIsError, error: removeError },
  ] = useFacilityRemoveRecordReqMutation();
  const [
    facilityUpsertRecordReq,
    { data: dataUpsert, isLoading: upsertIsLoading, isSuccess: upsertIsSuccess, isError: upsertIsError, error: upsertError },
  ] = useFacilityUpsertRecordReqMutation();

  const handlePayNow = () => {
    navigate('/payment-options');
  };
  const handleEditMe = (facilityId: string, fullEdit?: boolean) => {
    if (fullEdit) {
      navigate(`/add-residence?update=true&residenceId=${facilityId}`, { state: { fullEdit: true } });
    } else {
      navigate(`/upload-property-images?update=true&residenceId=${facilityId}`, { state: { fullEdit: false } });
    }
  };
  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleOnConfirmDelete = () => {
    facilityRemoveRecordReq({
      body: {
        entityName: 'Facility',
        recordId: selectedFacility.facilityId,
        requestName: 'RemoveRecordReq',
      },
    });
  };
  const handleOnConfirmWithdraw = () => {
    facilityUpsertRecordReq({
      body: {
        entityName: 'Facility',
        recordId: selectedFacility.facilityId,
        requestName: 'UpsertRecordReq',
        inputParamters: {
          Entity: {
            FacilityStatusId: '872',
          },
        },
      },
    });
  };
  const handleWithdraw = () => {
    console.log('withdraw');
    setWithdrawModal(true);
  };

  const getActionHandler = (action, index, residence) => () => {
    setSelectedFacility(residence);
    dispatch(setResidence(residence));
    dispatch(updateResidenceField({ field: 'currentAction', value: action }));
    switch (action) {
      case 'Delete':
        handleDelete(index);
        break;
      case 'Pay Now':
        handlePayNow(index);
        break;
      case 'WithDraw':
        handleWithdraw(index);
        break;
      case 'Edit Me':
        handleEditMe(residence.facilityId, residence.fullEdit);
        break;
    }
  };

  useEffect(() => {
    retrieveAPFacilities({
      body: {
        entityName: 'Supplier',
        requestName: 'RetrieveAPFacilities',
        inputParamters: {
          UserId: userDetails.supplierId,
        },
      },
    });
  }, []);

  const handleActionResident = (resident) => {
    // dispatch(addAmenity(resident));
  };

  useEffect(() => {
    if (removeIsSuccess) {
      showSuccessToast('Property Deleted Successfully');
      setShowDeleteModal(false);
      // Optionally refresh the facilities list
      retrieveAPFacilities({
        body: {
          entityName: 'Supplier',
          requestName: 'RetrieveAPFacilities',
          inputParamters: {
            UserId: userDetails.supplierId,
          },
        },
      });
    }
    if (removeIsError) {
      showErrorToast('Something went wrong');
    }
  }, [removeIsSuccess, removeIsError]);

  useEffect(() => {
    if (upsertIsSuccess) {
      showSuccessToast('Property Updated Successfully');
      setWithdrawModal(false);
      // Optionally refresh the facilities list
      retrieveAPFacilities({
        body: {
          entityName: 'Supplier',
          requestName: 'RetrieveAPFacilities',
          inputParamters: {
            UserId: userDetails.supplierId,
          },
        },
      });
    }
    if (upsertIsError) {
      showErrorToast('Something went wrong updating the property');
    }
  }, [upsertIsSuccess, upsertIsError]);

  const getButtonStyle = (buttonName) => {
    const name = buttonName.toLowerCase();

    if (name.includes('pay') || name.includes('submit')) {
      return 'w-full sm:w-auto flex items-center rounded-lg hover:bg-[#FF692E] hover:text-white border-2 px-[14px] py-[10px] bg-[#FF692E] text-white shadow-sm justify-center gap-2 border-[#ffffff1f]';
    }

    if (name.includes('edit')) {
      return 'w-full sm:w-auto flex items-center rounded-lg hover:bg-[#FF692E] hover:text-white border-2 px-[14px] py-[10px] bg-[#FF692E] text-white shadow-sm justify-center gap-2 border-[#ffffff1f]';
    }

    if (name.includes('delete') || name.includes('remove')) {
      return 'w-full sm:w-auto flex items-center rounded-lg hover:bg-red-500 hover:text-white border-2 px-[14px] py-[10px] bg-red-500 text-white shadow-sm justify-center gap-2 border-[#ffffff1f]';
    }

    // Default style for other buttons
    return 'w-full sm:w-auto flex items-center rounded-lg hover:bg-[#FF692E] hover:text-white border-2 px-[14px] py-[10px] bg-[#FF692E] text-white shadow-sm justify-center gap-2 border-[#ffffff1f]';
  };

  const breadcrumbItems = [{ path: '/dashboard', label: 'Dashboard' }];

  return (
    <DashboardLayout>
      <Breadcrumb items={breadcrumbItems} />

      {isLoading && <PageLoder />}
      {isError && <ErrorPage message={error.data} />}

      {isSuccess && data?.Facility.length < 1 && (
        <EmptyState
          title="No residences found"
          description="Create your first item to get started"
          icon={EmptyStateIcon}
          action={{
            label: 'Add New Property',
            onClick: () => {
              dispatch(resetResidence());
              navigate('/add-residence');
            },
          }}
          // secondaryAction={{
          //   label: "Refresh",
          //   onClick: () =>  console.log()
          // }}
        />
      )}

      {isSuccess && data?.Facility?.length > 0 && (
        <div className=" mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-2">
              {/* <h1 className="text-3xl font-bold tracking-tight">My Residences</h1>
              <p className="text-gray-500">Manage and view your property offer letters</p> */}
            </div>

            <Button
              className="w-full sm:w-auto flex items-center rounded-lg hover:bg-[#FF692E] hover:text-white border-2 px-[14px] py-[10px] bg-[#FF692E] text-white shadow-sm justify-center gap-2 border-[#ffffff1f]"
              onClick={() => {
                dispatch(resetResidence());
                navigate('/add-residence');
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Property
            </Button>
          </div>

          {showDeleteModal && (
            <DeletePropertyModal
              open={showDeleteModal}
              isLoading={removeIsLoading}
              onClose={() => setShowDeleteModal(false)}
              onConfirm={() => handleOnConfirmDelete()}
            />
          )}
          {withdrawModal && (
            <WithdrawModal
              open={withdrawModal}
              isLoading={upsertIsLoading}
              isSuccess={upsertIsSuccess}
              onClose={() => setWithdrawModal(false)}
              onConfirm={() => handleOnConfirmWithdraw()}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {data?.Facility?.map((residence, index) => (
              <Card key={index} className="overflow-hidden bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                {/* Card Image */}
                <div className="relative h-48">
                  {residence?.documents[0]?.url ? (
                    <img
                      src={residence.documents[0].url}
                      alt="Residence"
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <img src={`https://placehold.co/600x400?text=Place+Holder`} alt="Residence" className="w-full h-full object-cover" />
                  )}
                  <span className="absolute top-4 left-4 bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-sm">
                    {residence.facilityStatusIdText}
                  </span>
                </div>

                {/* Card Content */}
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-1 flex items-center justify-center space-x-2">
                      <p className="text-yellow-700 font-medium">Move-In Code:</p>
                      <p className="font-bold text-yellow-800">{residence.checkInCode}</p>
                    </div>

                    <div className=" divide-y divide-gray-100">
                      <div className="grid grid-cols-2 py-2">
                        <p className="text-gray-500 font-medium">Name</p>
                        <p className="text-gray-900">{residence.name}</p>
                      </div>

                      <div className="grid grid-cols-2 py-1">
                        <p className="text-gray-500 font-medium">Target Institution</p>
                        <p className="text-gray-900">{residence.targetInstitution}</p>
                      </div>

                      <div className="grid grid-cols-2 py-1">
                        <p className="text-gray-500 font-medium">Address</p>
                        <p className="text-gray-900">{residence.address}</p>
                      </div>

                      <div className="grid grid-cols-2 py-2">
                        <p className="text-gray-500 font-medium">Total Beds</p>
                        <p className="text-gray-900">{residence.totalBeds}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Card Footer */}
                <CardFooter className="px-6 pb-6">
                  {residence.buttons.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 w-full">
                      {residence.buttons.map((item, index) => (
                        <Button
                          key={index}
                          className={`${getButtonStyle(item)} shadow-sm transition-all duration-200 hover:shadow-md`}
                          onClick={getActionHandler(item, index, residence)}
                        >
                          {item}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center w-full">No actions available</p>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default APDashboard;
