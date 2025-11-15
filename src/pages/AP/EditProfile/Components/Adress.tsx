import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Info, SaveIcon, SaveOffIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAddressUpsertRecordReqMutation } from '@/services/apiService';
import { Spinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccessToast } from '@/components/SuccessToast';
import { showErrorToast } from '@/components/ErrorToast ';
import { removeForcedAction } from '@/slices/forcedActionsSlice';
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import StepperItem from '@/pages/OnBoarding/Components/Steppertem';

const PROVINCES_CODE_MAP = {
  175: 'Eastern Cape',
  176: 'Gauteng',
  177: 'Free State',
  178: 'KwaZulu Natal',
  179: 'Limpopo',
  180: 'Mpumalanga',
  181: 'Northen Cape',
  182: 'Western Cape',
  183: 'North West',
};

const PROVINCE_OPTIONS = Object.entries(PROVINCES_CODE_MAP).map(([value, label]) => ({ value, label }));

const AddressForm = ({ address, userDetails, details, contactDetails, setNextStep }) => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const tag = searchParams.get('tag');
  const [
    addressUpsertRecordReq,
    { data: Address, isLoading: isLoadingAddress, isSuccess: isSuccessAddress, isError: isErrorAddress, error: errorAddress },
  ] = useAddressUpsertRecordReqMutation();

  const form = useForm({
    defaultValues: {
      StreetNumber: '',
      StreetName: '',
      City: '',
      Suburb: '',
      PostalCode: '',
      Province: '',
    },
  });

  const onSubmit = async (data) => {
    const requestBody = {
      entityName: 'Address',
      requestName: 'UpsertRecordReq',
      inputParamters: {
        Entity: {
          ...data,
          RelatedObjectId: userDetails.supplierId,
          RelatedObjectIdObjectTypeCode: 'Supplier',
        },
      },
    };

    if (address.addressId) {
      requestBody.recordId = address.addressId;
    }
    addressUpsertRecordReq({
      body: requestBody,
    });
  };

  useEffect(() => {
    form.setValue('StreetNumber', address.streetNumber);
    form.setValue('StreetName', address.streetName);
    form.setValue('City', address.city);
    form.setValue('Suburb', address.suburb);
    form.setValue('PostalCode', address.postalCode);
    form.setValue('Province', address.province);
  }, []);

  useEffect(() => {
    const currentStep = searchParams.get('s');
    if (currentStep !== 'address') {
      setSearchParams({ ...Object.fromEntries(searchParams), s: 'address' });
    }
  }, []);

  if (isSuccessAddress) {
    if (tag != null) {
      showSuccessToast('Sucessfully updated address');
      setNextStep();
    } else {
      showSuccessToast('Sucessfully updated address');
    }
  }

  if (isErrorAddress) {
    showErrorToast(errorAddress?.data || 'Error updating address');
  }

  return (
    <div className="lg:col-span-9">
      <div className="space-y-6">
        <Card>
          {tag != null && (
            <div className="flex items-center w-full justify-center mt-3">
              {[1, 2, 3, 4].map((step, index) => (
                <StepperItem key={step} active={step <= 2} completed={step < 2} first={index === 0} last={index === 3} />
              ))}
            </div>
          )}
          <CardContent className="pt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-medium flex">Address Information </h2>
              <p className="text-sm text-gray-500">View and manage your address details here.</p>
            </div>

            <Form {...form}>
              <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-6">
                  {/* School Details Section */}
                  <div>
                    {/* <h3 className="text-md font-medium mb-4 flex items-center gap-2">
                      School details
                      <Info className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">This will not be displayed on your profile.</span>
                    </h3> */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="StreetNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Street Number <span className="text-orange-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input {...form.register('StreetNumber', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="StreetName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Street Address <span className="text-orange-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input {...form.register('StreetName', { required: true })} />
                            </FormControl>
                            {/* <FormDescription>Must be at least 8 characters.</FormDescription> */}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="City"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              City <span className="text-orange-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input {...form.register('City', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="Suburb"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Suburb <span className="text-orange-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input {...form.register('Suburb', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="PostalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Postal Code <span className="text-orange-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input {...form.register('PostalCode', { required: true })} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="Province"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Province <span className="text-orange-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Select
                                value={field.value} // Bind value to the field's value
                                onValueChange={(value) => form.setValue('Province', value)} // Update field value on change
                              >
                                <SelectTrigger className="">
                                  <SelectValue placeholder="Select a province" />
                                </SelectTrigger>
                                <SelectContent>
                                  {PROVINCE_OPTIONS.map((province) => (
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
                </div>

                <div className="flex justify-end pt-4 gap-4">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto flex items-center rounded-lg border px-[14px] py-[10px] bg-[#fff] text-[#414651] shadow-sm justify-center gap-2 border-[#D5D7DA]"
                    type="button"
                  >
                    <SaveOffIcon /> Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="w-full sm:w-auto flex items-center rounded-lg hover:bg-[#FF692E] hover:text-white border-2 px-[14px] py-[10px] bg-[#FF692E] text-white shadow-sm justify-center gap-2 border-[#ffffff1f]"
                    variant="default"
                  >
                    {!isLoadingAddress && <SaveIcon />} {isLoadingAddress ? <Spinner /> : 'Save'}
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

export default AddressForm;
