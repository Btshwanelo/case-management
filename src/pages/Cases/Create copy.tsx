import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/layouts/DashboardLayout';

import { Upload, Cloud } from 'lucide-react';
import { useCaseRegardingMutation, useCasesCreateMutation, useCasesMutation } from '@/services/apiService';
import { getDatesFromNextMonth } from '@/utils';

import FormInput from '@/components/form-elements/FormInput';
import { useForm } from '@/hooks/useForm';
import { CreateCaseSchema } from '@/utils/validations';
import SelectDropdown from '@/components/form-elements/SelectDropDown';
import FormTextArea from '@/components/form-elements/FormTextArea';
import SearchableSelect from '@/components/form-elements/SearchableSelect';
import { Spinner } from '@/components/ui/spinner';
import ApplicationSuccess from './SuccessCaseCreate';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import { Card } from '@/components/ui/card';

const LEASE_TERMINATION_DATES = [
  { code: '01-01-2024', label: 'January 2024', value: '417' },
  { code: '01-02-2024', label: 'February 2024', value: '418' },
  { code: '01-03-2024', label: 'March 2024', value: '419' },
  { code: '01-04-2024', label: 'April 2024', value: '420' },
  { code: '01-05-2024', label: 'May 2024', value: '421' },
  { code: '01-06-2024', label: 'June 2024', value: '422' },
  { code: '01-07-2024', label: 'July 2024', value: '423' },
  { code: '01-08-2024', label: 'Augu 2024', value: '424' },
  { code: '01-09-2024', label: 'September 2024', value: '425' },
  { code: '01-10-2024', label: 'October 2024', value: '426' },
  { code: '01-11-2024', label: 'November 2024', value: '427' },
  { code: '01-12-2024', label: 'December 2024', value: '428' },
];

type FormData = {
  CaseClassificationId: string;
  NoticeMonth: string;
  ClassificationOtherInput: string;
  otherQuery: string;
  SubClassificationId: string;
  SubClassificationOtherInput: string;
  RegardingId: string;
  Subject: string;
  Description: string;
};

const emptySubquery: {
  caseSubClassifications: TSubClassification[];
  otherSubqueryId: string | undefined;
} = {
  caseSubClassifications: [],
  otherSubqueryId: undefined,
};

