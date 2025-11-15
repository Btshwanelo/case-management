import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Logo from '@/assets/logo-black.png';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  useEmployeeRetrieveDepartureDatesReqMutation,
  useRetrievePlannedMoveOutDatesReqMutation,
  useStudentApplyForPropertyMutation,
  useStudentPropertyApplicationDatesMutation,
} from '@/services/apiService';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useParams } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { showErrorToast } from '@/components/ErrorToast ';
import ApplicationSuccess from '../AccomodationDetails/ApplicationSuccess';

interface ValidationErrors {
  plannedMoveInDate?: string;
  plannedMoveOutDate?: string;
  preferedRoomType?: string;
}

const ResidenceApplicationUpdatePage = () => {
  const navigate = useNavigate();
  const [roomTypes, setRoomTypes] = useState<any>([]);
  const [plannedMoveInDate, setPlannedMoveInDate] = useState('');
  const [plannedMoveOutDate, setPlannedMoveOutDate] = useState('');
  const [plannedArrivalDate, setPlannedArrivalDate] = useState('');
  const [plannedDepartureDate, setPlannedDepartureDate] = useState('');
  const [preferedRoomType, setPreferedRoomType] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});

  const [searchParams] = useSearchParams();
  const roomTypeParams = searchParams.get('roomType');
  const plannedMoveInDateParams = searchParams.get('plannedMoveInDate');

  const userDetails = useSelector((state: RootState) => state.details.requestResults);
  const propertyDetails = useSelector((state: RootState) => state.property);
  const { id } = useParams();

  const [studentPropertyApplicationDates, { data: applicationsDates, isLoading: isLoadingApplicationsDates }] =
    useStudentPropertyApplicationDatesMutation();

  const [employeeRetrieveDepartureDatesReq, { data: departureDates }] = useEmployeeRetrieveDepartureDatesReqMutation();

  const [retrievePlannedMoveOutDatesReq, { data: moveOutApplicationsDates }] = useRetrievePlannedMoveOutDatesReqMutation();

  const [
    studentApplyForProperty,
    {
      isLoading: isLoadingStudentApplication,
      isSuccess: isSuccessStudentApplication,
      isError: isErrorStudentApplication,
      error: errorStudentApplication,
    },
  ] = useStudentApplyForPropertyMutation();

  const validateForm = () => {
    const newErrors: ValidationErrors = {};

    if (!plannedMoveInDate) {
      newErrors.plannedMoveInDate = 'Please select a move in date';
    }

    if (!plannedMoveOutDate) {
      newErrors.plannedMoveOutDate = 'Please select a move out date';
    }

    if (!preferedRoomType) {
      newErrors.preferedRoomType = 'Please select a room type';
    }

    if (plannedMoveInDate && plannedMoveOutDate) {
      const moveInDate = new Date(plannedMoveInDate);
      const moveOutDate = new Date(plannedMoveOutDate);

      if (moveOutDate <= moveInDate) {
        newErrors.plannedMoveOutDate = 'Move out date must be after move in date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getApplicationRoomTypes = () => {
    if (propertyDetails.facilities[0].rooms.length > 0) {
      const opt = propertyDetails.facilities[0].rooms.map((o: any) => ({
        label: o.iconName,
        value: o.capacityId,
      }));
      setRoomTypes(opt);
    }
  };

  useEffect(() => {
    if (plannedMoveInDate) {
      retrievePlannedMoveOutDatesReq({
        body: {
          entityName: 'Employee',
          requestName: 'RetrievePlannedMoveOutDatesReq',
          recordId: userDetails.recordId,
          inputParamters: {
            PlannedMoveInDate: plannedMoveInDate,
          },
        },
      });
      setPlannedMoveOutDate('');
    }
  }, [plannedMoveInDate]);

  useEffect(() => {
    if (plannedMoveOutDate) {
      employeeRetrieveDepartureDatesReq({
        body: {
          entityName: 'Employee',
          requestName: 'RetrieveDepartureDatesReq',
          InputParamters: {
            PlannedMoveOutDate: plannedMoveOutDate,
          },
        },
      });
    }
  }, [plannedMoveOutDate]);

  useEffect(() => {
    getApplicationRoomTypes();
    studentPropertyApplicationDates({
      body: {
        entityName: 'Employee',
        requestName: 'RetrieveApplicationDatesReq',
        recordId: userDetails.recordId,
      },
    });
  }, []);

  const handleApplyForAccomodation = () => {
    if (!validateForm()) {
      return;
    }

    studentApplyForProperty({
      body: {
        entityName: 'AccomodationApplications',
        requestName: 'UpsertRecordReq',
        inputParamters: {
          Entity: {
            studentId: userDetails.recordId,
            facilityId: id,
            capacityId: preferedRoomType,
            PreferredRoomTypeId: preferedRoomType,
            PlannedMoveInDate: plannedMoveInDate,
            ArrivalDate: plannedArrivalDate,
            PlannedMoveOutDate: plannedMoveOutDate,
          },
        },
      },
    });
  };

  useEffect(() => {
    //pre populate the fields
    // setPreferedRoomType(roomTypeParams)
    // setPlannedMoveInDate('01 Feb 2025')
  }, []);

  if (isErrorStudentApplication) {
    showErrorToast(errorStudentApplication?.data);
  }

  if (isSuccessStudentApplication) {
    return <ApplicationSuccess propertyName={propertyDetails.facilities[0].name} />;
  }

  const FormErrorMessage = ({ message }: { message?: string }) => {
    if (!message) return null;
    return <p className="text-sm text-red-500 mt-1">{message}</p>;
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="hidden md:block border-b bg-white border-orange-500">
        <div className="container mx-auto px-4 py-4 flex justify-between">
          <img src={Logo} alt="NSFAS Logo" className="h-8" />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/student/my-applications/home`)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 max-w-xl mt-16">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-1">Apply for residence {propertyDetails.facilities[0].name}</h1>
          <p className="text-gray-500">Complete Your Application Below</p>
        </div>

        <div className="bg-gray-100 p-6 rounded-lg mb-8">
          <h3 className="font-semibold text-lg mb-3">How your application works.</h3>
          <p className="text-gray-700 leading-relaxed">
            As a student you'll set your planned move in & out dates, along with a preferred room type. This will enable your Accommodation
            provider to be able to reserve a bed for your viewing, once viewed & accepted, you'll be able to sign lease and move in.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Minimum Stay Months</label>
            <Input disabled value={applicationsDates?.MinimumStay} />
            <span className="text-gray-600 text-sm">Hint: This is the minimum number of months you have to stay before moving out</span>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-600">Student Process Cycle</label>
            <Input disabled value={applicationsDates?.ProccessCycle} />
            <span className="text-gray-600 text-sm">Hint: This is student term-type eg: Annual, Semester and Trimester</span>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-600">Planned move in date</label>
            <Select
              value={plannedMoveInDate}
              onValueChange={(value) => {
                setPlannedMoveInDate(value);
                setPlannedMoveOutDate('');
                setPlannedArrivalDate('');
                setPlannedDepartureDate('');
                setPreferedRoomType('');
                setErrors({ ...errors, plannedMoveInDate: undefined });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select move in date" />
              </SelectTrigger>
              <SelectContent>
                {applicationsDates?.PlannedMoveInDate?.map((date) => (
                  <SelectItem key={date} value={date}>
                    {date}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormErrorMessage message={errors.plannedMoveInDate} />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-600">Planned move out date</label>
            <Select
              value={plannedMoveOutDate}
              onValueChange={(value) => {
                setPlannedMoveOutDate(value);
                setErrors({ ...errors, plannedMoveOutDate: undefined });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select move out date" />
              </SelectTrigger>
              <SelectContent>
                {moveOutApplicationsDates?.PlannedMoveOutDate?.map((date) => (
                  <SelectItem key={date} value={date}>
                    {date}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormErrorMessage message={errors.plannedMoveOutDate} />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-600">Preferred room type</label>
            <Select
              value={preferedRoomType}
              onValueChange={(value) => {
                setPreferedRoomType(value);
                setErrors({ ...errors, preferedRoomType: undefined });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormErrorMessage message={errors.preferedRoomType} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => navigate(`/student/accomodation-details/${id}`)}>
              Cancel
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              disabled={isLoadingStudentApplication}
              onClick={handleApplyForAccomodation}
            >
              {isLoadingStudentApplication ? <Spinner size="medium" className="text-white" /> : 'Apply'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidenceApplicationUpdatePage;
