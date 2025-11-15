import React from 'react';
import { Bell, LogOut, Copyright, ChevronRight, Zap, Ban, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import Breadcrumb from '@/components/BreadCrumb';

const EmptyListingComponent = () => {
  const breadcrumbItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/dashboard/accommodation', label: 'Accommodation Application' },
  ];
  const navigate = useNavigate();
  return (
    <DashboardLayout>
      <Breadcrumb items={breadcrumbItems} />
      {/* Header */}

      {/* Main Content */}
      <div className="container mx-auto mt-10 space-y-10 bg-white rounded-md px-8 py-10 max-w-3xl">
        {/* How it works section */}
        <div className="mb-8 flex flex-col items-center">
          <div className="bg-[#ffe6d5] rounded-md text-center w-12 h-12 flex items-center justify-center mb-6">
            <div className="text-2xl text-center flex items-center self-center">
              <Ban className="text-orange-500" />{' '}
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-4 text-center ">No upcoming Property Viewing</h1>
          <p className="text-gray-600 mb-6 font-normal text-lg text-center">
            You do not yet have any property viewings reserved, apply to a property to start seeing upcoming reservations
          </p>
        </div>

        {/* Get Started Button */}
        <button
          onClick={() => navigate(`/student/search-residence`)}
          className="w-full mb-3 bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold mt-6 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> Apply for accommodation
        </button>
      </div>
    </DashboardLayout>
  );
};

export default EmptyListingComponent;