const CreateCase = () => {
  const [files, setFiles] = React.useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const userDeatils = useSelector((state: RootState) => state.details.requestResults);
  const [caseType, setCaseType] = useState({
    caseClassificationId: null,
    name: null,
    isParent: null,
    caseType: null,
    aLlowRegarding: null,
    subClassifications: null,
  });

  const { control, errors, onSubmit, watch, getValues } = useForm<FormData>({
    defaultValues: {
      CaseClassificationId: '',
      NoticeMonth: '',
      ClassificationOtherInput: '',
      SubClassificationId: '',
      SubClassificationOtherInput: '',
      otherQuery: '',
      Subject: '',
      Description: '',
    },
    validationSchema: CreateCaseSchema,
    onSubmit: (data) => {
      console.log(data);
      casesCreate({
        body: {
          entityName: 'Cases',
          requestName: 'UpsertRecordReq',
          inputParamters: {
            Entity: {
              CaseClassificationId: data.CaseClassificationId,
              Subject: data.Subject,
              Description: data.Description,
              NoticeMonth: data.NoticeMonth,
              regardingId: data.RegardingId,
              regardingIdObjectTypeCode: 'Invoice',
              CustomerId: userDeatils.relatedObjectIdObjectTypeCode === 'Supplier' ? userDeatils?.supplierId : userDeatils?.recordId,
              CustomerIdObjectTypeCode: userDeatils.relatedObjectIdObjectTypeCode,
              ChannelId: '681',
              CasesStatusId: '307',
              OtherReason: data.ClassificationOtherInput,
              SubClassificationId: data.SubClassificationId,
            },
            Documents: files,
          },
        },
      });
    },
  });

  const formData = watch(); // This will give you the current form data

  const {
    CaseClassificationId,
    NoticeMonth,
    ClassificationOtherInput,
    SubClassificationId,
    SubClassificationOtherInput,
    otherQuery,
    Subject,
    Description,
  } = formData;

  useEffect(() => {
    const result = data?.CaseClassification?.find((item) => item.caseClassificationId === formData.CaseClassificationId);

    setCaseType(result);
  }, [formData.CaseClassificationId]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const newFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const filteredDates = getDatesFromNextMonth(LEASE_TERMINATION_DATES);

  const [cases, { isLoading, isSuccess, isError, data }] = useCasesMutation();
  const [casesCreate, { isLoading: isLoadingCreate, isSuccess: isSuccessCreate, isError: isErrorCreate, data: dataCreate }] =
    useCasesCreateMutation();
  const [
    caseRegarding,
    { isLoading: isLoadingCaseRegarding, isSuccess: isSuccessCaseRegarding, isError: isErrorCaseRegarding, data: dataCaseRegarding },
  ] = useCaseRegardingMutation();

  const handleRetrieveCaseClassifications = () => {
    cases({
      body: {
        entityName: 'Cases',
        requestName: 'RetrieveCaseClassifications',
        inputParamters: {
          UserType: userDeatils.relatedObjectIdObjectTypeCode,
          UserId: userDeatils.relatedObjectIdObjectTypeCode === 'Supplier' ? userDeatils.supplierId : userDeatils.recordId,
        },
      },
    });
  };
  const handleRetrieveCaseRegarding = () => {
    caseRegarding({
      body: {
        entityName: 'Cases',
        requestName: 'RetrieveCaseRegardingReq',
        inputParamters: {
          RegardingType: '1d07ae6b-e623-49a8-8011-3db5cf59734d',
          UserId: userDeatils.relatedObjectIdObjectTypeCode === 'Supplier' ? userDeatils.supplierId : userDeatils.recordId,
          UserType: userDeatils.relatedObjectIdObjectTypeCode,
        },
      },
    });
  };

  useEffect(() => {
    handleRetrieveCaseClassifications();
  }, []);
  useEffect(() => {
    if (caseType?.aLlowRegarding) {
      handleRetrieveCaseRegarding();
    }
  }, []);

  if (isSuccessCreate) {
    return <ApplicationSuccess message={dataCreate?.clientMessage} />;
  }

  const regardingOptions = dataCaseRegarding?.RegardingDetails;
  const subClassificationId = watch('SubClassificationId');

  const { caseSubClassifications, otherSubqueryId } = useMemo(() => {
    if (!CaseClassificationId) {
      return emptySubquery;
    }
    const selectedCase = data?.CaseClassification.find((el) => el.caseClassificationId === CaseClassificationId);

    if (!selectedCase) {
      return emptySubquery;
    }
    if (selectedCase.isParent) {
      const otherSubqueryId = selectedCase.subClassifications.find((el) => el.name === 'Other')?.caseClassificationId;
      return {
        caseSubClassifications: selectedCase.subClassifications,
        otherSubqueryId: otherSubqueryId,
      };
    }
    return emptySubquery;
  }, [CaseClassificationId]);

  //caseType === "Termination" -done
  //caseType === "Other"
  //caseSubClassifications.length > 0
  //subClassificationId === otherSubqueryId
  //allowRegarding && regardingOptions.length > 1
  //allowRegarding && regardingOptions.length == 1

  //   {
  //     "caseClassificationId": "e98da3c8-9e9a-405c-97bf-7efac818b4b7",
  //     "name": "Invoice Dispute",
  //     "isParent": true,
  //     "caseType": "Normal",
  //     "aLlowRegarding": true,
  //     "subClassifications": [
  //         {
  //             "caseClassificationId": "39f60770-de3a-44af-a159-0af0b0b4008d",
  //             "name": "Partial Payment"
  //         },
  //         {
  //             "caseClassificationId": "468ac402-4a2d-4dda-a93b-746b1b9da25e",
  //             "name": "Other"
  //         }
  //     ]
  // }

  console.log('regardingOptions', regardingOptions);
  console.log('subClassificationId', subClassificationId);
  console.log('subClassificationId', subClassificationId);
  console.log('caseSubClassifications', caseSubClassifications);
  console.log('otherSubqueryId', otherSubqueryId);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-4">Create Case</h1>
        </div>
        <Card className="p-8">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-6">
              {/* Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" disabled placeholder="Enter your name" defaultValue={userDeatils.firstName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" disabled type="email" placeholder="Enter your email" defaultValue={userDeatils.email} />
                </div>
              </div>

              {/* Query Type */}
              <div className="space-y-2">
                <SelectDropdown
                  name="CaseClassificationId"
                  control={control}
                  label={'Query'}
                  options={data?.CaseClassification.map((item) => ({
                    value: item.caseClassificationId,
                    label: item.name,
                  }))}
                  error={errors.CaseClassificationId?.message}
                  placeholder="Select query"
                />
              </div>
              {/* Notice Month */}

              {caseType?.caseType === 'Termination' && (
                <div className="space-y-2">
                  <SelectDropdown
                    name="NoticeMonth"
                    control={control}
                    label={'Notice Month'}
                    options={filteredDates}
                    error={errors.NoticeMonth?.message}
                    placeholder="Select date"
                  />
                </div>
              )}

              {caseType?.caseType === 'Other' && (
                <div className="space-y-2">
                  <FormInput
                    name="ClassificationOtherInput"
                    control={control}
                    label="Other"
                    error={errors.ClassificationOtherInput?.message}
                    placeholder="Specify other query"
                  />
                </div>
              )}

              {/* Other */}
              {/* Sub Classification */}
              {caseType?.subClassifications?.length > 0 && (
                <div className="space-y-2">
                  <SelectDropdown
                    name="SubClassificationId"
                    control={control}
                    label={'Sub-Query'}
                    options={filteredDates}
                    error={errors.SubClassificationId?.message}
                    placeholder="Select sub-query"
                  />
                </div>
              )}

              {caseType?.caseSubClassifications?.length > 0 && subClassificationId === otherSubqueryId && (
                <div className="space-y-2">
                  <FormInput
                    name="SubClassificationOtherInput"
                    control={control}
                    label="Specify other sub-classification"
                    error={errors.SubClassificationId?.message}
                    placeholder="Specify other sub-classification"
                  />
                </div>
              )}

              {caseType?.aLlowRegarding && dataCaseRegarding?.RegardingDetails.length === 1 && (
                <div className="space-y-2">
                  <FormInput name="RegardingId" control={control} label="Regarding" error={errors.RegardingId?.message} placeholder="" />
                </div>
              )}
              {caseType?.aLlowRegarding && dataCaseRegarding?.RegardingDetails.length > 1 && (
                <div className="space-y-2">
                  <FormInput name="RegardingId" control={control} label="Regarding" error={errors.RegardingId?.message} placeholder="" />
                  <SearchableSelect
                    name="RegardingId"
                    control={control}
                    label="Regarding"
                    options={dataCaseRegarding?.RegardingDetails.map((item) => ({
                      value: item.recordId,
                      label: item.name,
                    }))}
                    error={errors.RegardingId?.message}
                    placeholder="Select Regarding"
                  />
                </div>
              )}

              <div className="space-y-2">
                <FormInput name="Subject" control={control} label="Subject" error={errors.Subject?.message} placeholder="Subject" />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <FormTextArea
                  name="Description"
                  control={control}
                  label="Description"
                  error={errors.Description?.message}
                  placeholder="Description"
                />
              </div>

              {/* File Upload */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center gap-2">
                  <Cloud className="h-10 w-10 text-gray-400" />
                  <div>
                    <Button
                      variant="link"
                      className="text-orange-500 p-0 h-auto font-normal"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('file-upload').click();
                      }}
                    >
                      Click to Upload
                    </Button>
                    <span className="text-gray-600"> or drag and drop</span>
                  </div>
                  <p className="text-sm text-gray-500">.SVG, .PNG, .JPG, JPEG, .GIF, .PDF (max. 4MB)</p>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                    accept=".svg,.png,.jpg,.jpeg,.gif,.pdf"
                  />
                </div>
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="text-sm text-gray-600 bg-blue-400 p-1 w-fit mx-auto rounded-md">
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button className="w-full bg-orange-500 hover:bg-orange-600">
                {isLoadingCreate ? <Spinner className="text-white" /> : 'Submit'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateCase;
