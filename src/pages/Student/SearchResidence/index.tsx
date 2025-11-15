import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wifi, Dumbbell, Zap, BookOpen, Monitor, Fingerprint, Loader2, Search, X, WashingMachine } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import config from '@/config';
import EmptyStateIcon from '@/assets/NoDocuments__1.png';

import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { useStudentSearchPropertyMutation } from '@/services/apiService';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Spinner } from '@/components/ui/spinner';
import Breadcrumb from '@/components/BreadCrumb';
import EmptyState from '@/components/EmptyState';
import ErrorPage from '@/components/ErrorPage';
import EnhancedPagination from '@/components/EnhancedPagination';
import OnboardingNavHeader from '@/components/OnboardingNavHeader';

const SearchResidence = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const code = searchParams.get('code');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearch, setIsSearch] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [loaderType, setLoaderType] = useState('');

  const userDetails = useSelector((state: RootState) => state.auth);

  const removeSearchParam = (paramName: string) => {
    setSearchParams((prevParams) => {
      // Clone the current search parameters
      const newParams = new URLSearchParams(prevParams);

      // Remove the specified parameter
      newParams.delete(paramName);

      // Return the updated parameters
      return newParams;
    });
  };

  const [
    studentSearchProperty,
    {
      data: properties,
      isLoading: isLoadingProperties,
      isSuccess: isSuccessProperties,
      isError: isErrorProperties,
      error: errorProperties,
    },
  ] = useStudentSearchPropertyMutation();

  const getAmenityIcon = (iconName) => {
    switch (iconName) {
      case 'WIFI - Internet Connectivity':
        return <Wifi className="h-4 w-4" />;
      case 'WIFI':
        return <Wifi className="h-4 w-4" />;
      case 'Utility Area':
        return <Dumbbell className="h-4 w-4" />;
      case 'Back Up Generator':
        return <Zap className="h-4 w-4" />;
      case 'Student Study Area':
        return <BookOpen className="h-4 w-4" />;
      case 'Hub/IT Room':
        return <Monitor className="h-4 w-4" />;
      case 'Biometric Security':
        return <Fingerprint className="h-4 w-4" />;
      case 'Laundry Rooms':
        return <WashingMachine className="h-4 w-4" />;
      default:
        return <Loader2 className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    studentSearchProperty({
      body: {
        recordId: userDetails.user.relatedObjectId,
        requestName: 'RetrieveStudentsResidencies',
        InputParamters: {
          PageSize: pageSize,
          PageNumber: pageNumber,
          SearchText: searchTerm,
          APCode: code == null ? '' : code,
        },
      },
    });
  }, [isSearch, pageNumber, code]);

  const totalRecords = properties?.RecordCount;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const breadcrumbItems = [{ path: '/dashboard/accommodation', label: 'Accommodation Application' }];
  const filterUniqueByIconName = (items) => {
    const seen = new Map();

    return items?.filter((item) => {
      if (seen.has(item.iconName)) {
        // If we've seen this iconName before, create a new object with updated quantity
        const existingItem = seen.get(item.iconName);
        const newItem = {
          ...existingItem,
          quantity: (parseInt(existingItem.quantity) + parseInt(item.quantity)).toString(),
        };
        seen.set(item.iconName, newItem); // Update the Map with the new object
        return false;
      } else {
        // If we haven't seen this iconName, add a copy of the item to seen
        seen.set(item.iconName, { ...item }); // Create a new object to avoid read-only issues
        return true;
      }
    });
  };

  // const uniqueAmenities = filterUniqueByIconName(properties?.FacilitiyDetails[0]?.amenities);
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <h1 className="text-3xl font-semibold text-left mb-8">Find Accommodation Nearby</h1>

        {/* Search Bar */}
        <div className="flex gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name of residence or address or accomodation provider"
              className="pl-10 pr-8 py-2 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setIsSearch(!isSearch);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-75 transition-opacity"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>
          <Button onClick={() => setIsSearch(!isSearch)} className=" hover:bg-gray-700 px-8">
            Search
          </Button>
        </div>

        {isSearch && (
          <div className="bg-blue-100  mb-4 px-6 py-2 rounded-lg text-blue-600 font-semibold flex justify-between">
            <div>
              <span className="text-black"> Showing search results for </span> {searchTerm}
            </div>{' '}
            <X
              className="text-red-500 cursor-pointer"
              onClick={() => {
                setSearchTerm('');
                setIsSearch(!isSearch);
                if (code != null) {
                  removeSearchParam('code');
                }
              }}
            />{' '}
          </div>
        )}
        {code != null && (
          <div className="bg-blue-100  px-6 py-2 rounded-lg text-blue-600 font-semibold flex justify-between">
            <div>
              <span className="text-black"> Showing search results for </span> {code}
            </div>{' '}
            <X
              className="text-red-500 cursor-pointer"
              onClick={() => {
                setSearchTerm('');

                if (code != null) {
                  removeSearchParam('code');
                }
              }}
            />{' '}
          </div>
        )}
        {/* Property Grid */}
        <div>
          {isLoadingProperties && <Spinner size="large" />}
          {isErrorProperties && <ErrorPage message={errorProperties?.data} />}
        </div>

        {properties?.Facilities.length < 1 && (
          <div className="w-full justify-center mt-4">
            <EmptyState title="No properties found" description="Create your first item to get started" icon={EmptyStateIcon} />
          </div>
        )}
        {isSuccessProperties && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties?.Facilities.map((property) => (
              <Card key={property.facilityId} className="overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      property?.images && property.images.length > 0
                        ? `${config.baseUrl}/entities/imageview?id=${property.images[0].facilityDocLibId}&folder=FacilityDocLib&apikey=${config.apiKey}`
                        : `${config.baseUrl}/entities/imageview?id=00000000-0000-0000-0000-000000000000&folder=FacilityDocLib&apikey=${config.apiKey}`
                    }
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm text-white ${property.rating === 'A' ? 'bg-teal-500' : 'bg-blue-500'}`}
                    >
                      GRADE {property.rating}
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-orange-500 mb-2">{property.name}</h3>
                    <p className="text-sm text-gray-600">{property.distance}</p>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    {filterUniqueByIconName(property?.amenities).map((amenity) => (
                      <div key={amenity.capacityId} className="flex items-center gap-1" title={amenity.iconName}>
                        {getAmenityIcon(amenity.iconName)}
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    onClick={() => navigate(`/student/accomodation-details/${property.facilityId}`)}
                  >
                    VIEW
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {properties?.Facilities?.length > 0 && (
          <div className="mt-4">
            <EnhancedPagination
              currentPage={pageNumber}
              totalPages={totalPages}
              onPageChange={(page) => {
                setLoaderType('pagination');
                setPageNumber(page);
              }}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SearchResidence;
