import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InfoIcon, HomeIcon, ChevronRight, ChevronsUpDown } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAccomodationApplicationMutation, useEmployeeMutation, useRetrieveSignwellReqMutation } from '@/services/apiService';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import XiqModal from '@/components/XiqModal';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getStatusBadgeClass } from '@/utils';
import StudentDetailsView from './StudentMoreDetails';
import Breadcrumb from '@/components/BreadCrumb';
import SignWellWindow from '@/components/SignWellWindow';
import ErrorPage from '@/components/ErrorPage';
import { showMessageToast } from '@/components/MessageToast';
import { useAccomodationAppRegenerateLeaseMutation } from '@/services/accomodationApplicationsEntity';
import { showSuccessToast } from '@/components/SuccessToast';
import { showErrorToast } from '@/components/ErrorToast ';
import EzraSignModal from '@/components/SignWellWindow/EzraSignModal';

const UserProfile = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = React.useState(false);
  let { id, recordId } = useParams();
  const constactNo = searchParams.get('number');
  const [isChecked, setIsChecked] = useState(false);
  const [studentSearchParams, setStudentSearchParams] = useState({});
  const [isNsfas, setIsNsfas] = useState(false);
  console.log('id', id, recordId);
  const [showSignWellWindow, setShowSignWellWindow] = useState(false);
  const [signWellUrl, setSignWellUrl] = useState('');
  const [signwellAction, setSignwellAction] = useState('');

  const handleCheckboxChange = (checked: boolean) => {
    setIsChecked(checked);
  };
  let urlEntryPoint = recordId === undefined ? id : recordId;
  let urlEntryPointName = recordId === undefined ? 'StudentDetailsReq' : 'StudentDetailsReq';
  let urlentityName = recordId === undefined ? 'Employee' : 'AccomodationApplications';
  const [showModal, setShowModal] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [{ isWorking, actionIndex }, setWorkingStatus] = useState<{
    isWorking: boolean;
    actionIndex: number;
  }>({
    isWorking: false,
    actionIndex: -1,
  });

  const userDetails = useSelector((state: RootState) => state.details.requestResults);

  const [employee, { isLoading, isSuccess, isError, data, error: employeeError }] = useEmployeeMutation();
  const [
    accomodationApplication,
    { isLoading: isLoadingAccomodation, isSuccess: isSuccessAccomodation, isError: isErrorAccomodation, data: dataAccomodation },
  ] = useAccomodationApplicationMutation();
  const [
    AccomodationAppRegenerateLease,
    {
      isLoading: isLoadingRegenerateAccomodation,
      isSuccess: isSuccessRegenerateAccomodation,
      error: errorRegenerateAccomodation,
      isError: isErrorRegenerateAccomodation,
      data: dataRegenerateAccomodation,
    },
  ] = useAccomodationAppRegenerateLeaseMutation();

  const [
    retrieveSignwellReq,
    { isLoading: isLoadingSignWell, isSuccess: isSuccessSignWell, isError: isErrorSignWell, data: dataSignWell },
  ] = useRetrieveSignwellReqMutation();

  useEffect(() => {
    // Parse the URL search params
    const params = new URLSearchParams(window.location.search);

    // Convert params into an object
    const extractedParams = {};
    params.forEach((value, key) => {
      extractedParams[key] = value;
    });

    // Set state with the extracted params
    setStudentSearchParams(extractedParams);

    // Check if `isNSFAS` is present and true
    if (params.has('isNSFAS') && params.get('isNSFAS') === 'true') {
      setIsNsfas(true);
    }
  }, []);

  const InputparamtersObj =
    isNsfas === true
      ? {
          accomodationProviderId: userDetails.supplierId,
          Listing: [studentSearchParams],
        }
      : {
          accomodationProviderId: userDetails.supplierId,
        };

  useEffect(() => {
    employee({
      body: {
        entityName: urlentityName,
        requestName: urlEntryPointName,
        recordId: urlEntryPoint,
        Inputparamters: InputparamtersObj,
      },
    });
  }, [showReserveModal, showModal, isNsfas]);

  const InviteHandler = (index: number) => {
    navigate(`/ap/students/${data?.StudentDetails.idNumber}/invite?numbers=${constactNo}`);
  };
  const RegenerateHandler = (index: number) => {
    AccomodationAppRegenerateLease({
      body: {
        entityName: 'AccomodationApplications',
        requestName: 'RegenerateLeaseExecRequest',
        recordId: recordId,
      },
    });
  };

  const ApproveHandler = async (index: number) => {
    console.log('ApproveHandler');
    navigate('/ap/accomodation-applications/reserve');
  };

  const RejectHandler = async (index: number) => {
    accomodationApplication({
      body: {
        entityName: 'AccomodationApplications',
        requestName: 'UpsertRecordReq',
        recordId: recordId,
        inputParamters: {
          Entity: {
            StatusId: 70,
          },
        },
      },
    });
  };

  const ViewLease = async (index: number, action: string) => {
    setShowSignWellWindow(false);
    setSignWellUrl('');
    setSignwellAction(action);

    retrieveSignwellReq({
      body: {
        entityName: 'AccomodationApplications',
        requestName: 'RetrieveSignwellReq',
        recordId: recordId,
        inputParamters: {
          UserType: 'AP',
        },
      },
    });
  };

  const SignLease = async (index: number, action: string) => {
    if (data?.APSignLeaseurl === null) {
      showMessageToast(
        `Your lease is being prepared! You'll receive an email with the lease document shortly. You can also check back here in a few minutes to sign it directly.`
      );
      return;
    }

    setShowSignWellWindow(true);
    setSignWellUrl(data?.APSignLeaseurl);
    setSignwellAction(action);

    // retrieveSignwellReq({
    //   body: {
    //     entityName: 'AccomodationApplications',
    //     requestName: 'RetrieveSignwellReq',
    //     recordId: recordId,
    //     inputParamters: {
    //       UserType: 'AP',
    //     },
    //   },
    // });
  };

  useEffect(() => {
    if (!isSuccessSignWell) return;

    // if (signwellAction === 'Sign Lease') {
    //   setShowSignWellWindow(true);
    //   setSignWellUrl(dataSignWell.url);
    // } else
    if (signwellAction === 'View Lease') {
      setWorkingStatus({ isWorking: true, actionIndex: -1 });
      window.open(dataSignWell.url);
    }
  }, [isSuccessSignWell, dataSignWell, signwellAction]);

  const getActionHandler = (action, index) => () => {
    switch (action) {
      case 'Invite':
        // InviteHandler(index);
        break;
      case 'Accept Risk':
        ApproveHandler(index);
        break;
      case 'Regenerate':
        RegenerateHandler(index);
        break;
      case 'Reserve':
        ApproveHandler(index);
        break;
      case 'Reject':
        RejectHandler(index);
        break;
      case 'View Lease':
        ViewLease(index, action);
        break;
      case 'Sign Lease':
        SignLease(index, action);
        break;
      case 'Renew':
        break;
    }
  };

  const breadcrumbItems = [{ path: '/ap/accomodation-applications', label: 'Student Details' }];

  useEffect(() => {
    if (isSuccessAccomodation) {
      setShowModal(true);
    }
  }, [isSuccessAccomodation]);

  useEffect(() => {
    if (isSuccessRegenerateAccomodation) {
      showSuccessToast(dataRegenerateAccomodation?.clientMessage);
    }
  }, [isSuccessRegenerateAccomodation]);
  if (isErrorRegenerateAccomodation) {
    showErrorToast(errorRegenerateAccomodation?.data || 'Error regenerating lease');
  }

  // if (isError) {
  //   return <ErrorPage message={employeeError?.data} />;
  // }

  return (
    <DashboardLayout>
      <Breadcrumb items={breadcrumbItems} />
      {isError && <ErrorPage message={employeeError?.data} />}
      {isLoading && (
        <div className="w-full min-h-[80vh] flex mt-6 justify-center items-center">
          <Spinner size="large" />
        </div>
      )}
      {showModal && (
        <XiqModal
          message={dataAccomodation?.clientMessage}
          open={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={() => setShowModal(false)}
        />
      )}

      {showSignWellWindow && (
        // <EzraSignModal
        //   show={showSignWellWindow}
        //   url={signWellUrl}
        //   onClose={() => {
        //     setShowSignWellWindow(false);
        //     setSignWellUrl('');
        //     setSignwellAction('');
        //   }}
        // />
        <SignWellWindow
          show={showSignWellWindow}
          url={signWellUrl}
          onClose={() => {
            setShowSignWellWindow(false);
            setSignWellUrl('');
            setSignwellAction('');
          }}
        />
      )}

      {isSuccess && (
        <div className=" space-y-6">
          <div className="grid md:grid-cols-[300px,1fr] gap-6">
            {/* Left Sidebar */}
            <div className="space-y-6">
              {/* Profile Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium mb-3 text-2xl">Personal Info</h3>

                  <div className="border-b border-gray-300 mb-4  pb-4">
                    <h2 className="text-xl font-normal">{data?.StudentDetails.name}</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="space-y-3">
                        <div className="border-b border-gray-300 mb-4  pb-4">
                          <div className="text-sm text-gray-700">Email</div>
                          <div>{data?.StudentDetails.email}</div>
                        </div>
                        <div className="border-b border-gray-300 mb-4  pb-4">
                          <div className="text-sm text-gray-700">Cellphone</div>
                          <div>{data?.StudentDetails.mobile}</div>
                        </div>
                        <div className="border-b border-gray-300 mb-4  pb-4">
                          <div className="text-sm text-gray-700">ID Number</div>
                          <div>{data?.StudentDetails.idNumber}</div>
                        </div>
                        {/* asked to remove it by ronell */}
                        <div className="border-b border-gray-300 mb-4  pb-4">
                          <div className="text-sm text-gray-700">Gender</div>
                          <div className="text-sm text-gray-700">{data?.StudentDetails.gender}</div>
                        </div>

                        <div className="border-b border-gray-300 mb-4  pb-4">
                          <div className="text-sm text-gray-700">Study Term</div>
                          <div>{data?.StudentDetails.termTypetext}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Lease Details</h2>

                    {data.LeaseDetails.map((lease) => (
                      <div className="border-b border-gray-300 mb-4 pb-4">
                        <div className="flex justify-between mb-2">
                          <div className="font-medium">{lease.title}</div>
                          {lease.status != null && lease.status != '' && (
                            <Badge variant={getStatusBadgeClass(lease.status)}>{lease.status}</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-700">{lease.value}</div>
                        <div className="text-sm text-gray-700"></div>
                      </div>
                    ))}
                    {data.LeaseDetails.length < 1 && <div className="font-medium  mt-9 justify-self-center">No lease history found</div>}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Funding Details</h2>

                    {data.FundingStatus.map((lease) => (
                      <div className="border-b border-gray-300 mb-4  pb-4">
                        <div className="flex justify-between mb-2">
                          <div className="font-medium ">{lease.title} </div>
                          {lease.status != null && lease.status != '' && (
                            <Badge variant={getStatusBadgeClass(lease.status)}>{lease.status}</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-700">{lease.value}</div>
                        <div className="text-sm text-gray-700"></div>
                      </div>
                    ))}
                    {data.FundingStatus.length < 1 && <div className="font-medium  mt-9 justify-self-center">No funding history found</div>}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-6">
                  <Collapsible open={isOpen} onOpenChange={setIsOpen} className=" space-y-2">
                    <div className="flex items-center justify-between space-x-4 px-0">
                      <h4 className="text-xl font-semibold">View more student details</h4>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto flex items-center rounded-lg hover:bg-[#FF692E] hover:text-white border-2 px-[14px] py-[10px] bg-[#FF692E] text-white shadow-sm justify-center gap-2 border-[#ffffff1f]"
                        >
                          <ChevronsUpDown className="h-4 w-4" />
                          View
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent className="">
                      <StudentDetailsView data={data.nsfasFundingStatus} />
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-2">Summary</h2>
                  <p className="text-gray-700 mb-4">A quick summary of the student's current status and what you can do about it.</p>
                  <div className="bg-gray-50 p-4 rounded-lg border flex gap-3">
                    <InfoIcon className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-medium mb-2">{data.Notice[0].message}</div>
                      <p className="text-gray-700 text-sm">{data.Notice[0].description} </p>
                    </div>
                  </div>
                </CardContent>
                {data.Notice[0].consentRequired && (
                  <CardContent>
                    <Checkbox checked={isChecked} onCheckedChange={handleCheckboxChange} className="mr-1" /> {data.Notice[0].consentMessage}
                  </CardContent>
                )}
              </Card>

              {data?.Actions.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-2">Actions</h2>
                    <p className="text-gray-700 mb-4">These are the actions you can take based on the student's profile</p>
                    {(isLoadingSignWell || isLoadingAccomodation || isLoadingRegenerateAccomodation) && (
                      <div className="flex justify-center mb-4">
                        <Spinner className="text-orange-500" />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4">
                      {data?.Actions.map((item, index) => (
                        <Button
                          key={index}
                          onClick={getActionHandler(item, index)}
                          className="bg-orange-500 max-w-36 hover:bg-orange-600 flex-1 md:flex-none"
                          size="lg"
                          disabled={
                            data.Notice[0].consentRequired === true &&
                            !isChecked &&
                            (isLoadingSignWell || isLoadingAccomodation || isLoadingRegenerateAccomodation)
                          }
                        >
                          {item}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserProfile;
