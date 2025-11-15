import Breadcrumb from '@/components/BreadCrumb';
import ErrorPage from '@/components/ErrorPage';
import PageLoder from '@/components/PageLoder';
import DashboardLayout from '@/layouts/DashboardLayout';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, ChevronRight, Users, X, Minus, Plus, CheckCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useExecuteRequest1Mutation, useExecuteRequest2Mutation, useExecuteRequest3Mutation } from '@/services/apiService';
import useAuth from '@/hooks/useAuth';
import { showErrorToast } from '@/components/ErrorToast ';

const AppointmentBooking = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const userDetails = useAuth();

  const breadcrumbItems = [
    { path: '/appointment', label: 'Appointments' },
    { path: `/appointment/${eventId}/booking`, label: 'Book Appointment' }
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showPeopleModal, setShowPeopleModal] = useState(false);
  const [additionalPeople, setAdditionalPeople] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // API state
  const [eventTimeslots, setEventTimeslots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [RetrieveEventsReq, retrieveEventsReqProps] = useExecuteRequest1Mutation();
  const [RetrieveEventDatesAndTimeSlots, retrieveEventDatesAndTimeSlotsProps] = useExecuteRequest2Mutation();
  const [bookAppointmentReq, bookAppointmentReqProps] = useExecuteRequest3Mutation();

  // Fetch specific event details
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

  // Handle events API response and find the specific event
  useEffect(() => {
    if (retrieveEventsReqProps.data?.Events) {
      const event = retrieveEventsReqProps.data.Events.find(e => e.eventId === eventId);
      if (event) {
        setSelectedEvent(event);
        setLoading(false);
      } else {
        setError('Event not found');
        setLoading(false);
      }
    }
    if (retrieveEventsReqProps.error) {
      setError('Failed to load event details');
      setLoading(false);
    }
  }, [retrieveEventsReqProps.data, retrieveEventsReqProps.error, eventId]);

  // Fetch event dates and timeslots when event is loaded
  useEffect(() => {
    if (selectedEvent?.eventId) {
      RetrieveEventDatesAndTimeSlots({
        body: {
          "entityName": "Events",
          "requestName": "RetrieveEventDatesAndTimeSlots",
          "inputParamters": {
            "EventId": selectedEvent.eventId
          }
        }
      });
    }
  }, [selectedEvent?.eventId]);

  // Handle event timeslots API response
  useEffect(() => {
    if (retrieveEventDatesAndTimeSlotsProps.data?.EventTimeslots) {
      const timeslots = retrieveEventDatesAndTimeSlotsProps.data.EventTimeslots;
      setEventTimeslots(timeslots);
      
      // Transform API data to match component structure
      const transformedDates = timeslots.map(dateSlot => ({
        eventDateId: dateSlot.eventDateId,
        date: dateSlot.name,
        timeSlots: dateSlot.timeSlots.map(slot => ({
          timeslotId: slot.timeslotId,
          name: slot.name,
          maxBooking: slot.maxBooking
        }))
      }));
      
      setAvailableDates(transformedDates);
    }
  }, [retrieveEventDatesAndTimeSlotsProps.data]);

  const handleDateSelect = (dateOption) => {
    setAdditionalPeople(1)
    setSelectedDate(dateOption);
    setSelectedTime(null); // Reset time selection when date changes
  };

  const handleTimeSelect = (timeSlot) => {
    setAdditionalPeople(1);
    setSelectedTime(timeSlot);
  };

  const handleNext = () => {
    if (currentStep === 1 && selectedDate && selectedTime) {
      setShowPeopleModal(true);
    }
  };

  const handleBack = () => {
    navigate('/appointment');
  };

  useEffect(() => {
    if (bookAppointmentReqProps.isSuccess) {
      setShowSuccess(true);
    }
  }, [bookAppointmentReqProps.isSuccess]);

  useEffect(() => {
    if (bookAppointmentReqProps.isError) {
      showErrorToast(bookAppointmentReqProps.error?.data || 'Failed to book appointment. Please try again later.');
    }
  }, [bookAppointmentReqProps.isError]);

  const handleConfirmPeople = async () => {
    setShowPeopleModal(false);
    
    try {
      await bookAppointmentReq({
        body: {
          "entityName": "Booking",
          "requestName": "MakeEventBookingReq",
          "inputParamters": {
            "EventBooking": {
              "AttendeeId": userDetails.user.externalLogonId,
              "EventId": selectedEvent.eventId,
              "EventDateId": selectedDate.eventDateId,
              "EventTimeSlotId": selectedTime.timeslotId,
              "NumberOfPeople": additionalPeople+1,
              "AttendeeIdObjectTypeCode": "Supplier"
            }
          }
        }
      });
    } catch (err) {
      console.error('Error booking appointment:', err);
      showErrorToast('Failed to book appointment. Please try again later.');
    }
  };

  const handleSkipPeople = () => {
    setAdditionalPeople(0);
    handleConfirmPeople();
  };

  const incrementPeople = () => {
    if (additionalPeople < 2) {
      setAdditionalPeople(additionalPeople + 1);
    }
  };

  const decrementPeople = () => {
    if (additionalPeople > 1) {
      setAdditionalPeople(additionalPeople - 1);
    }
  };

  const handleBackToHome = () => {
    navigate('/appointment');
  };

  const canProceed = () => {
    return selectedDate && selectedTime;
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
        {!showSuccess ? (
          <div className="grid grid-cols-1 min-h-[calc(100vh-200px)] lg:grid-cols-3 gap-8">
            {/* Left Panel - Event Details */}
            <div className="lg:col-span-1 h-full">
              <Card className="bg-[#FDEAD7] px-[32px] h-full rounded-2xl border-none">
                <CardHeader className="space-y-6">
                  <CardTitle className="text-4xl font-bold text-[#101828]">Book Appointment</CardTitle>
                  <CardDescription className="text-[#475467]">
                    Select your preferred date and time for the roadshow session.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedEvent && (
                    <div className="flex gap-2 items-start">
                      <Calendar className="w-8 h-8" />
                      <h3 className="font-normal text-[#475467] mb-3">
                        {selectedEvent?.name}{' '}
                        <span className="font-normal">
                          {selectedEvent.location} {selectedEvent.dates}
                        </span>
                      </h3>
                    </div>
                  )}

                  {selectedTime && (
                    <div>
                      <div className="flex items-center space-x-2 text-[#475467]">
                        <Clock className="w-6 h-6" />
                        <span>
                          {selectedDate.date} | {selectedTime.name}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Date & Time Selection */}
            <div className="lg:col-span-2 h-full">
              <Card className="border-none max-w-[40rem] mx-auto bg-inherit shadow-none">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Select Date & Time</h2>
                      <p className="text-gray-600 mb-6">Choose your preferred date and time slot for the appointment.</p>
                    </div>

                    <div className="space-y-4">
                      {availableDates.map((dateOption) => (
                        <div key={dateOption.eventDateId} className="border rounded-lg">
                          <div
                            className={`p-4 cursor-pointer rounded-tl-lg rounded-tr-lg transition-all hover:bg-gray-50 ${
                              selectedDate?.eventDateId === dateOption.eventDateId 
                                ? 'border-orange-500 bg-orange-50' 
                                : 'border-gray-200'
                            }`}
                            onClick={() => handleDateSelect(dateOption)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{dateOption.date}</span>
                              <ChevronRight
                                className={`w-4 h-4 transition-transform ${selectedDate?.eventDateId === dateOption.eventDateId ? 'rotate-90' : ''}`}
                              />
                            </div>
                          </div>

                          {selectedDate?.eventDateId === dateOption.eventDateId && (
                            <div className="p-4 rounded-bl-lg rounded-br-lg border-t bg-gray-50">
                               {dateOption.timeSlots.length != 0 && ( <p className="text-sm text-gray-600 mb-4">Select your time slot below</p> )}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {dateOption.timeSlots.map((timeSlot) => (
                                  <Button
                                    key={timeSlot.name}
                                    variant={selectedTime?.name === timeSlot.name ? 'default' : 'outline'}
                                    size="sm"
                                    className={`text-sm h-10 justify-start ${selectedTime?.name === timeSlot.name ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                                    onClick={() => handleTimeSelect(timeSlot)}
                                  >
                                    {timeSlot.name}
                                  </Button>
                                ))}
                                {dateOption.timeSlots.length === 0 && (
                                  <p className="text-base font-medium text-gray-700 col-span-full">This event is fully booked!</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <Button variant="outline" onClick={handleBack} className="w-full mr-2">
                      Back to Events
                    </Button>
                    <Button onClick={handleNext} disabled={!canProceed()} className="bg-orange-500 w-full hover:bg-orange-600">
                      Book Appointment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // Success Page
          <div className="grid grid-cols-1 min-h-[calc(100vh-200px)] lg:grid-cols-3 gap-8">
            {/* Left Panel - Booking Details */}
            <div className="lg:col-span-1 h-full">
              <Card className="bg-[#FDEAD7] px-[32px] h-full rounded-2xl border-none">
                <CardHeader className="space-y-6">
                  <CardTitle className="text-4xl font-bold text-[#101828]">Booking Confirmed</CardTitle>
                  <CardDescription className="text-[#475467]">Your appointment has been successfully booked.</CardDescription>
                </CardHeader>
               <CardContent className="space-y-6">
  {selectedEvent && (
    <div className="flex gap-2 items-start">
      <Calendar className="w-8 h-8" />
      <h3 className="font-normal text-[#475467] mb-3">
        {selectedEvent?.name}{' '}
        <span className="font-normal">
          {selectedEvent.location} {selectedEvent.dates}
        </span>
      </h3>
    </div>
  )}

  {selectedTime && (
    <div>
      <div className="flex items-center space-x-2 text-[#475467]">
        <Clock className="w-6 h-6" />
        <span>
          {selectedDate.date} | {selectedTime.name}
        </span>
      </div>
    </div>
  )}

  <div>
    <div className="flex items-center space-x-2 text-[#475467]">
      <Users className="w-6 h-6" />
      <span>{additionalPeople + 1} People</span>
    </div>
  </div>

  <div>
                  <div className="flex items-center space-x-2 text-[#475467]">
                    <CheckCircle2 className="w-6 h-6" />
                    <span>Booking Reference: <span className="font-semibold border-b-2 border-black">{bookAppointmentReqProps.data?.BookingReference}</span></span>
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Booked Successfully</h2>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Appointment has been successfully scheduled and a confirmation email is on its way. Your booking reference is: 
                      <span className="font-semibold border-b-2 border-black">
                        {bookAppointmentReqProps.data?.BookingReference}
                      </span>
                    </p>
                  </div>

                  <Button onClick={handleBackToHome} className="bg-orange-500 hover:bg-orange-600 px-8">
                    Back to Appointments
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* People Modal */}
      {showPeopleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold">Bringing anyone with you?</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowPeopleModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-sm text-gray-600 text-center mb-8">Add number of people coming.</p>

            <div className="flex items-center justify-center space-x-4 py-8">
              <Button
                variant="outline"
                size="sm"
                onClick={decrementPeople}
                disabled={additionalPeople === 1}
                className="w-10 h-10 rounded-full"
              >
                <Minus className="w-4 h-4" />
              </Button>

              <div className="text-4xl font-bold text-gray-900 min-w-[60px] text-center">{additionalPeople}</div>

              <Button
                variant="outline"
                size="sm"
                onClick={incrementPeople}
                disabled={additionalPeople >= (selectedTime?.maxBooking || 2)}
                className="w-10 h-10 rounded-full"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

              <p className="text-xs text-gray-500 text-center mb-4">
                Maximum {selectedTime?.maxBooking} people per booking.
              </p>

            <div className="flex space-x-3">
              <Button onClick={handleConfirmPeople} className="w-full bg-orange-500 hover:bg-orange-600">
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AppointmentBooking;