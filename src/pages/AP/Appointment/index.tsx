import Breadcrumb from '@/components/BreadCrumb';
import ErrorPage from '@/components/ErrorPage';
import PageLoder from '@/components/PageLoder';
import DashboardLayout from '@/layouts/DashboardLayout';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useExecuteRequest1Mutation } from '@/services/apiService';
import useAuth from '@/hooks/useAuth';

const EventsList = () => {
  const breadcrumbItems = [{ path: '/appointment', label: 'Appointments' }];

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const userDetails = useAuth();
  
  const [RetrieveEventsReq, retrieveEventsReqProps] = useExecuteRequest1Mutation();

  // Fetch events on component mount
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

  // Handle events API response
  useEffect(() => {
    if (retrieveEventsReqProps.data?.Events) {
      setEvents(retrieveEventsReqProps.data.Events);
      setLoading(false);
    }
    if (retrieveEventsReqProps.error) {
      setError('Failed to load events');
      setLoading(false);
    }
  }, [retrieveEventsReqProps.data, retrieveEventsReqProps.error]);

  const handleBookAppointment = (event) => {
    navigate(`/appointment/${event.eventId}/booking`);
  };

  const handleViewDetails = (event) => {
    navigate(`/appointment/${event.eventId}`);
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
        <div className="grid grid-cols-1 min-h-[calc(100vh-200px)] lg:grid-cols-3 gap-8">
          {/* Left Panel - Info */}
          <div className="lg:col-span-1 h-full">
            <Card className="bg-[#FDEAD7] px-[32px] h-full rounded-2xl border-none">
              <CardHeader className="space-y-6">
                <CardTitle className="text-4xl font-bold text-[#101828]">NSFAS Roadshow</CardTitle>
                <CardDescription className="text-[#475467]">
                  View all available roadshow events. You can book appointments for upcoming events or view details of your existing bookings.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Right Panel - Events List */}
          <div className="lg:col-span-2 h-full">
            <Card className="border-none max-w-[40rem] mx-auto bg-inherit shadow-none">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Available Events</h2>
                    <p className="text-gray-600 mb-6">Select an event to book an appointment or view your existing bookings.</p>
                  </div>

                  <div className="space-y-3">
                    {events.map((event) => (
                      <div
                        key={event.eventId}
                        className="p-4 border rounded-lg hover:bg-gray-50 border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                              <h3 className="font-medium text-gray-900">{event.name}</h3>
                              <p className="text-sm text-gray-600">{event.dates}</p>
                              <p className="text-sm text-gray-500">{event.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {event.bookingId ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(event)}
                              >
                                View Booking
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="bg-orange-500 hover:bg-orange-600"
                                onClick={() => handleBookAppointment(event)}
                              >
                                Book Appointment
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EventsList;