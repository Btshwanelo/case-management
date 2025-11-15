import React, { useEffect, useState } from 'react';
import { Bell, LogOut, Copyright, ArrowRight, CircleCheck, MapPinCheckInside, Zap, Home, Copy, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EmptyListingComponent from './Components/EmptyListing';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useGetCheckInListingMutation } from '@/services/apiService';
import { useDispatch, useSelector } from 'react-redux';
import { clearCheckInData, setCheckInData, updateCheckInCode } from '@/slices/checkInSlice';
import { RootState } from '@/store';
import PageLoder from '@/components/PageLoder';
import Breadcrumb from '@/components/BreadCrumb';
import { Button } from '@/components/ui/button';
import { useCheckInConfirmCodeMutation } from '@/services/checkIn';
import CheckInCodeModal from './Components/CheckInCodeModal';
import { showErrorToast } from '@/components/ErrorToast ';
import { showSuccessToast } from '@/components/SuccessToast';
import useCheckIn from '@/hooks/useCheckIn';

const PropertyCard = ({ property, onCheckIn }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Property Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={property.imageURL}
          alt={property.studentResidence}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Property+Image';
          }}
        />
        <div className="absolute top-3 right-3">
          <span
            className={`
          px-3 py-1 rounded-full text-sm font-medium
          ${property.checkInStatus === 'Pending' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}
        `}
          >
            {property.checkInStatus}
          </span>
        </div>
      </div>

      {/* Property Details */}
      <CardContent className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{property.studentResidence}</h3>
          <div className="flex items-center text-gray-600 gap-1">
            <MapPinCheckInside className="h-4 w-4 shrink-0" />
            <span className="text-sm line-clamp-1">{property.address}</span>
          </div>
        </div>

        {/* Contact Info */}
        {property.mobile && (
          <div className="text-sm text-gray-600">
            <div className="mb-1">Contact:</div>
            <ContactNumber number={property.mobile} />
          </div>
        )}

        {/* Check-in Button */}
        <Button
          onClick={() => onCheckIn(property)}
          disabled={property.checkInStatus !== 'Pending'}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white disabled:bg-gray-300"
        >
          {property.checkInStatus === 'Pending' ? 'Move in' : 'Not Available'}
        </Button>
      </CardContent>
    </Card>
  );
};

const CheckIn = () => {
  const [searchParams] = useSearchParams();
  const userDetails = useSelector((state: RootState) => state.details.requestResults);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [propertyCode, setPropertyCode] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const currentCheckIn = useCheckIn();

  const [getCheckInListing, { isLoading: isLoadingCheckIn, isSuccess: isSuccessCheckIn, isError: isErrorCheckIn, data: CheckIn }] =
    useGetCheckInListingMutation();
  const [
    CheckInConfirmCode,
    { isLoading: isLoadingCheckInCode, isSuccess: isSuccessCheckInCode, isError: isErrorCheckInCode, data: CheckInCode },
  ] = useCheckInConfirmCodeMutation();

  useEffect(() => {
    getCheckInListing({
      body: {
        entityName: 'CheckIn',
        requestName: 'RetrieveCheckInListing',
        inputParamters: {
          UserId: userDetails.recordId,
          PageNumber: 1,
          PageSize: 12,
          FilteredProperty: 'All',
        },
      },
    });
  }, []);

  const handleCheckInCode = async (code) => {
    try {
      const response = await CheckInConfirmCode({
        body: {
          entityName: 'CheckIn',
          requestName: 'ConfirmCheckInCode',
          recordId: selectedProperty.checkInId,
          inputParamters: {
            Code: `MI-${code}`,
          },
        },
      }).unwrap();

      showSuccessToast('Code verified successfully');
      setIsCodeModalOpen(false);
      // Proceed with check-in
      dispatch(setCheckInData(selectedProperty));
      dispatch(updateCheckInCode(true));
      navigate(`/student/checkin/${selectedProperty.checkInId}?surveyresponseId=${selectedProperty.surveyResponseId}`);
    } catch (error) {
      showErrorToast(error?.data || 'Failed to verify code. Please try again.');
    }
  };

  const handleCheckIn = (property) => {
    setSelectedProperty(property);
    setIsCodeModalOpen(true);
  };

  useEffect(() => {
    dispatch(clearCheckInData());
  }, []);

  const breadcrumbItems = [{ path: '/dashboard', label: 'Property Viewing' }];

  if (CheckIn?.Listing.length === 0) {
    return <EmptyListingComponent />;
  }

  return (
    <DashboardLayout>
      <Breadcrumb items={breadcrumbItems} />

      {isLoadingCheckIn && <PageLoder />}

      {isErrorCheckIn && <div className="p-4 text-center text-red-500">Error loading data</div>}

      {isSuccessCheckIn && CheckIn?.Listing.length > 0 && (
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-2 max-w-4xl">
          {/* How it works section */}
          <div className="mb-8 sm:mb-4">
            <div className="bg-[#ffe6d5] rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-2 sm:mb-2">
              <Zap className="text-orange-500 h-5 w-5 sm:h-6 sm:w-6" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">How it works</h1>
            <p className="text-gray-600 mb-4 sm:mb-6 font-normal text-base sm:text-lg">
              As a student you can now view a property before committing to it.
            </p>

            <div className="space-y-3 sm:space-y-4">
              {['Apply online.', 'View the property.', 'Stay or keep looking.'].map((text, index) => (
                <div key={index} className="flex items-center gap-2 sm:gap-3">
                  <CircleCheck className={`${index === 2 ? 'text-orange-500' : 'text-green-500'} h-5 w-5 sm:h-6 sm:w-6 shrink-0`} />
                  <span className="text-gray-600 font-normal text-base sm:text-lg">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Property Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {CheckIn?.Listing.map((property) => <PropertyCard key={property.checkInId} property={property} onCheckIn={handleCheckIn} />)}
          </div>
          {/* Check-in Code Modal */}
          <CheckInCodeModal
            isOpen={isCodeModalOpen}
            onClose={() => setIsCodeModalOpen(false)}
            onConfirm={handleCheckInCode}
            isLoading={isLoadingCheckInCode}
            property={selectedProperty}
          />
        </div>
      )}
    </DashboardLayout>
  );
};

export default CheckIn;

const ContactNumber = ({ number }) => {
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(number);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
      <span className="flex-grow">{number}</span>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" className="p-1 hover:bg-gray-200" onClick={handleCopy} title="Copy number">
          <Copy className="h-4 w-4 text-gray-600" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="p-1 hover:bg-gray-200"
          onClick={() => (window.location.href = `tel:${number}`)}
          title="Call number"
        >
          <Phone className="h-4 w-4 text-gray-600" />
        </Button>
      </div>
      {showCopiedToast && <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg">Number copied!</div>}
    </div>
  );
};
