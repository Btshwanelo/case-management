import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, BookOpen, Monitor, Fingerprint, ChevronLeft, ChevronRight, MapPin, Calendar, Users, Accessibility } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ResidenceApplicationModal from '../Student/AccomodationDetails/Apply';
import config from '@/config';

const APPropertyDetails = () => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const images = [
    `${config.baseUrl}/entities/imageview?id=b8b62a34-da9a-47b3-a059-78f4020ebc36&folder=FacilityDocLib&apikey=FvNFa.8tE8uKorHmvptmbRZQbZPWoSUMjrw3PA504dLeQaaAN`,
    `${config.baseUrl}/entities/imageview?id=b8b62a34-da9a-47b3-a059-78f4020ebc36&folder=FacilityDocLib&apikey=FvNFa.8tE8uKorHmvptmbRZQbZPWoSUMjrw3PA504dLeQaaAN`,
    `${config.baseUrl}/entities/imageview?id=b8b62a34-da9a-47b3-a059-78f4020ebc36&folder=FacilityDocLib&apikey=FvNFa.8tE8uKorHmvptmbRZQbZPWoSUMjrw3PA504dLeQaaAN`,
  ];

  return (
    <DashboardLayout>
      <ResidenceApplicationModal open={open} onOpenChange={setOpen} />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Property Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">Property.Name</h1>
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
            {images.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full ${idx === currentSlide ? 'bg-white' : 'bg-white/50'}`}
                onClick={() => setCurrentSlide(idx)}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold mb-2">Property.Name</h1>
            <span className="bg-purple-200 text-purple-800 text-sm px-3 py-1 rounded-full">Grade A</span>
          </div>
          <p className="text-gray-600 text-sm mt-2">2.00 KM FROM EHLANZENI TVET COLLEGE, EHLANZENI TVET COLLEGE - NELSPRUITCAMPUS...</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button className="flex-1 bg-orange-500 hover:bg-orange-600" onClick={() => setOpen(true)}>
            Apply
          </Button>
          <Button variant="outline" className="flex-1">
            Back to search
          </Button>
        </div>

        {/* Property Details */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">Property details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-gray-600">Location</p>
                  <p className="font-medium">Mbombela, South Africa</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-gray-600">Lease Period</p>
                  <p className="font-medium">As per Academic term</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Accessibility className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-gray-600">Disability friendly</p>
                  <p className="font-medium">Yes</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Users className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-gray-600">Gender</p>
                  <p className="font-medium">Male & Female</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">Amenities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <Fingerprint className="h-5 w-5 text-gray-500" />
                <div className="flex w-full">
                  <p className="font-medium">Biometric Security</p>
                  <p className="text-gray-600 ml-auto">1</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Monitor className="h-5 w-5 text-gray-500" />
                <div className="flex w-full">
                  <p className="font-medium">Hub/IT Room</p>
                  <p className="text-gray-600 ml-auto">1</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Wifi className="h-5 w-5 text-gray-500" />
                <div className="flex w-full">
                  <p className="font-medium">WIFI - Internet Connectivity</p>
                  <p className="text-gray-600 ml-auto">1</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <BookOpen className="h-5 w-5 text-gray-500" />
                <div className="flex w-full">
                  <p className="font-medium">Student Study Area</p>
                  <p className="text-gray-600 ml-auto">1</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default APPropertyDetails;
