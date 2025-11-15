import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, FileText, Home, Hotel, Settings2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import AcademicInformation from './Components/AcademicInformation';
import MyDetails from './Components/MyDetails';
import { useEmployeeRetrieveProfileDetailsReqMutation } from '@/services/apiService';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import StudentDocumentsUpload from './Components/Documents';
import { Spinner } from '@/components/ui/spinner';
import Breadcrumb from '@/components/BreadCrumb';
import SuccessPage from '@/components/SuccessPage';
import { useNavigate } from 'react-router-dom';

const StudentEditProfile = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const userDeatils = useSelector((state: RootState) => state.details.requestResults);
  const navigate = useNavigate();

  const [employeeRetrieveProfileDetailsReq, { data, isLoading, isSuccess }] = useEmployeeRetrieveProfileDetailsReqMutation();

  const steps = [
    {
      id: 'profileDetails',
      title: 'My Details',
      icon: Home,
      description: 'Add profile details',
    },
    {
      id: 'academicInformation',
      title: 'Academic Information',
      icon: Hotel,
      description: 'Add academic information',
    },
    {
      id: 'documents',
      title: 'Documents',
      icon: Settings2,
      description: 'Upoload supporting documents',
    },
  ];

  useEffect(() => {
    employeeRetrieveProfileDetailsReq({
      body: {
        entityName: 'Employee',
        requestName: 'RetrieveProfileDetailsReq',
        inputParamters: {
          RecordId: userDeatils.recordId,
        },
      },
    });
  }, []);

  const breadcrumbItems = [{ path: '/dashboard/accommodation', label: 'Accommodation Application' }];

  if (currentStep === 5) {
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

  if (isLoading) {
    return <Spinner />;
  }
  return (
    <DashboardLayout>
      <div className="container ">
        <Breadcrumb items={breadcrumbItems} />

        {isSuccess && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3">
              <div className="space-y-2">
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
              </div>
            </div>
            {currentStep === 1 && <MyDetails details={data?.profileDetails} setNextStep={() => setCurrentStep(2)} />}
            {currentStep === 2 && <AcademicInformation details={data?.profileDetails} setNextStep={() => setCurrentStep(3)} />}
            {currentStep === 3 && <StudentDocumentsUpload details={data?.profileDetails} setNextStep={() => setCurrentStep(5)} />}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentEditProfile;
