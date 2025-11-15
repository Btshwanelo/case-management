import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { CreditCard, FileText, Home, Hotel, Settings2, SquareUserRound, Upload, User2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import ProfileDetails from './Components/ProfileDetails';
import Adress from './Components/Adress';
import BankingDetails from './Components/BankingDetails';
import Documents from './Components/Documents';
import AddressForm from './Components/Adress';
import BankingDetailsForm from './Components/BankingDetails';
import DocumentUploadForm from './Components/Documents';
import { useAddressUpsertRecordReqMutation, useRetrieveProfileDetailsReqMutation } from '@/services/apiService';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import PageLoder from '@/components/PageLoder';
import Breadcrumb from '@/components/BreadCrumb';
import ErrorPage from '@/components/ErrorPage';
import IndivisualProfileDetails from './Components/IndivisualProfileDetails';
import EntityProfileDetails from './Components/EntityProfileDetails';
import SuccessPage from '@/components/SuccessPage';
import { useNavigate, useSearchParams } from 'react-router-dom';
import UsersManagement from './Components/UsersManagement';

const APEditProfile = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeStep = searchParams.get('s');
  const [retrieveProfileDetailsReq, { data, isLoading, isSuccess, isError, error }] = useRetrieveProfileDetailsReqMutation();
  const userDetails = useSelector((state: RootState) => state.details.requestResults);

  const steps = [
    {
      id: 'details',
      title: 'Profile Details',
      icon: Home,
      description: 'Add profile details',
    },
    {
      id: 'address',
      title: 'Address Details',
      icon: Hotel,
      description: 'Add address details',
    },
    {
      id: 'banking',
      title: 'Banking Details',
      icon: Settings2,
      description: 'Upload banking details',
    },
    {
      id: 'documents',
      title: 'Documents Upload',
      icon: FileText,
      description: 'Upload supporting documents',
    },
    {
      id: 'users',
      title: 'Users',
      icon: SquareUserRound,
      description: 'Manage users',
    },
  ];

  useEffect(() => {
    retrieveProfileDetailsReq({
      body: {
        entityName: 'Supplier',
        requestName: 'RetrieveProfileDetailsReq',
        inputParamters: {
          RecordId: userDetails.supplierId,
        },
      },
    });
  }, []);

  useEffect(() => {
    if (activeStep) {
      // Map search param to step number
      const stepMap: { [key: string]: number } = {
        '1': 1,
        profile: 1,
        '2': 2,
        address: 2,
        '3': 3,
        banking: 3,
        '4': 4,
        documents: 4,
        '5': 5,
        users: 5,
      };

      const mappedStep = stepMap[activeStep.toLowerCase()];
      if (mappedStep) {
        setCurrentStep(mappedStep);
      }
    }
  }, [activeStep]);

  const breadcrumbItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/dashboard/accommodation', label: 'Accommodation Application' },
  ];

  if (currentStep === 6) {
    return (
      <SuccessPage
        description="Your profile details have been successfully updated! You're all set to continue."
        title="Profile Details Updated"
        secondaryAction={{
          label: 'Go Home',
          onClick: () => navigate('/'),
        }}
      />
    );
  }
  return (
    <DashboardLayout>
      <Breadcrumb items={breadcrumbItems} />

      {isLoading && <PageLoder />}
      {isError && <ErrorPage message={error.data} />}

      {isSuccess && (
        <div className="container ">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mx-auto">
            <div className="lg:col-span-3">
              {/* <div className="space-y-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    onClick={() => setCurrentStep(index + 1)}
                    className={cn(
                      'p-4 rounded-none transition-all cursor-pointer',
                      currentStep === index + 1 ? 'bg-gray-100 border-l-4 border-orange-500' : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2 rounded-lg', index === index + 1 ? 'bg-orange-100' : 'bg-gray-100')}>
                        <step.icon className={cn('h-5 w-5', index === index + 1 ? 'text-orange-500' : 'text-gray-500')} />
                      </div>
                      <div>
                        <h3 className={cn('font-medium text-sm', currentStep === index + 1 ? 'text-orange-600' : 'text-gray-700')}>
                          {step.title}
                        </h3>
                        <p className="text-xs text-gray-500">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div> */}
              <div className="md:space-y-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    onClick={() => setCurrentStep(index + 1)}
                    className={cn(
                      'transition-all cursor-pointer',
                      // Mobile: compact horizontal layout
                      'flex items-center gap-2 p-2 rounded-none md:p-4 md:rounded-none',
                      currentStep === index + 1 ? 'bg-gray-100 border-l-4 border-orange-500' : 'hover:bg-gray-50'
                    )}
                  >
                    <div
                      className={cn(
                        'flex-shrink-0 p-1.5 rounded-md md:p-2 md:rounded-lg',
                        currentStep === index + 1 ? 'bg-orange-100' : 'bg-gray-100'
                      )}
                    >
                      <step.icon className={cn('h-4 w-4 md:h-5 md:w-5', currentStep === index + 1 ? 'text-orange-500' : 'text-gray-500')} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className={cn('font-medium text-xs md:text-sm', currentStep === index + 1 ? 'text-orange-600' : 'text-gray-700')}>
                        {step.title}
                      </h3>
                      {/* Hide description on mobile for even more space savings */}
                      <p className="hidden md:block text-xs text-gray-500">{step.description}</p>
                    </div>

                    {/* Optional: Step number indicator on mobile */}
                    {/* <div className="md:hidden flex-shrink-0">
    <span className={cn(
      'text-xs font-medium px-1.5 py-0.5 rounded-full',
      currentStep === index + 1 
        ? 'bg-orange-500 text-white' 
        : 'bg-gray-200 text-gray-600'
    )}>
      {index + 1}
    </span>
  </div> */}
                  </div>
                ))}
              </div>
            </div>
            {currentStep === 1 && userDetails.aPtype === 'Individual' && (
              <IndivisualProfileDetails
                details={data?.profileDetails.details}
                contactDetails={data?.profileDetails.contactDetails}
                nextOfKin={data?.profileDetails.nextOfKinDetails}
                setNextStep={() => setCurrentStep(2)}
              />
            )}
            {currentStep === 1 && userDetails.aPtype === 'Entity' && (
              <EntityProfileDetails
                details={data?.profileDetails.details}
                contactDetails={data?.profileDetails.contactDetails}
                nextOfKin={data?.profileDetails.nextOfKinDetails}
                setNextStep={() => setCurrentStep(2)}
              />
            )}
            {currentStep === 2 && (
              <AddressForm
                address={data?.profileDetails.address}
                userDetails={userDetails}
                details={data?.profileDetails.details}
                contactDetails={data?.profileDetails.contactDetails}
                setNextStep={() => setCurrentStep(3)}
              />
            )}
            {currentStep === 3 && (
              <BankingDetailsForm
                userDetails={userDetails}
                bankDetails={data?.profileDetails.bankDetails}
                setNextStep={() => setCurrentStep(4)}
              />
            )}
            {currentStep === 4 && <DocumentUploadForm details={data?.profileDetails.details} setNextStep={() => setCurrentStep(5)} />}
            {currentStep === 5 && <UsersManagement userDetails={userDetails} setNextStep={() => setCurrentStep(6)} />}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default APEditProfile;
