import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/layouts/DashboardLayout';
import * as yup from 'yup';
import { convertFileToBase64, getDatesFromJuly2024, getId, getStatusBadgeClass } from '@/utils';
import { Upload, Cloud, X } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Controller } from 'react-hook-form';
import Breadcrumb from '@/components/BreadCrumb';
import PageLoder from '@/components/PageLoder';
import ErrorPage from '@/components/ErrorPage';
import { showErrorToast } from '@/components/ErrorToast ';

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

const schema = yup
  .object({
    CaseClassificationId: yup.string().required('This field is required'),
    NoticeMonth: yup.string(),
    ClassificationOtherInput: yup.string(),
    SubClassificationId: yup.string(),
    SubClassificationOtherInput: yup.string(),
    RegardingId: yup.string(),
    Subject: yup.string().required('This field is required'),
    Description: yup.string().required('This field is required'),
  })
  .strict();

const CreateCase = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = React.useState([]);
  const [regardingTypeCode, setRegardingTypeCode] = React.useState('');
  const [error, setError] = useState('');
  const userDeatils = useSelector((state: RootState) => state.details.requestResults);
  const [caseType, setCaseType] = useState({
    caseClassificationId: null,
    name: null,
    isParent: null,
    caseType: null,
    aLlowRegarding: null,
    subClassifications: null,
  });

  const [cases, { isLoading, isSuccess, isError, error: errorCases, data }] = useCasesMutation();
  const [
    casesCreate,
    { isLoading: isLoadingCreate, error: errorCreate, isSuccess: isSuccessCreate, isError: isErrorCreate, data: dataCreate },
  ] = useCasesCreateMutation();
  const [
    caseRegarding,
    {
      isLoading: isLoadingCaseRegarding,
      isSuccess: isSuccessCaseRegarding,
      isError: isErrorCaseRegarding,
      data: dataCaseRegarding,
      error: errorCaseRegarding,
    },
  ] = useCaseRegardingMutation();

  const { control, errors, onSubmit, watch, getValues, setValue } = useForm<FormData>({
    defaultValues: {
      CaseClassificationId: '',
      NoticeMonth: '',
      ClassificationOtherInput: '',
      SubClassificationId: '',
      SubClassificationOtherInput: '',
      Subject: '',
      Description: '',
      RegardingId: '',
    },
    validationSchema: schema,

    onSubmit: (data) => {
      const isValid = validateConditionalFields(data);
      if (!isValid) return;

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
              regardingIdObjectTypeCode: regardingTypeCode,
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
  const subClassificationId = watch('SubClassificationId');
  const RegardingId = watch('RegardingId');
  const CaseClassificationId = watch('CaseClassificationId');

  const getObjectTypeCode = (recordId) => {
    const record = dataCaseRegarding?.RegardingDetails?.find((item) => item.recordId === recordId);
    return record ? record.objectTypeCode : ''; // Return `null` if not found
  };

  useEffect(() => {
    const objectTypeCode = getObjectTypeCode(RegardingId);
    setRegardingTypeCode(objectTypeCode);
  }, [RegardingId]);

  useEffect(() => {
    const result = data?.CaseClassification?.find((item) => item.caseClassificationId === formData.CaseClassificationId);

    setCaseType(result);
  }, [formData.CaseClassificationId]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleFileUpload = async (uploadedFiles) => {
    const b64FilesPromises = uploadedFiles.map((file) => {
      return new Promise((resolve, reject) => {
        // Add file size validation (4MB = 4 * 1024 * 1024 bytes)
        if (file.size > 4 * 1024 * 1024) {
          reject(new Error(`File ${file.name} is too large. Maximum size is 4MB.`));
          return;
        }

        convertFileToBase64(file)
          .then((b64) => {
            resolve({
              id: getId().toString(),
              FileName: file.name,
              FileExtention: file.name.split('.').pop() || '',
              DocumentTypeId: 697,
              FileContent: b64.split('base64,')[1],
              previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
              size: (file.size / 1024).toFixed(2) + ' KB',
            });
          })
          .catch(reject);
      });
    });

    try {
      const b64Files = await Promise.all(b64FilesPromises);
      setFiles((prev) => [...prev, ...b64Files]);
      setError('');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    await handleFileUpload(droppedFiles);
  };

  const removeFile = (fileId) => {
    setFiles(files.filter((file) => file.id !== fileId));
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    await handleFileUpload(selectedFiles);
    e.target.value = ''; // Reset input
  };

  const filteredDates = getDatesFromJuly2024(LEASE_TERMINATION_DATES);
  // const filteredDates = getDatesFromNextMonth(LEASE_TERMINATION_DATES);

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

  const validateConditionalFields = (data: FormData) => {
    if (caseType?.caseType === 'Termination' && !data.NoticeMonth) {
      return false;
    }
    if (caseType?.caseType === 'Other' && !data.ClassificationOtherInput) {
      return false;
    }
    if (caseType?.subClassifications?.length > 0 && !data.SubClassificationId) {
      return false;
    }
    return true;
  };
  const handleRetrieveCaseRegarding = () => {
    caseRegarding({
      body: {
        entityName: 'Cases',
        requestName: 'RetrieveCaseRegardingReq',
        inputParamters: {
          RegardingType: CaseClassificationId,
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
  }, [caseType]);

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

  const FilePreview = ({ file }) => (
    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md mb-2">
      <div className="flex items-center space-x-2">
        {file.previewUrl ? (
          <img src={file.previewUrl} alt={file.FileName} className="h-8 w-8 object-cover rounded" />
        ) : (
          <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-xs">{file.FileExtention.toUpperCase()}</span>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium truncate max-w-xs">{file.FileName}</span>
          <span className="text-xs text-gray-500">{file.size}</span>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)} className="text-gray-500 hover:text-red-500">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );

  useEffect(() => {
    if (caseType?.aLlowRegarding && dataCaseRegarding?.RegardingDetails?.length === 1) {
      setValue('RegardingId', dataCaseRegarding?.RegardingDetails[0]?.recordId);
    }
  }, [caseType?.aLlowRegarding, dataCaseRegarding, setValue]);

  if (isSuccessCreate) {
    return <ApplicationSuccess message={dataCreate?.clientMessage} />;
  }

  const breadcrumbItems = [
    { path: '/cases', label: 'Cases' },
    { path: '/cases', label: 'Create Case' },
  ];

  if (isErrorCaseRegarding) {
    showErrorToast(errorCaseRegarding.data);
  }

  if (isErrorCreate) {
    showErrorToast(errorCreate.data);
  }

  return (
    <DashboardLayout>
      <Breadcrumb items={breadcrumbItems} />

      {isLoading && <PageLoder />}
      {isError && <ErrorPage message={errorCases.data} />}

      {isSuccess && (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Card className="p-8">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-6">
                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      className="border border-gray-500 text-gray-700"
                      disabled
                      placeholder="Enter your name"
                      defaultValue={userDeatils.firstName}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      disabled
                      type="email"
                      className="border border-gray-500 text-gray-700"
                      placeholder="Enter your email"
                      defaultValue={userDeatils.email}
                    />
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

                {/* Sub Classification */}
                {caseType?.subClassifications?.length > 0 && (
                  <div className="space-y-2">
                    <SelectDropdown
                      name="SubClassificationId"
                      control={control}
                      label={'Sub-Query'}
                      options={caseType?.subClassifications.map((item) => ({
                        value: item.caseClassificationId,
                        label: item.name,
                      }))}
                      error={errors.SubClassificationId?.message}
                      placeholder="Select sub-query"
                    />
                  </div>
                )}

                {/* work */}
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

                {caseType?.aLlowRegarding && dataCaseRegarding?.RegardingDetails?.length == 1 && (
                  <div className="space-y-2">
                    <div className="form-group flex flex-col">
                      <label className="font-medium mb-2">Regarding</label>
                      <Controller
                        name="RegardingId"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            disabled
                            value={dataCaseRegarding?.RegardingDetails[0]?.name || ''}
                            placeholder="Regarding"
                            className="input bg-white border border-gray-200 px-4 py-1 rounded-sm"
                          />
                        )}
                      />
                    </div>
                    {errors.RegardingId && <p className="text-sm text-red-500">{errors.RegardingId?.message}</p>}
                  </div>
                )}

                {caseType?.aLlowRegarding && dataCaseRegarding?.RegardingDetails.length > 1 && (
                  <div className="space-y-2">
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
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
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
                  {/* {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="text-sm text-gray-600 bg-blue-400 p-1 w-fit mx-auto rounded-md">
                        {file.name}
                      </div>
                    ))}
                  </div>
                )} */}
                </div>

                {files.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Uploaded Files</h3>
                    <div className="space-y-2">
                      {files.map((file) => (
                        <FilePreview key={file.id} file={file} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full  flex items-center rounded-lg hover:bg-[#0086C9] hover:text-white border-2 px-[14px] py-[10px] bg-[#0086C9] text-white shadow-sm justify-center gap-2 border-[#ffffff1f]"
                >
                  {isLoadingCreate ? <Spinner className="text-white" /> : 'Submit'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CreateCase;
