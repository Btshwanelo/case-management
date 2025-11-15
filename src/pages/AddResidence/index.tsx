import { useState } from 'react';

import DashboardLayout from '@/layouts/DashboardLayout';
import ResidentDetails from './Components/ResidentDetails';
import RoomDetails from './Components/RoomDetails';
import AmenitiesDetails from './Components/AmenitySelection';
import DocumentUpload from './Components/DocumentUpload';
import PaymentDetails from './Components/PaymentDetails';
import Sidebar from './Components/Sidebar';

const AddResidence = ({ step }: { step: number }) => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4 max-w-[1200px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Progress Steps */}
          <Sidebar currentStep={step} />
          {/* Main Content */}
          {step === 1 && <ResidentDetails />}
          {step === 2 && <RoomDetails />}
          {step === 3 && <AmenitiesDetails />}
          {step === 4 && <DocumentUpload />}
          {step === 5 && <PaymentDetails />}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddResidence;
