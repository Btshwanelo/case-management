import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Logo from '@/assets/logo-black.png';
import { useNavigate } from 'react-router-dom';
import {
  useContactPersonUpsertMutation,
  useFacilityUpsertRecordReqMutation,
  useLazyFacilityRetrieveMasterValuesQuery,
  useStudentApplyForPropertyMutation,
} from '@/services/apiService';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useParams } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { showErrorToast } from '@/components/ErrorToast ';

const InstitutionAddProperty = () => {
  const navigate = useNavigate();
  // Sample date options for the dropdowns
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [totalCapacity, setTotalCapacity] = useState('');
  const [campusId, setCampusId] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [name, setName] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [mobile, setMobile] = useState('');
  const [housingTypes, setHousingTypes] = useState('');

  const userDetails = useSelector((state: RootState) => state.details.requestResults);
  const { id } = useParams();

  const dispatch = useDispatch();
  const [facilityRetrieveMasterValues, { data, isLoading }] = useLazyFacilityRetrieveMasterValuesQuery();
  const [contactPersonUpsert, { data: dataContactPerson, isLoading: isLoadingContactPerson }] = useContactPersonUpsertMutation();
  const [facilityUpsertRecordReq, { data: datafacilityUpsert, isLoading: isLoadingfacilityUpsert, isSuccess: isSuccessFacility }] =
    useFacilityUpsertRecordReqMutation();

  const [
    studentApplyForProperty,
    {
      data: StudentApplication,
      isLoading: isLoadingStudentApplication,
      isSuccess: isSuccessStudentApplication,
      isError: isErrorStudentApplication,
      error: errorStudentApplication,
    },
  ] = useStudentApplyForPropertyMutation();

  useEffect(() => {
    facilityRetrieveMasterValues({
      body: {
        entityName: 'Facility',
        requestName: 'RetrieveMasterValues',
        inputParamters: {
          Page: 'property-list/add-property',
          SupplierId: userDetails.supplierId,
        },
      },
    });
  }, []);

  useEffect(() => {
    if (isSuccessFacility) {
      console.log(datafacilityUpsert);
      handleUpdateContactPerson(datafacilityUpsert.id);
    }
  }, [isSuccessFacility]);

  const getOptions = (schemaName: string) => {
    return data?.staticData?.find((item) => item.schemaName === schemaName)?.options || [];
  };

  const accommodationTypes = getOptions('AccommodationTypeId');
  const campuses = getOptions('CampusId');

  const handleApplyForAccomodation = () => {
    facilityUpsertRecordReq({
      body: {
        entityName: 'Facility',
        requestName: 'UpsertRecordReq',
        inputParamters: {
          Entity: {
            Name: propertyName,
            Address: address,
            TotalCapacity: totalCapacity,
            CampusId: campusId,
            InstitutionId: institutionId,
            HousingTypes: housingTypes,
          },
        },
      },
    });
  };
  const handleUpdateContactPerson = (id) => {
    contactPersonUpsert({
      body: {
        entityName: 'ContactPerson',
        requestName: 'UpsertRecordReq',
        inputParamters: {
          Entity: {
            Name: name,
            Mobile: mobile,
            Email: email,
            FacilityId: id,
          },
        },
      },
    });
  };

  if (isErrorStudentApplication) {
    showErrorToast(errorStudentApplication?.data);
  }

  // if (isSuccessStudentApplication) {
  //   return <ApplicationSuccess propertyName={propertyDetails.facilities[0].name} />;
  // }

  return (
    <div className="min-h-screen bg-white">
      {
        <>
          {/* Header */}
          <nav className="hidden md:block  border-b bg-white border-orange-500">
            <div className="container mx-auto px-4 py-4 flex justify-between ">
              <img src={Logo} alt="NSFAS Logo" className="h-8" />
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/property-list`)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </nav>

          {/* Main Content */}
          <div className="container mx-auto px-4 py-6 max-w-xl mt-10">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold mb-1">Add Property</h1>
              <p className="text-gray-500">Complete your property details below</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm text-black">Name</label>
                <Input className="border-gray-400" placeholder="Enter property name" value={propertyName} />
                {/* <span className="text-gray-600 text-sm">Hint: This is the minimum number of months you have to stay before moving out</span> */}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-black">Address</label>
                <Input className="border-gray-400" placeholder="Enter property address" value={address} />
                {/* <span className="text-gray-600 text-sm">Hint: This is student term-type eg: Annual, Semester and Trimester</span> */}
              </div>
              <div className="space-y-1">
                <label className="text-sm text-black">Number of beds (max 4000)</label>
                <Input className="border-gray-400" placeholder="Enter total number of beds for this residence" value={totalCapacity} />
                {/* <span className="text-gray-600 text-sm">Hint: This is student term-type eg: Annual, Semester and Trimester</span> */}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-black">Campus</label>
                <Select
                  value={campusId}
                  onValueChange={(value) => {
                    setCampusId(value);
                  }}
                >
                  <SelectTrigger className="w-full border-gray-400">
                    <SelectValue placeholder="Select Campus" />
                  </SelectTrigger>
                  <SelectContent>
                    {campuses.map((campus) => (
                      <SelectItem key={campus.value} value={campus.value}>
                        {campus.lable}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-black">Accommodation type</label>
                <Select value={housingTypes} onValueChange={setHousingTypes}>
                  <SelectTrigger className="w-full border-gray-400">
                    <SelectValue placeholder="Select accomodation type" />
                  </SelectTrigger>
                  <SelectContent>
                    {accommodationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.lable}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <hr />
              <h1 className="text-lg font-medium">Contact Person</h1>

              <div className="space-y-1 ">
                <label className="text-sm text-black">Name</label>
                <Input className="border-gray-400" placeholder="Enter name" value={name} />
                {/* <span className="text-gray-600 text-sm">Hint: This is the minimum number of months you have to stay before moving out</span> */}
              </div>
              <div className="space-y-1">
                <label className="text-sm text-black">Mobile</label>
                <Input className="border-gray-400" placeholder="Enter contact number" value={mobile} />
                {/* <span className="text-gray-600 text-sm">Hint: This is the minimum number of months you have to stay before moving out</span> */}
              </div>
              <div className="space-y-1">
                <label className="text-sm text-black">Email</label>
                <Input className="border-gray-400" placeholder="Enter email" value={email} />
                {/* <span className="text-gray-600 text-sm">Hint: This is the minimum number of months you have to stay before moving out</span> */}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button variant="outline" onClick={() => navigate(`/property-list`)}>
                  Cancel
                </Button>
                <Button
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={isLoadingStudentApplication}
                  onClick={handleApplyForAccomodation}
                >
                  {isLoadingStudentApplication ? <Spinner size="medium" className="text-white" /> : 'Add'}
                </Button>
              </div>
            </div>
          </div>
        </>
      }
    </div>
  );
};

export default InstitutionAddProperty;
