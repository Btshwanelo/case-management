import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useEmployeeMutation } from '@/services/apiService';
import { useSelector } from 'react-redux';
import { showErrorToast } from '@/components/ErrorToast ';
import { RootState } from '@/store';
import { useParams, useSearchParams } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import InviteSuccess from './SucessInvite';
import { ButtonLoader } from '@/components/ui/button-loader';

const StudentSearchInvite = () => {
  const [searchParams] = useSearchParams();
  const contactNo = searchParams.get('numbers');
  const { id } = useParams();

  const userDetails = useSelector((state: RootState) => state.details.requestResults);

  const [inviteStudent, { isLoading, data, isSuccess, isError, error }] = useEmployeeMutation();

  // Handle invite action
  const handleInviteStudent = () => {
    inviteStudent({
      body: {
        entityName: 'Employee',
        requestName: 'InviteStudents',
        inputParamters: {
          accomodationProviderId: userDetails.supplierId,
          idNumber: id,
          mobile: contactNo,
        },
      },
    });
  };

  // Render success component if the invite was successful
  if (isSuccess) {
    return <InviteSuccess />;
  }
  if (isError) {
    showErrorToast(error.data);
  }

  return (
    <DashboardLayout>
      <div className="mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center mb-12">
          <Card className="w-full max-w-2xl mx-auto border-none">
            <CardHeader className="text-center space-y-6">
              <CardTitle className="text-2xl font-bold">Invite Student to Apply</CardTitle>
              <CardDescription className="text-gray-600">
                This student does not have a lease history. You can invite them to apply to your property below.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="idNumber">SA ID Number</Label>
                  <Input id="idNumber" type="text" value={id} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNo">Cellphone</Label>
                  <Input id="contactNo" type="text" value={contactNo} disabled />
                </div>

                <Button type="button" className=" bg-orange-500 hover:bg-orange-600 text-white" size="lg" onClick={handleInviteStudent}>
                  {isLoading ? <ButtonLoader className="text-white" /> : 'Invite to Apply'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentSearchInvite;
