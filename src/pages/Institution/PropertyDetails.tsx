import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Wifi,
  BookOpen,
  Monitor,
  Fingerprint,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  Accessibility,
  MoveLeft,
  User,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  UtensilsCrossed,
  Dumbbell,
  Bed,
  Footprints,
  Bus,
  Coffee,
  Tv,
  Bath,
  Warehouse,
  KeyRound,
  Laptop,
  Building2,
  DoorClosed,
  CalendarDays,
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ResidenceApplicationModal from './Apply';
import DashboardLayout from '@/layouts/DashboardLayout';
import config from '@/config';
import { useNavigate } from 'react-router-dom';
import { useCanStudentApplyForPropertyMutation, useGetPropertyDetailsMutation } from '@/services/apiService';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { RootState } from '@/store';
import { setFacilities } from '@/slices/propertySlice';
import XiqIcon from '@/components/InternalIcon';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { getAmenityIcon } from '@/utils';
import ErrorPage from '@/components/ErrorPage';
import Breadcrumb from '@/components/BreadCrumb';
import InfoItem from '@/components/InfoItem';

// const InfoItem = ({ icon: Icon, label, value }) => (
//   <div className="flex items-center gap-4">
//     <Icon className="h-5 w-5 text-green-500" />
//     <div>
//       <p className="text-gray-600">{label}</p>
//       <p className="font-medium">{value}</p>
//     </div>
//   </div>
// );

const PropertyDetails = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const { id } = useParams();
  const [open, setOpen] = React.useState(false);
  const [images, setImages] = useState([]);
  const userDetails = useSelector((state: RootState) => state.details);
  const dispatch = useDispatch();
  const [
    getPropertyDetails,
    {
      data: properties,
      isLoading: isLoadingProperties,
      isSuccess: isSuccessProperties,
      isError: isErrorProperties,
      error: errorProperties,
    },
  ] = useGetPropertyDetailsMutation();
  const [
    canStudentApplyForProperty,
    {
      data: applicationReq,
      isLoading: isLoadingApplicationReq,
      isSuccess: isSuccessApplicationReq,
      isError: isErrorApplicationReq,
      error: errorApplicationReq,
    },
  ] = useCanStudentApplyForPropertyMutation();

  useEffect(() => {
    getPropertyDetails({
      body: {
        recordId: id,
        requestName: 'RetrieveFacilityDetails',
        inputParamters: {
          supplierId: userDetails.requestResults.supplierId,
        },
      },
    });
  }, []);

  useEffect(() => {
    if (isSuccessProperties) {
      // const apiKey = 'FvNFa.8tE8uKorHmvptmbRZQbZPWoSUMjrw3PA504dLeQaaAN';
      const images = properties?.FacilitiyDetails[0].images.map(
        (item) => `${config.baseUrl}/entities/imageview?id=${item.facilityDocLibId}&folder=FacilityDocLib&apikey=${config.apiKey}`
      );
      console.log('imf', images.length);
      setImages(images.length === 0 ? ['https://placehold.co/600x400?text=No+Images'] : images);

      dispatch(setFacilities(properties.FacilitiyDetails));
    }
  }, [isSuccessProperties]);

  const breadcrumbItems = [
    { path: '/property-list', label: 'Properties' },
    { path: '/dashboard/accommodation', label: 'Accommodation Application' },
  ];

  return (
    <DashboardLayout>
      {/* <ResidenceApplicationModal open={open} onOpenChange={setOpen} /> */}
      <Breadcrumb items={breadcrumbItems} />

      {isErrorProperties && <ErrorPage message={errorProperties.data} />}
      {/* {isErrorApplicationReq && <ErrorPage message={errorApplicationReq.data} />} */}

      {isLoadingProperties && <Spinner size="large" />}

      {isSuccessProperties && (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Property Title */}
          <div className="mb-3 ">
            <Button variant={'link'} className="pl-0" onClick={() => navigate('/property-list')}>
              <MoveLeft /> Back
            </Button>
            <h1 className="text-2xl font-semibold mb-4">{properties?.FacilitiyDetails[0].name}</h1>
          </div>

          {/* Image Slider */}
          <div className="relative mb-8 rounded-lg overflow-hidden h-[400px]">
            <img src={images[currentSlide]} alt="Property" className="w-full h-full object-cover" />
            <button
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images?.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-2 h-2 rounded-full ${idx === currentSlide ? 'bg-white' : 'bg-white/50'}`}
                  onClick={() => setCurrentSlide(idx)}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold mb-2">{properties?.FacilitiyDetails[0].name}</h1>
              <Badge variant="blue">Grade {properties?.FacilitiyDetails[0].rating}</Badge>
            </div>
            <p className="text-gray-600 text-sm mt-2">{properties?.FacilitiyDetails[0].distance}</p>
          </div>

          {/* Property Details */}
          <Card className="mb-4">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">Accommodation Provider Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={User} label="Name" value={properties?.ApDetails.name} />
                <InfoItem icon={Phone} label="Contact Number" value={properties?.ApDetails.mobile} />
                <InfoItem icon={Mail} label="Email" value={properties?.ApDetails.email} />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">Property Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={GraduationCap} label="Study Area" value={properties?.FacilitiyDetails[0].propertyOverView.studyArea} />
                <InfoItem
                  icon={Accessibility}
                  label="Disability Friendly"
                  value={properties?.FacilitiyDetails[0].propertyOverView.disbilityFriendly}
                />
                <InfoItem icon={Users} label="Gender" value={properties?.FacilitiyDetails[0].propertyOverView.gender} />
                <InfoItem
                  icon={UtensilsCrossed}
                  label="Self Catering"
                  value={properties?.FacilitiyDetails[0].propertyOverView.selfCatering}
                />
                <InfoItem icon={Wifi} label="Wifi" value={properties?.FacilitiyDetails[0].propertyOverView.wifi} />
                <InfoItem icon={Dumbbell} label="Gym" value={properties?.FacilitiyDetails[0].propertyOverView.gym} />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties?.FacilitiyDetails[0].amenities.map((item, index) => {
                  const IconComponent = getAmenityIcon(item.amenityIdName);
                  return (
                    <div className="flex items-center gap-4" key={index}>
                      <IconComponent className="h-5 w-5 text-green-500" />
                      <div className="flex w-full">
                        <p className="font-medium">{item.amenityIdName}</p>
                        <p className="text-gray-600 ml-auto">{item.quantity}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-xl font-semibold">Current Tenants</h2>
              </div>

              <div className="">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead>Name</TableHead>
                      <TableHead>ID Number</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Lease Start Date</TableHead>
                      <TableHead>Lease End Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties?.Tenants?.map((tenant) => (
                      <TableRow key={tenant.idNumber}>
                        <TableCell className="font-medium">{tenant.name}</TableCell>
                        <TableCell>{tenant.idNumber}</TableCell>
                        <TableCell>{tenant.roomNumber}</TableCell>
                        <TableCell>{tenant.startDate}</TableCell>
                        <TableCell>{tenant.endDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  {properties?.Tenants?.length < 1 && <div>No Tenants</div>}
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PropertyDetails;
