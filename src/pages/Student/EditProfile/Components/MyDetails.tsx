import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useEmployeeUpsertRecordReqMutation, useSuppllierUpsertRecordReqMutation } from '@/services/apiService';
import { showSuccessToast } from '@/components/SuccessToast';
import { showErrorToast } from '@/components/ErrorToast ';
import { Spinner } from '@/components/ui/spinner';
import { useDispatch } from 'react-redux';
import { removeForcedAction } from '@/slices/forcedActionsSlice';
import { useSearchParams } from 'react-router-dom';
import StepperItem from '@/pages/OnBoarding/Components/Steppertem';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ProfileResetModal from '@/components/ProfileResetModal';

enum GenderType {
  Male = '1',
  Female = '2',
}

const GENDER_OPTIONS = Object.entries(GenderType).map(([label, value]) => ({ value, label }));
const MyDetails = ({ details, setNextStep }) => {
  const [searchParams] = useSearchParams();
  const [showResetModal, setShowResetModal] = useState(false);

  const [employeeUpsertRecordReq, { data, isLoading, isSuccess, isError }] = useEmployeeUpsertRecordReqMutation();
  const form = useForm({
    defaultValues: {
      FirstName: '',
      LastName: '',
      Mobile: '',
      GenderId: '',
      Email: '',
      NextOfKinEmail: '',
      NextOfKinFullName: '',
      NextOfKinMobile: '',
      NextOfKinRelationship: '',
      IdNumber: '',
    },
  });

  const tag = searchParams.get('tag');
  const dispatch = useDispatch();

  const onSubmit = async (data) => {
    console.log(data);

    employeeUpsertRecordReq({
      body: {
        entityName: 'Employee',
        requestName: 'UpsertRecordReq',
        recordId: details.studentDetails.employeeId,
        inputParamters: {
          Entity: {
            ...data,
          },
        },
      },
    });
  };

  useEffect(() => {
    form.setValue('FirstName', details?.studentDetails.firstName);
    form.setValue('LastName', details?.studentDetails.lastName);
    form.setValue('Mobile', details?.studentDetails.mobile);
    form.setValue('GenderId', details?.studentDetails.gender);
    form.setValue('IdNumber', details?.studentDetails.idNumber);
    form.setValue('Email', details?.studentDetails.email);
    form.setValue('NextOfKinEmail', details?.nextOfKinDetails.nextOfKinEmail);
    form.setValue('NextOfKinFullName', details?.nextOfKinDetails.nextOfKinFullName);
    form.setValue('NextOfKinMobile', details?.nextOfKinDetails.nextOfKinMobile);
    form.setValue('NextOfKinRelationship', details?.nextOfKinDetails.nextOfKinRelationship);
  }, []);

  if (isSuccess) {
    if (tag != null) {
      showSuccessToast('Profile updated successfully!');
      setNextStep();
    } else {
      showSuccessToast('Profile updated successfully!');
    }
  }
  if (isError) {
    showErrorToast(data?.clientMessage);
  }

  return (
    <div className="lg:col-span-9">
      {showResetModal && (
        <ProfileResetModal isOpen={showResetModal} onCancell={(e) => setShowResetModal(e)} onOpenChange={(e) => setShowResetModal(false)} />
      )}
      <div className="space-y-6">
        <Card>
          {tag != null && (
            <div className="flex items-center w-full justify-center mt-3">
              {[1, 2, 3].map((step, index) => (
                <StepperItem key={step} active={step <= 1} completed={step < 1} first={index === 0} last={index === 2} />
              ))}
            </div>
          )}

          <CardContent className="pt-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium">Profile details</h2>
              <p className="text-sm text-gray-500">Update your details here.</p>
            </div>

            <Alert className="mb-6 bg-red-50 border-red-200">
              <div className="flex justify-between items-center gap-6">
                <AlertDescription className="flex items-center gap-2 font-medium text-red-600">
                  <Info className="h-4 w-4 text-red-500" />
                  If you registered as a student but are actually a Landlord, you can reset your profile here to select the correct user
                  type.
                </AlertDescription>
                <div className="flex items-center gap-2">
                  <Button variant="default" className="bg-red-500 hover:bg-red-600" onClick={() => setShowResetModal(true)}>
                    Reset Profile
                  </Button>
                </div>
              </div>
            </Alert>

            <Form {...form}>
              <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-8">
                  {/* Company Details Section */}
                  <div>
                    <h3 className="text-md font-medium mb-4 flex items-center gap-2">
                      Profile details
                      <Info className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">This will not be displayed on your profile.</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="FirstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First name *</FormLabel>
                            <FormControl>
                              <Input {...form.register('FirstName', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="LastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input {...form.register('LastName', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="Email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input {...form.register('Email', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="Mobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobile Number *</FormLabel>
                            <FormControl>
                              <Input {...form.register('Mobile', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="IdNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID Number *</FormLabel>
                            <FormControl>
                              <Input {...form.register('IdNumber', { required: true })} disabled />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="GenderId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender *</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value} // Bind value to the field's value
                                onValueChange={(value) => form.setValue('GenderId', value)} // Update field value on change
                              >
                                <SelectTrigger className="">
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                  {GENDER_OPTIONS.map((province) => (
                                    <SelectItem value={province.value}>{province.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Personal Details Section */}
                  <div>
                    <h3 className="text-md font-medium mb-4 flex items-center gap-2">
                      Next of Kin Detail
                      <Info className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Add and manage your next of kin information</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="NextOfKinFullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input {...form.register('NextOfKinFullName', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="NextOfKinRelationship"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relationship *</FormLabel>
                            <FormControl>
                              <Input {...form.register('NextOfKinRelationship', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="NextOfKinMobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobile Number *</FormLabel>
                            <FormControl>
                              <Input {...form.register('NextOfKinMobile', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="NextOfKinEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>NextOfKinEmail *</FormLabel>
                            <FormControl>
                              <Input {...form.register('NextOfKinEmail', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button className="min-w-28" variant="outline" type="button">
                    Cancel
                  </Button>
                  <Button className="min-w-28" type="submit">
                    {isLoading ? <Spinner /> : 'Save'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyDetails;
