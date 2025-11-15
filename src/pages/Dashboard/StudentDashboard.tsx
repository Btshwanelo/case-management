import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Users, Home, FileText, Briefcase, UserCheck } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';

const StudentDashboard = ({ userDetails }) => {
  console.log('das', userDetails);
  const stats = [
    {
      title: 'My Residence',
      icon: <Home className="h-5 w-5" />,
      value: 'Active',
      description: 'Current Status',
    },
    {
      title: 'My Invoices',
      icon: <FileText className="h-5 w-5" />,
      value: '0',
      description: 'Pending Invoices',
    },
    {
      title: 'My Cases',
      icon: <Briefcase className="h-5 w-5" />,
      value: '0',
      description: 'Open Cases',
    },
    {
      title: 'My Tenants',
      icon: <UserCheck className="h-5 w-5" />,
      value: '0',
      description: 'Active Tenants',
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="space-y-2 pb-10">
          <h2 className="text-3xl font-bold tracking-tight">Welcome back, {userDetails.firstName + ' ' + userDetails.lastName}</h2>
          <p className="text-gray-500">Here's what's happening with your accommodations.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pb-10">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 text-green-800 rounded-full">{stat.icon}</div>
                  <span className="font-medium">{stat.title}</span>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <p className="text-sm text-gray-500">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User Information Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-sm">{userDetails.firstName + ' ' + userDetails.lastName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Account Code</p>
                  <p className="text-sm">{userDetails.code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm">{userDetails.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Mobile</p>
                  <p className="text-sm">{userDetails.mobile}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next of Kin Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Next of Kin</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-sm">{userDetails.nextOfKinFullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Relationship</p>
                  <p className="text-sm">{userDetails.nextOfKinRelationship}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Mobile</p>
                  <p className="text-sm">{userDetails.nextOfKinMobile}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm">{userDetails.nextOfKinEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
