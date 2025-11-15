import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm, useWatch } from 'react-hook-form';
import { Spinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useCampusRetrieveMasterValuesMutation,
  useEmployeeUpsertRecordReqMutation,
  useExternlaLogonRetrieveMasterValuesMutation,
  useTermTypeRetrieveMasterValuesMutation,
} from '@/services/apiService';
import { showSuccessToast } from '@/components/SuccessToast';
import { showErrorToast } from '@/components/ErrorToast ';
import { useSearchParams } from 'react-router-dom';
import StepperItem from '@/pages/OnBoarding/Components/Steppertem';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import ProfileResetModal from '@/components/ProfileResetModal';
import EditAcademicModal from './EditAcademicModal';

const AcademicInformation = ({ details, setNextStep }) => {
  const [searchParams] = useSearchParams();
  const tag = searchParams.get('tag');
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLocked, setIsLocked] = useState(true);

  const [
    employeeUpsertRecordReq,
    { data: Address, isLoading: isLoadingAddress, isSuccess: isSuccessAddress, isError: isErrorAddress, error: errorAddress },
  ] = useEmployeeUpsertRecordReqMutation();
  const [termTypeRetrieveMasterValues, { data: dataTermTypeMaster, isLoading: isLoadingTermTypeMaster }] =
    useTermTypeRetrieveMasterValuesMutation();
  const [campusRetrieveMasterValues, { data: dataCampusMaster, isLoading: isLoadingCampusMaster }] =
    useCampusRetrieveMasterValuesMutation();
  const [externlaLogonRetrieveMasterValues, { data: dataMaster, isLoading: isLoadingMaster }] =
    useExternlaLogonRetrieveMasterValuesMutation();

  // Initialize form with proper type conversion for termTypeId
  const form = useForm({
    defaultValues: {
      TermTypeId: details?.facilityInstitution?.termTypeId || '',
      InstitutionIdName: details?.facilityInstitution?.institutionIdName || '',
      CampusIdName: details?.facilityInstitution?.campusIdName || '',
    },
  });

  const institution = useWatch({
    control: form.control,
    name: 'InstitutionIdName',
  });
  const campus = useWatch({
    control: form.control,
    name: 'InstitutionIdName',
  });

  // Get term type options from API response
  const getOptions = (schemaName) => {
    return dataMaster?.staticData?.find((item) => item.schemaName === schemaName)?.options || [];
  };
  const getTermTypeOptions = (schemaName) => {
    return dataTermTypeMaster?.staticData?.find((item) => item.schemaName === schemaName)?.options || [];
  };
  const getCampusOptions = (schemaName) => {
    return dataCampusMaster?.staticData?.find((item) => item.schemaName === schemaName)?.options || [];
  };

  const institutionOptions = getOptions('InstitutionId');
  const termTypeOptions = getTermTypeOptions('TermTypeId');
  const campusOptions = getCampusOptions('CampusId');

  useEffect(() => {
    externlaLogonRetrieveMasterValues({
      body: {
        entityName: 'ExternlaLogon',
        requestName: 'RetrieveMasterValues',
        inputParamters: {
          Page: 'onboarding?academic-information=true',
        },
      },
    });
    termTypeRetrieveMasterValues({
      body: {
        entityName: 'ExternlaLogon',
        requestName: 'RetrieveMasterValues',
        inputParamters: {
          Page: 'onboarding?termtype=true',
        },
      },
    });
  }, []);

  useEffect(() => {
    if (institution != '') {
      campusRetrieveMasterValues({
        body: {
          entityName: 'ExternlaLogon',
          requestName: 'RetrieveMasterValues',
          inputParamters: {
            Page: 'onboarding?academic-information=true',
            InstitutionId: institution,
          },
        },
      });
    }
  }, [institution]);

  const onSubmit = async (data) => {
    employeeUpsertRecordReq({
      body: {
        entityName: 'Employee',
        requestName: 'UpdateAcademicInfoReq',
        recordId: details.studentDetails.employeeId,
        inputParamters: {
          TermTypeId: data.TermTypeId, // Convert string value back to number
          CampusId: data.CampusIdName, // Convert string value back to number
          CompanyId: data.InstitutionIdName, // Convert string value back to number
        },
      },
    });
  };

  // Handle success and error states

  if (isSuccessAddress) {
    if (tag != null) {
      showSuccessToast(Address?.clientMessage || 'Sucessfully updated Profile Details');
      setNextStep();
    } else {
      showSuccessToast(Address?.clientMessage || 'Sucessfully updated Profile Details');
    }
  }

  if (isErrorAddress) {
    showErrorToast(errorAddress?.data || 'Error updating Profile Details');
  }

  return (
    <div className="lg:col-span-9">
      <div className="space-y-6">
        <Card>
          {tag != null && (
            <div className="flex items-center w-full justify-center mt-3">
              {[1, 2, 3].map((step, index) => (
                <StepperItem key={step} active={step <= 2} completed={step < 2} first={index === 0} last={index === 2} />
              ))}
            </div>
          )}
          {showEditModal && (
            <EditAcademicModal
              isOpen={showEditModal}
              onCancel={() => {
                setIsLocked(true);
                setShowEditModal(false);
              }}
              onConfirm={() => {
                setIsLocked(false);
                setShowEditModal(false);
              }}
            />
          )}

          <CardContent className="pt-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium">Academic information</h2>
              <p className="text-sm text-gray-500">View your academic details here.</p>
            </div>
            {/* <Alert className="mb-2 bg-blue-50 border-blue-200">
              <div className="flex justify-between items-center gap-6">
                <AlertDescription className="flex items-center gap-2 text-blue-600">
                  <Info className="h-4 w-4 text-blue-500" />
                  Changing your institution or campus will affect your profile and associated data. Please confirm before proceeding.
                </AlertDescription>
                <div className="flex items-center gap-2">
                  <Button variant="default" className="bg-orange-500 hover:bg-orange-600" onClick={() => setShowEditModal(true)}>
                    Change Institution
                  </Button>
                </div>
              </div>
            </Alert> */}

            <Form {...form}>
              <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Institution Field */}

                    <FormField
                      control={form.control}
                      name="InstitutionIdName"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Institution *</FormLabel>
                          <FormControl>
                            <Select value={field.value} disabled={isLocked} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Institution" />
                              </SelectTrigger>
                              <SelectContent>
                                {institutionOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.lable}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Campus Field */}
                    <FormField
                      control={form.control}
                      name="CampusIdName"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Campus *</FormLabel>
                          <FormControl>
                            <Select value={field.value} disabled={isLocked} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Campus" />
                              </SelectTrigger>
                              <SelectContent>
                                {campusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.lable}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Term Type Field */}
                    <FormField
                      control={form.control}
                      name="TermTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Study Term *</FormLabel>
                          <FormControl>
                            <Select value={field.value} disabled={field.value !== '1101'} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Study Term" />
                              </SelectTrigger>
                              <SelectContent>
                                {termTypeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.lable}
                                  </SelectItem>
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

                <div className="flex justify-end gap-4">
                  <Button variant="outline" className="min-w-28" type="button">
                    Cancel
                  </Button>
                  <Button type="submit" className="min-w-28" variant="default">
                    {isLoadingAddress ? <Spinner /> : 'Save'}
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

export default AcademicInformation;
