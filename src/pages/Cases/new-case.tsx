import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X, FileText, Loader2, Upload } from 'lucide-react';

import { cn } from '@/lib/utils';

const UPLOADS_ACCEPTED_FILE_TYPES = ['.svg', '.png', '.jpg', '.jpeg', '.gif', '.pdf'];
// Types remain the same as in original
type TBaseClassification = {
  caseClassificationId: string;
  name: string;
  caseType: string;
  aLlowRegarding: boolean | null;
};

type TSubClassification = TBaseClassification;

type TParentClassification = TBaseClassification & {
  isParent: true;
  subClassifications: TSubClassification[];
};

type TNonParentClassification = TBaseClassification & {
  isParent: false;
  subClassifications: null;
};

type TCaseClassificationResponseType = {
  CaseClassification: (TParentClassification | TNonParentClassification)[];
};

type TRegardingOption = {
  name: string;
  recordId: string;
  objectTypeCode: string;
};

type TRegardingOptions = TRegardingOption[];

type TRegardingOptionsResponse = {
  RegardingDetails: TRegardingOptions;
};

const LEASE_TERMINATION_DATES = [
  { code: '01-01-2024', label: 'January 2024', value: '417' },
  { code: '01-02-2024', label: 'February 2024', value: '418' },
  { code: '01-03-2024', label: 'March 2024', value: '419' },
  { code: '01-04-2024', label: 'April 2024', value: '420' },
  { code: '01-05-2024', label: 'May 2024', value: '421' },
  { code: '01-06-2024', label: 'June 2024', value: '422' },
  { code: '01-07-2024', label: 'July 2024', value: '423' },
  { code: '01-08-2024', label: 'August 2024', value: '424' },
  { code: '01-09-2024', label: 'September 2024', value: '425' },
  { code: '01-10-2024', label: 'October 2024', value: '426' },
  { code: '01-11-2024', label: 'November 2024', value: '427' },
  { code: '01-12-2024', label: 'December 2024', value: '428' },
];

const emptySubquery: {
  caseSubClassifications: TSubClassification[];
  otherSubqueryId: string | undefined;
} = {
  caseSubClassifications: [],
  otherSubqueryId: undefined,
};

