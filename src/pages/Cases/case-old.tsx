import React, { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import FormGridItem from '../ui/v2/components/FormGridItem';
import TextField from '../ui/v2/components/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Close } from '@mui/icons-material';
import DescriptionIcon from '@mui/icons-material/Description';
import useCurrentUser from '../ui/v2/hooks/useCurrentUser';
import { useForm } from 'react-hook-form';
import { UPLOADS_ACCEPTED_FILE_TYPES, EMPTY_ARRAY, EMPTY_GUID } from '../ui/v2/constants';
import TextArea from '../ui/v2/components/TextArea';
import { UTILS } from '../utils';
import FileDropzone from '../ui/v2/components/FileDropzone';
import Button from '@mui/material/Button';
import CircleLoader from '../ui/v2/components/CircleLoader';
import { showErrorAlert, showSuccessAlert } from '../components/Notify';
import Select from '../ui/v2/components/Select';
import { useLocation, useNavigate } from 'react-router-dom';
import { URLS } from '../_config';
import Header from './student/components/header';
import { TNewDocumentUpload } from '../ui/v2/types/TDocumentUpload';
import { Autocomplete } from '@mui/material';
import {
  useCasesRetrieveCaseClassificationsMutation,
  useCasesRetrieveCaseRegardingReqMutation,
  useCasesUpsertRecordReqMutation,
} from '@/services/apiService';

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

// WARN Date format dd-mm-yyyy
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

const emptySubquery: {
  caseSubClassifications: TSubClassification[];
  otherSubqueryId: string | undefined;
} = {
  caseSubClassifications: [],
  otherSubqueryId: undefined,
};

function CreateCase_TEMPORARY() {
  const currentUser = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoadingCaseClassifications, setIsLoadingCaseClassifications] = React.useState(true);
  const [isLoadingRegardingOptions, setIsLoadingRegardingOptions] = useState(false);
  const [invoiceDisputeGuid, setInvoiceDisputeGuid] = React.useState<string>('');
  const { handleSubmit, register, watch, setValue } = useForm();
  const isLoading = !currentUser || isLoadingCaseClassifications;
  const [regardingOptions, setRegardingOptions] = React.useState<TRegardingOptions>([]);
  const [caseClassifications, setCaseClassifications] = React.useState<TCaseClassificationResponseType['CaseClassification']>([]);
  const [caseType, setCaseType] = useState<string | null>(null);
  const [allowRegarding, setAllowRegarding] = useState<boolean | null>(null);
  const [otherCaseClassificationGuid, setOtherCaseClassificationGuid] = useState<string>();
  const [leaseTerminationCaseClassificationGuid, setLeaseTerminationCaseCaseClassificationGuid] = useState<string>();

  const [casesRetrieveCaseRegardingReq] = useCasesRetrieveCaseRegardingReqMutation();
  const [casesRetrieveCaseClassifications] = useCasesRetrieveCaseClassificationsMutation();
  const [casesUpsertRecordReq] = useCasesUpsertRecordReqMutation();

  const filteredDates = UTILS.getDatesFromNextMonth(LEASE_TERMINATION_DATES);

  useEffect(() => {
    const fetchCaseClassifications = async () => {
      try {
        setIsLoadingCaseClassifications(true);
        if (!currentUser) return;

        const response = await casesRetrieveCaseClassifications({
          UserType: currentUser?.supplierId ? 'Supplier' : 'Employee',
          UserId: currentUser?.supplierId || currentUser.recordId,
        }).unwrap();

        if (!response.isSuccess) {
          showErrorAlert(response?.clientMessage);
        }

        setCaseClassifications(response.CaseClassification);
        setOtherCaseClassificationGuid(() => {
          const otherClassification = response.CaseClassification.find((el) => el.name === 'other');
          return otherClassification?.caseClassificationId;
        });
        setLeaseTerminationCaseCaseClassificationGuid(() => {
          const otherClassification = response.CaseClassification.find((el) => el.name === 'Termination of Lease');
          return otherClassification?.caseClassificationId;
        });
      } catch (e) {
        showErrorAlert('Error fetching case classifications');
      } finally {
        setIsLoadingCaseClassifications(false);
      }
    };
    fetchCaseClassifications();
  }, [currentUser]);

  const CaseClassificationId = watch('CaseClassificationId');

  // [Previous useMemo logic remains unchanged]
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
  }, [CaseClassificationId]);

  useEffect(() => {
    setAllowRegarding(null);
    setCaseType(null);
    if (!currentUser) return;

    const selectedCase = caseClassifications.find((el) => el.caseClassificationId === CaseClassificationId);

    if (selectedCase !== undefined) {
      setAllowRegarding(selectedCase.aLlowRegarding);
      setCaseType(selectedCase.caseType);
    }

    const getRegardingOptions = async () => {
      try {
        setIsLoadingRegardingOptions(true);
        const response = await casesRetrieveCaseRegardingReq({
          RegardingType: selectedCase?.caseClassificationId,
          UserId: currentUser?.supplierId || currentUser.recordId,
          UserType: currentUser.relatedObjectIdObjectTypeCode,
        }).unwrap();

        setRegardingOptions(response.RegardingDetails);
        if (response.RegardingDetails.length === 1) {
          setValue('regardingId', regardingOptions[0].recordId);
        }
      } catch (e) {
        console.error('Error: getting getRegardingOptions');
      } finally {
        setIsLoadingRegardingOptions(false);
      }
    };

    if (selectedCase != undefined) {
      getRegardingOptions();
    }
  }, [CaseClassificationId, currentUser]);

  const onSubmit = async (data: Record<string, string>) => {
    const {
      Description,
      CaseClassificationId,
      Subject,
      NoticeMonth,
      regardingId,
      SubClassificationId,
      ClassificationOtherInput,
      SubClassificationOtherInput,
    } = data;

    try {
      if (!currentUser) return;
      setIsSubmitting(true);

      let regardingIdValue;
      let selectedRegarding;
      if (regardingOptions.length === 1) {
        regardingIdValue = regardingOptions[0].recordId;
        setValue('regardingId', regardingOptions[0].recordId);
        selectedRegarding = regardingOptions.find((el) => el.recordId === regardingIdValue);
      } else if (regardingOptions.length > 1) {
        selectedRegarding = regardingOptions.find((el) => el.recordId === regardingId);
        regardingIdValue = selectedRegarding.recordId;
      }

      const caseCreatedResponse = await casesUpsertRecordReq({
        Entity: {
          CaseClassificationId,
          Subject,
          Description,
          NoticeMonth,
          regardingId: regardingIdValue,
          regardingIdObjectTypeCode: selectedRegarding?.objectTypeCode,
          CustomerId: currentUser?.supplierId || currentUser.recordId,
          CustomerIdObjectTypeCode: currentUser?.relatedObjectIdObjectTypeCode || 'Employee',
          ChannelId: '681',
          CasesStatusId: '307',
          SubClassificationId: SubClassificationId,
          OtherReason: ClassificationOtherInput ?? SubClassificationOtherInput,
        },
        Documents: files,
      }).unwrap();

      caseCreatedResponse?.clientMessage
        ? showSuccessAlert(caseCreatedResponse?.clientMessage).then(() => navigate(URLS.CASES))
        : showSuccessAlert('Case Created Successfully').then(() => navigate(URLS.CASES));
    } catch (e) {
      console.error('🔴 error', e);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <Header />
      <Box sx={{ pb: 12, pt: 8, px: { md: 10, xs: 2 } }}>
        <Grid component="form" onSubmit={handleSubmit(onSubmit, (e) => console.warn(e))} container pt={2}>
          <FormGridItem xs={12} md={12}>
            <Typography variant="h4">Create Case</Typography>
          </FormGridItem>

          <FormGridItem>
            <TextField label="Name" disabled size="small" placeholder={currentUser?.name} />
          </FormGridItem>

          <FormGridItem>
            <TextField label="Email" disabled size="small" placeholder={currentUser?.email} />
          </FormGridItem>

          <FormGridItem xs={12} md={12}>
            <Select
              disabled={isPrepopulated}
              {...register('CaseClassificationId', {
                required: 'This field is required',
              })}
              label="Query"
              options={caseClassifications
                .filter((el) => el.caseClassificationId !== EMPTY_GUID)
                .map((el) => ({
                  label: el.name,
                  value: el.caseClassificationId,
                }))}
              size="small"
              placeholder="Select query"
            />
          </FormGridItem>

          {caseType === 'Termination' && (
            <FormGridItem xs={12} md={12}>
              <Select
                disabled={isPrepopulated}
                {...register('NoticeMonth')}
                label="Notice Month"
                options={filteredDates.map((el: { value: number; label: string; code: string }) => ({
                  label: el.label,
                  value: el.value,
                }))}
                size="small"
                placeholder="Select date"
              />
            </FormGridItem>
          )}

          {caseType === 'Other' && (
            <FormGridItem xs={12} md={12}>
              <TextField
                label="Specify other query"
                size="small"
                fullWidth
                {...register('ClassificationOtherInput', {
                  shouldUnregister: true,
                })}
              />
            </FormGridItem>
          )}

          {caseSubClassifications.length > 0 && (
            <FormGridItem xs={12} md={12}>
              <Select
                disabled={isPrepopulated}
                {...register('SubClassificationId', {
                  required: 'This field is required',
                })}
                label="Sub-Query"
                options={caseSubClassifications
                  .filter((el) => el.caseClassificationId !== EMPTY_GUID)
                  .map((el) => ({
                    label: el.name,
                    value: el.caseClassificationId,
                  }))}
                size="small"
                placeholder="Select sub-query"
              />
            </FormGridItem>
          )}

          {caseSubClassifications.length > 0 && subClassificationId === otherSubqueryId && (
            <FormGridItem xs={12} md={12}>
              <TextField
                label="Specify other sub-classification"
                size="small"
                fullWidth
                {...register('SubClassificationOtherInput', {
                  shouldUnregister: true,
                })}
              />
            </FormGridItem>
          )}

          {allowRegarding && regardingOptions.length > 1 && (
            <FormGridItem xs={12} md={12}>
              <Autocomplete
                fullWidth
                disabled={(isPrepopulated && regardingOptions.length > 0) || !CaseClassificationId || CaseClassificationId === EMPTY_GUID}
                {...register('regardingId', {
                  required: 'This field is required',
                })}
                options={
                  regardingOptions
                    ?.filter?.((el) => el.recordId !== EMPTY_GUID)
                    .map((el) => ({
                      label: el.name,
                      value: el.recordId,
                    })) || EMPTY_ARRAY
                }
                size="small"
                getOptionLabel={(option) => option.label || ''}
                onChange={(event, selectedOption) => {
                  // Update the form field value with selected option's value
                  setValue('regardingId', selectedOption?.value || '');
                }}
                renderInput={(params) => <TextField {...params} label="Regarding" />}
              />
            </FormGridItem>
          )}

          {allowRegarding && regardingOptions.length == 1 && (
            <FormGridItem xs={12} md={12}>
              <TextField
                label="Regarding"
                size="small"
                value={regardingOptions[0].name}
                fullWidth
                {...register('regardingId', {
                  shouldUnregister: true,
                })}
                disabled
              />
            </FormGridItem>
          )}

          <FormGridItem md={12}>
            <TextField
              label="Subject"
              {...register('Subject', { required: 'This field is required' })}
              size="small"
              placeholder="Enter your subject"
            />
          </FormGridItem>

          <FormGridItem md={12}>
            <TextArea
              {...register('Description', {
                required: 'This field is required',
              })}
            />
          </FormGridItem>

          <FormGridItem md={12}>
            {files.map(({ id, FileName }) => (
              <Box
                key={id}
                sx={{
                  display: 'inline-flex',
                  maxWidth: 300,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mr: 1,
                  mb: 1,
                  px: 1,
                  border: '1px solid #aaa',
                  backgroundColor: '#f5f5f5',
                  borderRadius: 2,
                }}
              >
                <DescriptionIcon color="info" />
                <Typography noWrap sx={{ fontSize: 14 }}>
                  {FileName}
                </Typography>
                <IconButton
                  color="error"
                  onClick={() => {
                    setFiles((current) => current.filter((el) => el.id !== id));
                  }}
                >
                  <Close />
                </IconButton>
              </Box>
            ))}
          </FormGridItem>

          <FormGridItem md={7}>
            <FileDropzone
              acceptedFiles={{ 'plain/text': UPLOADS_ACCEPTED_FILE_TYPES }}
              onDrop={(validFiles) => {
                const b64filesPromises = validFiles.map(async (file) => {
                  return new Promise<TNewDocumentUpload<697>>((resolve) => {
                    UTILS.convertFileToBase64(file).then((b64) => {
                      resolve({
                        id: UTILS.getId().toString(),
                        FileName: file.name,
                        FileExtention: file.name.split('.').pop() || '',
                        DocumentTypeId: 697,
                        FileContent: b64.split('base64,')[1],
                      });
                    });
                  });
                });
                Promise.all(b64filesPromises).then((b64files) => {
                  setFiles((current) => [...current, ...b64files]);
                });
              }}
            />
          </FormGridItem>

          <FormGridItem>
            <Button variant="contained" fullWidth type="submit" disabled={isSubmitting} startIcon={isSubmitting && <CircleLoader />}>
              Submit
            </Button>
          </FormGridItem>
        </Grid>
      </Box>
    </>
  );
}

export default CreateCase_TEMPORARY;
