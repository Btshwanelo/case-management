import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useSuppllierUpsertRecordReqMutation } from '@/services/apiService';
import { showSuccessToast } from '@/components/SuccessToast';
import { showErrorToast } from '@/components/ErrorToast ';
import { Spinner } from '@/components/ui/spinner';
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { removeForcedAction } from '@/slices/forcedActionsSlice';

const ProfileDetails = ({ details, contactDetails, nextOfKin }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tag = searchParams.get('tag');
  const dispatch = useDispatch();
  const [suppllierUpsertRecordReq, { data, isLoading, isSuccess, isError, error }] = useSuppllierUpsertRecordReqMutation();
  const form = useForm({
    defaultValues: {
      FirstName: '',
      LastName: '',
      Mobile: '',
      Email: '',
      NextOfKinEmail: '',
      NextOfKinFullName: '',
      NextOfKinMobile: '',
      NextOfKinRelationship: '',
      registrationNumber: '',
      RegistrationName: '',
      VATNumber: '',
      Name: '',
    },
  });

  const onSubmit = async (data) => {
    console.log('data', data);
    suppllierUpsertRecordReq({
      body: {
        entityName: 'Supplier',
        requestName: 'UpsertRecordReq',
        recordId: details.accomodationProviderId,
        inputParamters: {
          Entity: {
            ...data,
          },
        },
      },
    });
  };

  useEffect(() => {
    form.setValue('Name', details?.tradingName || '');
    form.setValue('FirstName', contactDetails?.firstName);
    form.setValue('LastName', contactDetails?.lastName);
    form.setValue('Mobile', contactDetails?.mobileNumber);
    form.setValue('Email', contactDetails?.email);
    form.setValue('NextOfKinEmail', nextOfKin?.email);
    form.setValue('NextOfKinFullName', nextOfKin?.fullName);
    form.setValue('NextOfKinMobile', nextOfKin?.mobileNumber);
    form.setValue('NextOfKinRelationship', nextOfKin?.relationship);
    form.setValue('RegistrationName', details?.registerdName);
    form.setValue('registrationNumber', details?.registrationNumber);
    form.setValue('VATNumber', details?.vatNumber);
  }, []);

  useEffect(() => {
    const currentStep = searchParams.get('s');
    if (currentStep !== 'profile') {
      setSearchParams({ ...Object.fromEntries(searchParams), s: 'profile' });
    }
  }, []);

  if (isSuccess) {
    if (tag != null) {
      dispatch(removeForcedAction(0));
    } else {
      showSuccessToast(data?.clientMessage);
    }
  }

  if (isError) {
    showErrorToast(error.data);
  }

  return (
    <div className="lg:col-span-9">
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium">Profile details</h2>
              <p className="text-sm text-gray-500">Update your details here.</p>
            </div>

            <Form {...form}>
              <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-8">
                  {/* Company Details Section */}
                  <div>
                    <h3 className="text-md font-medium mb-4 flex items-center gap-2">
                      Company details
                      <Info className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">This will not be displayed on your profile.</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="Name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trading name *</FormLabel>
                            <FormControl>
                              <Input {...form.register('Name', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="RegistrationName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Registered Name *</FormLabel>
                            <FormControl>
                              <Input {...form.register('RegistrationName', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="registrationNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Registration number *</FormLabel>
                            <FormControl>
                              <Input {...form.register('registrationNumber', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="VATNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>VAT Number *</FormLabel>
                            <FormControl>
                              <Input {...form.register('VATNumber', { required: true })} />
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
                      Personal Detail
                      <Info className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Your email and number and such like things</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      {/* add first name */}
                      {/* add last name */}
                      {/* add id number */}
                    </div>
                  </div>

                  {/* Next of Kin Section */}
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
                            <FormLabel>Email *</FormLabel>
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
                  <Button variant="outline" className="min-w-28" type="button">
                    Cancel
                  </Button>
                  <Button type="submit" className="min-w-28">
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

export default ProfileDetails;
