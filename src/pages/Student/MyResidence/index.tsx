import Breadcrumb from '@/components/BreadCrumb';
import EmptyState from '@/components/EmptyState';
import ErrorPage from '@/components/ErrorPage';
import PageLoder from '@/components/PageLoder';
import ServiceNoticeModal from '@/components/ServeNotiveModal';
import SignWellWindow from '@/components/SignWellWindow';
import useCurrentUser from '@/hooks/useCurrentUser';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useMyResidenceMutation } from '@/services/capacityEntity';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MyResidence = () => {
  const [MyResidence, myResidenceProps] = useMyResidenceMutation();
  const [showLease, setShowLease] = useState(false);
  const [serveNotice, setServeNotice] = useState(false);
  const currentUser = useCurrentUser();

  const navigate = useNavigate();
  const breadcrumbItems = [{ path: '/student/my-residence', label: 'My Residence' }];
  useEffect(() => {
    MyResidence({
      body: {
        entityName: 'Tenant',
        requestName: 'MyResidenceReq',
        inputParamters: {
          studentId: currentUser.recordId,
        },
      },
    });
  }, []);

  return (
    <DashboardLayout>
      <Breadcrumb items={breadcrumbItems} />

      {myResidenceProps.isLoading && <PageLoder />}
      {myResidenceProps.isError && <ErrorPage message={myResidenceProps.error.data} />}

      {myResidenceProps.isSuccess && (
        <main className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl overflow-hidden mb-8">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400 rounded-full opacity-20 transform translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96">
              <div className="w-full h-full bg-gradient-to-tl from-orange-400 to-transparent opacity-30 transform rotate-45"></div>
            </div>
            <div className="relative px-8 py-12">
              <h1 className="text-4xl font-bold text-white mb-2">My Residence</h1>
              <p className="text-orange-100 text-lg">See your residences past and present.</p>
            </div>
          </div>

          {myResidenceProps.isSuccess && myResidenceProps.data.leaseDetails === null && (
            <div className="pt-7">
              <EmptyState title="No Active Residence" />
            </div>
          )}

          {myResidenceProps.data.leaseDetails != null && (
            <>
              {/* Tabs */}
              <div className="mb-8">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button className="py-2 px-1 border-b-2 border-orange-500 text-orange-600 font-medium text-sm">Present</button>
                    {/* <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
                Past
              </button> */}
                  </nav>
                </div>
              </div>

              {/* Residence Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="md:flex ">
                  {/* Image */}
                  <div className="md:w-1/2">
                    <img
                      src={myResidenceProps?.data?.leaseDetails?.coverImage}
                      alt="Student accommodation room"
                      className="w-full h-72 md:min-h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="md:w-1/2 p-4 space-y-3">
                    <div>
                      <span className="inline-block bg-orange-100 mr-3 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {myResidenceProps.data.leaseDetails.grade}
                      </span>
                      {myResidenceProps.data.leaseDetails.onNotice && (
                        <span className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Serving Notice
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-red-600 font-medium">Moved in {myResidenceProps.data.leaseDetails.moveInDate}</p>
                      <p className="text-sm text-red-600 font-medium">Move out {myResidenceProps.data.leaseDetails.moveOutDate}</p>
                    </div>

                    <h2 className="text-lg font-bold text-gray-900">{myResidenceProps.data.leaseDetails.facilityName}</h2>

                    <p className="text-gray-600 text-sm">{myResidenceProps.data.leaseDetails.address}</p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {myResidenceProps.data.leaseDetails.serveNotice && (
                        <button
                          onClick={() => setServeNotice(true)}
                          className="border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          Serve Notice
                        </button>
                      )}
                      <button
                        onClick={() => setShowLease(true)}
                        className="bg-orange-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-orange-600 transition-colors"
                      >
                        View Lease
                      </button>
                      <button
                        onClick={() => navigate('/cases/create')}
                        className="border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        Log a case
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {showLease && (
            <SignWellWindow
              show={showLease}
              url={myResidenceProps.data.leaseDetails.signingURL}
              onClose={() => {
                //   setSignWellState({ show: false, url: '' });
                setShowLease(false);
              }}
            />
          )}
          {serveNotice && (
            <ServiceNoticeModal
              isOpen={serveNotice}
              onCancell={() => setServeNotice(false)}
              onOpenChange={() => {
                setServeNotice(false);
                window.location.reload();
              }}
              residenceInfo={myResidenceProps.data.leaseDetails}
            />
          )}

          {/* Did You Know Section */}
          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3">
              <img 
                src="https://images.unsplash.com/photo-1494790108755-2616c9c47f02?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80" 
                alt="Smiling woman"
                className="w-full h-48 md:h-full object-cover"
              />
            </div>
            
            <div className="md:w-2/3 p-6 flex flex-col justify-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Did you know?</h3>
              <p className="text-gray-600 mb-4">
                That you can do a property viewing as many times as you want to, even if you've already done one before.
              </p>
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors w-fit">
                Start Property Viewing
              </button>
            </div>
          </div>
        </div> */}
        </main>
      )}
    </DashboardLayout>
  );
};

export default MyResidence;