function CreateCase() {
  const currentUser = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCaseClassifications, setIsLoadingCaseClassifications] = useState(true);
  const [isLoadingRegardingOptions, setIsLoadingRegardingOptions] = useState(false);
  const [files, setFiles] = useState<TNewDocumentUpload<697>[]>([]);
  const [isPrepopulated, setIsPrepopulated] = useState(false);

  const [caseClassifications, setCaseClassifications] = useState<TCaseClassificationResponseType['CaseClassification']>([]);

  const [regardingOptions, setRegardingOptions] = useState<TRegardingOptions>([]);
  const [caseType, setCaseType] = useState<string | null>(null);
  const [allowRegarding, setAllowRegarding] = useState<boolean | null>(null);

  const form = useForm({
    defaultValues: {
      CaseClassificationId: '',
      SubClassificationId: '',
      NoticeMonth: '',
      regardingId: '',
      Subject: '',
      Description: '',
      ClassificationOtherInput: '',
      SubClassificationOtherInput: '',
    },
  });

  const { watch, setValue } = form;
  const CaseClassificationId = watch('CaseClassificationId');
  const subClassificationId = watch('SubClassificationId');

  const { caseSubClassifications, otherSubqueryId } = useMemo(() => {
    if (!CaseClassificationId) {
      return emptySubquery;
    }
    const selectedCase = caseClassifications.find((el) => el.caseClassificationId === CaseClassificationId);

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
  }, [CaseClassificationId, caseClassifications]);

  useEffect(() => {
    const fetchCaseClassifications = async () => {
      try {
        setIsLoadingCaseClassifications(true);
        if (!currentUser) return;

        const response: IApiResponse<TCaseClassificationResponseType> = await API.post(EXECUTE_REQUEST_PATH, {
          entityName: 'Cases',
          requestName: 'RetrieveCaseClassifications',
          inputParamters: {
            UserType: currentUser?.supplierId ? 'Supplier' : 'Employee',
            UserId: currentUser?.supplierId || currentUser.recordId,
          },
        });

        if (!response.isSuccess) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: response?.clientMessage,
          });
          return;
        }

        setCaseClassifications(response?.CaseClassification);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Error fetching case classifications',
        });
      } finally {
        setIsLoadingCaseClassifications(false);
      }
    };

    fetchCaseClassifications();
  }, [currentUser]);

  useEffect(() => {
    setAllowRegarding(null);
    setCaseType(null);

    if (!currentUser || !CaseClassificationId) return;

    const selectedCase = caseClassifications.find((el) => el.caseClassificationId === CaseClassificationId);

    if (selectedCase) {
      setAllowRegarding(selectedCase.aLlowRegarding);
      setCaseType(selectedCase.caseType);
    }

    const getRegardingOptions = async () => {
      try {
        setIsLoadingRegardingOptions(true);

        const response: IApiResponse<TRegardingOptionsResponse> = await API.post(EXECUTE_REQUEST_PATH, {
          entityName: 'Cases',
          requestName: 'RetrieveCaseRegardingReq',
          inputParamters: {
            RegardingType: selectedCase?.caseClassificationId,
            UserId: currentUser?.supplierId || currentUser.recordId,
            UserType: currentUser.relatedObjectIdObjectTypeCode,
          },
        });

        setRegardingOptions(response.RegardingDetails);

        if (response.RegardingDetails.length === 1) {
          setValue('regardingId', response.RegardingDetails[0].recordId);
        }
      } catch (error) {
        console.error('Error getting regarding options:', error);
      } finally {
        setIsLoadingRegardingOptions(false);
      }
    };

    if (selectedCase) {
      getRegardingOptions();
    }
  }, [CaseClassificationId, currentUser, setValue]);

  const onSubmit = async (data: Record<string, string>) => {
    try {
      if (!currentUser) return;

      setIsSubmitting(true);

      let regardingIdValue;
      let selectedRegarding;

      if (regardingOptions.length === 1) {
        regardingIdValue = regardingOptions[0].recordId;
        selectedRegarding = regardingOptions[0];
      } else if (regardingOptions.length > 1) {
        selectedRegarding = regardingOptions.find((el) => el.recordId === data.regardingId);
        regardingIdValue = selectedRegarding?.recordId;
      }

      const response = await API.post(EXECUTE_REQUEST_PATH, {
        entityName: 'Cases',
        requestName: 'UpsertRecordReq',
        inputParamters: {
          Entity: {
            CaseClassificationId: data.CaseClassificationId,
            Subject: data.Subject,
            Description: data.Description,
            NoticeMonth: data.NoticeMonth,
            regardingId: regardingIdValue,
            regardingIdObjectTypeCode: selectedRegarding?.objectTypeCode,
            CustomerId: currentUser?.supplierId || currentUser.recordId,
            CustomerIdObjectTypeCode: currentUser?.relatedObjectIdObjectTypeCode || 'Employee',
            ChannelId: '681',
            CasesStatusId: '307',
            SubClassificationId: data.SubClassificationId,
            OtherReason: data.ClassificationOtherInput ?? data.SubClassificationOtherInput,
          },
          Documents: files,
        },
      });

      toast({
        title: 'Success',
        description: response?.clientMessage || 'Case Created Successfully',
      });

      navigate(URLS.CASES);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create case',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (acceptedFiles: File[]) => {
    const b64filesPromises = acceptedFiles.map(
      (file) =>
        new Promise<TNewDocumentUpload<697>>((resolve) => {
          UTILS.convertFileToBase64(file).then((b64) => {
            resolve({
              id: UTILS.getId().toString(),
              FileName: file.name,
              FileExtention: file.name.split('.').pop() || '',
              DocumentTypeId: 697,
              FileContent: b64.split('base64,')[1],
            });
          });
        })
    );

    const b64files = await Promise.all(b64filesPromises);
    setFiles((current) => [...current, ...b64files]);
  };

  return (
    <>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Case</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={() => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input disabled placeholder={currentUser?.name} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={() => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input disabled placeholder={currentUser?.email} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="CaseClassificationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Query</FormLabel>
                      <Select disabled={isPrepopulated} onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select query" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {caseClassifications
                            .filter((el) => el.caseClassificationId !== EMPTY_GUID)
                            .map((el) => (
                              <SelectItem key={el.caseClassificationId} value={el.caseClassificationId}>
                                {el.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Continue with other form fields... */}
                {/* I'll continue with the rest of the form fields in the next part */}

                {caseType === 'Termination' && (
                  <FormField
                    control={form.control}
                    name="NoticeMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notice Month</FormLabel>
                        <Select disabled={isPrepopulated} onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select date" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredDates.map((date) => (
                              <SelectItem key={date.value} value={date.value}>
                                {date.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Other Query Input */}
                {caseType === 'Other' && (
                  <FormField
                    control={form.control}
                    name="ClassificationOtherInput"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specify other query</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter other query details" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Sub-Classification Select */}
                {caseSubClassifications.length > 0 && (
                  <FormField
                    control={form.control}
                    name="SubClassificationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub-Query</FormLabel>
                        <Select disabled={isPrepopulated} onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sub-query" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {caseSubClassifications
                              .filter((el) => el.caseClassificationId !== EMPTY_GUID)
                              .map((el) => (
                                <SelectItem key={el.caseClassificationId} value={el.caseClassificationId}>
                                  {el.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Other Sub-Classification Input */}
                {caseSubClassifications.length > 0 && subClassificationId === otherSubqueryId && (
                  <FormField
                    control={form.control}
                    name="SubClassificationOtherInput"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specify other sub-classification</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter other sub-classification details" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Regarding Options */}
                {allowRegarding && regardingOptions.length > 1 && (
                  <FormField
                    control={form.control}
                    name="regardingId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Regarding</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
                                disabled={isPrepopulated || !CaseClassificationId}
                              >
                                {field.value
                                  ? regardingOptions.find((option) => option.recordId === field.value)?.name
                                  : 'Select regarding'}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search..." />
                              <CommandEmpty>No options found.</CommandEmpty>
                              <CommandGroup>
                                {regardingOptions
                                  .filter((el) => el.recordId !== EMPTY_GUID)
                                  .map((option) => (
                                    <CommandItem
                                      key={option.recordId}
                                      value={option.recordId}
                                      onSelect={() => {
                                        form.setValue('regardingId', option.recordId);
                                      }}
                                    >
                                      <Check
                                        className={cn('mr-2 h-4 w-4', option.recordId === field.value ? 'opacity-100' : 'opacity-0')}
                                      />
                                      {option.name}
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Single Regarding Option */}
                {allowRegarding && regardingOptions.length === 1 && (
                  <FormField
                    control={form.control}
                    name="regardingId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Regarding</FormLabel>
                        <FormControl>
                          <Input disabled value={regardingOptions[0].name} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                {/* Subject Field */}
                <FormField
                  control={form.control}
                  name="Subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter your subject" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description Field */}
                <FormField
                  control={form.control}
                  name="Description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter description" className="min-h-[100px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* File Upload Section */}
                <div className="space-y-4">
                  {/* Uploaded Files Display */}
                  {files.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {files.map(({ id, FileName }) => (
                        <div key={id} className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-lg">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{FileName}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setFiles((current) => current.filter((file) => file.id !== id));
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dropzone */}
                  <div className="grid w-full max-w-md gap-1.5">
                    <Label htmlFor="file-upload">Attachments</Label>
                    <div
                      className={cn(
                        'border-2 border-dashed rounded-lg p-8',
                        'hover:border-primary/50 transition-colors duration-200',
                        'flex flex-col items-center justify-center gap-4',
                        'cursor-pointer'
                      )}
                      {...useDropzone({
                        onDrop: handleFileUpload,
                        accept: UPLOADS_ACCEPTED_FILE_TYPES.reduce((acc, curr) => ({ ...acc, [curr]: [] }), {}),
                      }).getRootProps()}
                    >
                      <input
                        {...useDropzone({
                          onDrop: handleFileUpload,
                        }).getInputProps()}
                      />
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <div className="text-center space-y-1">
                        <p className="text-sm font-medium">Drop files here or click to upload</p>
                        <p className="text-xs text-muted-foreground">Supported files: {UPLOADS_ACCEPTED_FILE_TYPES.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full sm:w-auto flex items-center rounded-lg hover:bg-[#0086C9] hover:text-white border-2 px-[14px] py-[10px] bg-[#0086C9] text-white shadow-sm justify-center gap-2 border-[#ffffff1f]"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default CreateCase;

// import React, { useEffect, useMemo, useState } from "react";
// import { useForm } from "react-hook-form";
// import { useLocation, useNavigate } from "react-router-dom";

// // Previous imports remain the same...
// // Adding new imports for file handling
// import { FileText, Loader2, Upload, X } from "lucide-react";
// import { useDropzone } from "react-dropzone";

// function CreateCase() {
//   // Previous state and hooks remain the same...

//   return (
//     <>
//       <div className="container mx-auto py-8">
//         <Card>
//           <CardHeader>
//             <CardTitle>Create Case</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Form {...form}>
//               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//                 {/* Previous form fields remain the same... */}

//                 {/* Notice Month Select for Termination Cases */}
//                 {caseType === "Termination" && (
//                   <FormField
//                     control={form.control}
//                     name="NoticeMonth"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Notice Month</FormLabel>
//                         <Select
//                           disabled={isPrepopulated}
//                           onValueChange={field.onChange}
//                           value={field.value}
//                         >
//                           <FormControl>
//                             <SelectTrigger>
//                               <SelectValue placeholder="Select date" />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             {filteredDates.map((date) => (
//                               <SelectItem
//                                 key={date.value}
//                                 value={date.value}
//                               >
//                                 {date.label}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 )}

//                 {/* Other Query Input */}
//                 {caseType === "Other" && (
//                   <FormField
//                     control={form.control}
//                     name="ClassificationOtherInput"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Specify other query</FormLabel>
//                         <FormControl>
//                           <Input {...field} placeholder="Enter other query details" />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 )}

//                 {/* Sub-Classification Select */}
//                 {caseSubClassifications.length > 0 && (
//                   <FormField
//                     control={form.control}
//                     name="SubClassificationId"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Sub-Query</FormLabel>
//                         <Select
//                           disabled={isPrepopulated}
//                           onValueChange={field.onChange}
//                           value={field.value}
//                         >
//                           <FormControl>
//                             <SelectTrigger>
//                               <SelectValue placeholder="Select sub-query" />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             {caseSubClassifications
//                               .filter(el => el.caseClassificationId !== EMPTY_GUID)
//                               .map(el => (
//                                 <SelectItem
//                                   key={el.caseClassificationId}
//                                   value={el.caseClassificationId}
//                                 >
//                                   {el.name}
//                                 </SelectItem>
//                               ))}
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 )}

//                 {/* Other Sub-Classification Input */}
//                 {caseSubClassifications.length > 0 &&
//                   subClassificationId === otherSubqueryId && (
//                     <FormField
//                       control={form.control}
//                       name="SubClassificationOtherInput"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Specify other sub-classification</FormLabel>
//                           <FormControl>
//                             <Input {...field} placeholder="Enter other sub-classification details" />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                 )}

//                 {/* Regarding Options */}
//                 {allowRegarding && regardingOptions.length > 1 && (
//                   <FormField
//                     control={form.control}
//                     name="regardingId"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Regarding</FormLabel>
//                         <Popover>
//                           <PopoverTrigger asChild>
//                             <FormControl>
//                               <Button
//                                 variant="outline"
//                                 role="combobox"
//                                 className={cn(
//                                   "w-full justify-between",
//                                   !field.value && "text-muted-foreground"
//                                 )}
//                                 disabled={isPrepopulated || !CaseClassificationId}
//                               >
//                                 {field.value
//                                   ? regardingOptions.find(
//                                       option => option.recordId === field.value
//                                     )?.name
//                                   : "Select regarding"}
//                                 <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                               </Button>
//                             </FormControl>
//                           </PopoverTrigger>
//                           <PopoverContent className="w-full p-0">
//                             <Command>
//                               <CommandInput placeholder="Search..." />
//                               <CommandEmpty>No options found.</CommandEmpty>
//                               <CommandGroup>
//                                 {regardingOptions
//                                   .filter(el => el.recordId !== EMPTY_GUID)
//                                   .map(option => (
//                                     <CommandItem
//                                       key={option.recordId}
//                                       value={option.recordId}
//                                       onSelect={() => {
//                                         form.setValue("regardingId", option.recordId);
//                                       }}
//                                     >
//                                       <Check
//                                         className={cn(
//                                           "mr-2 h-4 w-4",
//                                           option.recordId === field.value
//                                             ? "opacity-100"
//                                             : "opacity-0"
//                                         )}
//                                       />
//                                       {option.name}
//                                     </CommandItem>
//                                   ))}
//                               </CommandGroup>
//                             </Command>
//                           </PopoverContent>
//                         </Popover>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 )}

//                 {/* Single Regarding Option */}
//                 {allowRegarding && regardingOptions.length === 1 && (
//                   <FormField
//                     control={form.control}
//                     name="regardingId"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Regarding</FormLabel>
//                         <FormControl>
//                           <Input
//                             disabled
//                             value={regardingOptions[0].name}
//                           />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                 )}

//                 {/* Subject Field */}
//                 <FormField
//                   control={form.control}
//                   name="Subject"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Subject</FormLabel>
//                       <FormControl>
//                         <Input {...field} placeholder="Enter your subject" />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 {/* Description Field */}
//                 <FormField
//                   control={form.control}
//                   name="Description"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Description</FormLabel>
//                       <FormControl>
//                         <Textarea
//                           {...field}
//                           placeholder="Enter description"
//                           className="min-h-[100px]"
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 {/* File Upload Section */}
//                 <div className="space-y-4">
//                   {/* Uploaded Files Display */}
//                   {files.length > 0 && (
//                     <div className="flex flex-wrap gap-2">
//                       {files.map(({ id, FileName }) => (
//                         <div
//                           key={id}
//                           className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-lg"
//                         >
//                           <FileText className="h-4 w-4" />
//                           <span className="text-sm">{FileName}</span>
//                           <Button
//                             type="button"
//                             variant="ghost"
//                             size="sm"
//                             className="h-8 w-8 p-0"
//                             onClick={() => {
//                               setFiles(current =>
//                                 current.filter(file => file.id !== id)
//                               );
//                             }}
//                           >
//                             <X className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       ))}
//                     </div>
//                   )}

//                   {/* Dropzone */}
//                   <div className="grid w-full max-w-md gap-1.5">
//                     <Label htmlFor="file-upload">Attachments</Label>
//                     <div
//                       className={cn(
//                         "border-2 border-dashed rounded-lg p-8",
//                         "hover:border-primary/50 transition-colors duration-200",
//                         "flex flex-col items-center justify-center gap-4",
//                         "cursor-pointer"
//                       )}
//                       {...useDropzone({
//                         onDrop: handleFileUpload,
//                         accept: UPLOADS_ACCEPTED_FILE_TYPES.reduce(
//                           (acc, curr) => ({ ...acc, [curr]: [] }),
//                           {}
//                         ),
//                       }).getRootProps()}
//                     >
//                       <input {...useDropzone({
//                         onDrop: handleFileUpload
//                       }).getInputProps()} />
//                       <Upload className="h-8 w-8 text-muted-foreground" />
//                       <div className="text-center space-y-1">
//                         <p className="text-sm font-medium">
//                           Drop files here or click to upload
//                         </p>
//                         <p className="text-xs text-muted-foreground">
//                           Supported files: {UPLOADS_ACCEPTED_FILE_TYPES.join(", ")}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Submit Button */}
//                 <Button
//                   type="submit"
//                   className="w-full"
//                   disabled={isSubmitting}
//                 >
//                   {isSubmitting && (
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   )}
//                   Submit
//                 </Button>
//               </form>
//             </Form>
//           </CardContent>
//         </Card>
//       </div>
//     </>
//   );
// }

// export default CreateCase;
