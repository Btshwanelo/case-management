import Breadcrumb from '@/components/BreadCrumb';
import ErrorPage from '@/components/ErrorPage';
import PageLoder from '@/components/PageLoder';
import DashboardLayout from '@/layouts/DashboardLayout';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users, CheckCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useExecuteRequest1Mutation } from '@/services/apiService';
import useAuth from '@/hooks/useAuth';

const AppointmentDetails = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const userDetails = useAuth();

  const breadcrumbItems = [
    { path: '/appointment', label: 'Appointments' },
    { path: `/appointment/${eventId}`, label: 'Appointment Details' }
  ];

  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [RetrieveEventsReq, retrieveEventsReqProps] = useExecuteRequest1Mutation();

  // Fetch event details
  useEffect(() => {
    RetrieveEventsReq({
      body: {
        "entityName": "Events",
        "requestName": "RetrieveEventsReq",
        "inputParamters": {
          "UserId": userDetails.user.externalLogonId
        }
      }
    });
  }, [userDetails?.user?.externalLogonId]);

  // Handle events API response and find the specific booked event
  useEffect(() => {
    if (retrieveEventsReqProps.data?.Events) {
      const bookedEvent = retrieveEventsReqProps.data.Events.find(
        event => event.eventId === eventId && event.bookingId
      );
      
      if (bookedEvent) {
        setAppointmentDetails(bookedEvent);
        setLoading(false);
      } else {
        setError('Booking not found or you have not booked this event yet');
        setLoading(false);
      }
    }
    if (retrieveEventsReqProps.error) {
      setError('Failed to load appointment details');
      setLoading(false);
    }
  }, [retrieveEventsReqProps.data, retrieveEventsReqProps.error, eventId]);

  const handleBackToHome = () => {
    navigate('/appointment');
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <Breadcrumb items={breadcrumbItems} />
        <PageLoder />
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <Breadcrumb items={breadcrumbItems} />
        <ErrorPage message={error} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Breadcrumb items={breadcrumbItems} />

      <div className="mx-auto min-h-[calc(100vh-200px)] max-w-7xl space-y-6">
        {/* Success Page Design - Same as original */}
        <div className="grid grid-cols-1 min-h-[calc(100vh-200px)] lg:grid-cols-3 gap-8">
          {/* Left Panel - Booking Details */}
          <div className="lg:col-span-1 h-full">
            <Card className="bg-[#FDEAD7] px-[32px] h-full rounded-2xl border-none">
              <CardHeader className="space-y-6">
                <CardTitle className="text-4xl font-bold text-[#101828]">Booking Details</CardTitle>
                <CardDescription className="text-[#475467]">Below are the details of your booking as provided by you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {appointmentDetails && (
                  <div className="flex gap-2 items-start">
                    <Calendar className="w-8 h-8" />
                    <h3 className="font-normal text-[#475467] mb-3">
                      {appointmentDetails?.name}{' '}
                      <span className="font-normal">
                        {appointmentDetails.location}| {appointmentDetails.dates}
                      </span>
                    </h3>
                  </div>
                )}

                {appointmentDetails?.eventTimeSlot &&  (
                  <div>
                    <div className="flex items-center space-x-2 text-[#475467]">
                      <Clock className="w-6 h-6" />
                      <span>
                        {appointmentDetails.eventTimeSlot} 
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center space-x-2 text-[#475467]">
                    <Users className="w-6 h-6" />
                    <span>{(appointmentDetails?.numberOfPeople || 0)} People</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-[#475467]">
                    <CheckCircle2 className="w-6 h-6" />
                    <span>Booking Reference: <span className="font-semibold border-b-2 border-black">{appointmentDetails?.bookingReference}</span></span>
                  </div>
                </div>
                {/* Information Message */}
                  <div className="mt-6 p-4 ">
                    <div className="flex items-start gap-3">
                     
                      <div className="flex-1">
                        <h4 className=" font-bold mb-2">
                          Session Preparation Requirements
                        </h4>
                        <div className="text-sm text-gray-700 space-y-2">
                          <p>Kindly ensure the following items are prepared for the session:</p>
                          <div className="">
                            <p className="font-medium">An Excel spreadsheet containing the following details:</p>
                            <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                              <li>Student's full name and surname</li>
                              <li>ID number</li>
                              <li>Process cycle information</li>
                            </ul>
                          </div>
                          <p className="mt-3">
                            <span className="font-bold">Please note:</span> This information is also available on the portal. 
                            You can access it under the billing screen by clicking the Export button, which will allow you to 
                            download the required data for the session.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Success Message */}
          <div className="lg:col-span-2 h-full">
            <Card className="shadow-none border-none bg-inherit">
              <CardContent className="p-12 text-center">
                <div className="mb-8">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-orange-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed</h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Your appointment has been confirmed. Your booking reference is: <span className="font-semibold border-b-2 border-black">{appointmentDetails?.bookingReference}</span>
                  </p>
                </div>

                <Button onClick={handleBackToHome} className="bg-orange-500 hover:bg-orange-600 px-8">
                  Back to Appointments
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AppointmentDetails;