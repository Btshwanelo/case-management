import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Info, Lock, LockOpen, PhoneCall, SaveIcon, SaveOffIcon, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  useBankAccountUpsertRecordReqMutation,
  useExecuteRequest1Mutation,
  useSupplierConfirmOTPExecuteRequestMutation,
  useSupplierGeneratOTPExecuteRequestMutation,
} from '@/services/apiService';

import FileUploadInput from '@/components/FileUploadInput';
import OTPModal from './OTPModal';
import { Spinner } from '@/components/ui/spinner';
import { showSuccessToast } from '@/components/SuccessToast';
import { useSearchParams } from 'react-router-dom';
import StepperItem from '@/pages/OnBoarding/Components/Steppertem';
import { showErrorToast } from '@/components/ErrorToast ';
import { useGenericOTPReqMutation } from '@/services/genericService';
import useCurrentUser from '@/hooks/useCurrentUser';
import { useDispatch } from 'react-redux';
import { clearAuthData } from '@/slices/authSlice';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const bankingDetailsSchema = z.object({
  Name: z.string().min(1, 'Bank name is required'),
  BranchNo: z.string().min(3, 'Branch number must be at least 3 digits').regex(/^\d+$/, 'Branch number must contain only numbers'),
  AccountHolder: z.string().min(1, 'Account holder name is required'),
  AccountNo: z.string().min(1, 'Account number is required'),
  AccountTypeId: z.string().min(1, 'Account type is required'),
  ProofOfBanking: z.any().refine(
    (data) => {
      // Check if it's a valid file object with either FileName or RecordId
      if (!data || typeof data !== 'object') return false;
      return !!(data.FileName || data.RecordId);
    },
    {
      message: 'Proof of banking document is required',
    }
  ),
});

const BANKING_ACCOUNT_TYPES_CODE_MAP = {
  317: 'Savings',
  316: 'Checking',
  315: 'Current',
};

enum UploadDocumentType {
  CoverImage = 889,
  NonCoverImage = 893,
  ProofOfBanking = 905,
  ProofOfAddress = 904,
  IDDocument = 886,
  CIPCDocument = 887,
  ProofOfRegistration = 950,
  Selfie = 951,
}

const BANKING_ACCOUNT_TYPE_OPTIONS = Object.entries(BANKING_ACCOUNT_TYPES_CODE_MAP).map(([value, label]) => ({ value, label }));

const BankingDetailsForm = ({ userDetails, bankDetails, setNextStep }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [isBranchCodeDisabled, setIsBranchCodeDisabled] = useState(true);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const tag = searchParams.get('tag');
  const userDetail = useCurrentUser();
  const dispatch = useDispatch();
  const [bankAccountUpsertRecordReq, { isLoading, isSuccess, isError }] = useBankAccountUpsertRecordReqMutation();
  const [
    supplierGeneratOTPExecuteRequest,
    { isLoading: isLoadingOTP, isSuccess: isSuccessGenerate, isError: isErrorGenerate, error: errorGenerate },
  ] = useSupplierGeneratOTPExecuteRequestMutation();
  const [
    supplierConfirmOTPExecuteRequest,
    { isLoading: isLoadingConfirm, isSuccess: isSuccessConfirm, isError: isErrorConfirm, error: errorConfirm },
  ] = useSupplierConfirmOTPExecuteRequestMutation();
  const [GetBankingDetails, getBankingDetailsProps] = useExecuteRequest1Mutation();

  // Initialize form with proper default values
  const getInitialProofOfBanking = () => {
    if (bankDetails?.proofOfBankingFileName) {
      return {
        FileName: bankDetails.proofOfBankingFileName.fileName || '',
        DocumentTypeId: bankDetails.proofOfBankingFileName.documentTypeId || UploadDocumentType.ProofOfBanking,
        FileExtention: bankDetails.proofOfBankingFileName.fileExtention || '',
        FileContent: bankDetails.proofOfBankingFileName.fileContent || '',
        RecordId: bankDetails.proofOfBankingFileName.recordId || null,
      };
    }
    // Check if bankDetails has a different structure for the file
    if (bankDetails?.proofOfBankingRecordId) {
      return {
        RecordId: bankDetails.proofOfBankingRecordId,
        FileName: bankDetails.proofOfBankingFileName || 'Existing document',
      };
    }
    return {};
  };

  const form = useForm({
    resolver: zodResolver(bankingDetailsSchema),
    defaultValues: {
      Name: bankDetails?.bankName || '',
      BranchNo: bankDetails?.branchNo || '',
      AccountHolder: bankDetails?.accountHolder || '',
      AccountNo: bankDetails?.accountNo || '',
      AccountTypeId: bankDetails?.accountTypeId?.toString() || '',
      ProofOfBanking: getInitialProofOfBanking(),
    },
    mode: 'onSubmit', // Only validate on submit, not on every change
  });

  const onSubmit = useCallback(
    async (data) => {
      // Debug logging
      console.log('Form data on submit:', data);
      console.log('ProofOfBanking value:', data.ProofOfBanking);

      // Check if the file data is properly structured
      if (!data.ProofOfBanking || (!data.ProofOfBanking.FileName && !data.ProofOfBanking.RecordId)) {
        showErrorToast('Please upload proof of banking document');
        return;
      }

      const rest = {
        FileName: data?.ProofOfBanking.FileName,
        DocumentTypeId: data?.ProofOfBanking.DocumentTypeId || UploadDocumentType.ProofOfBanking,
        FileExtention: data?.ProofOfBanking.FileExtention,
        FileContent: data?.ProofOfBanking.FileContent,
        RelatedObjectIdObjectTypeCode: 'Supplier',
        RelatedObjectId: userDetails.accomodationProviderId,
      };

      const RecordId = data?.ProofOfBanking?.RecordId;

      const requestBody = {
        entityName: 'BankAccount',
        requestName: 'UpsertRecordReq',
        inputParamters: {
          Documents: RecordId ? [{ EntityDocumentId: RecordId, ...rest }] : [rest],
          Entity: {
            Name: data.Name,
            BranchNo: data.BranchNo,
            AccountHolder: data.AccountHolder,
            AccountNo: data.AccountNo,
            AccountTypeId: data.AccountTypeId,
            RelatedObjectId: userDetails.accomodationProviderId,
            RelatedObjectIdObjectTypeCode: 'Supplier',
          },
        },
      };

      bankAccountUpsertRecordReq({
        body: requestBody,
      });
    },
    [bankDetails?.bankAccountId, bankAccountUpsertRecordReq, userDetails.accomodationProviderId]
  );
  // const handleRequestOTP = useCallback(() => {
  //   setShowOtpModal(true);
  //   supplierGeneratOTPExecuteRequest({
  //     body: {
  //       entityName: 'Supplier',
  //       requestName: 'GeneratOTPExecuteRequest',
  //       RecordId: userDetails.accomodationProviderId,
  //     },
  //   });
  // }, [supplierGeneratOTPExecuteRequest, userDetails.accomodationProviderId]);

  // Constants that should be shared between modal and generate function
  const handleRequestOTP = () => {
    const OTP_EXPIRY_KEY = 'otpGenerateExpiry';
    const canGenerateNewOTP = () => {
      const savedExpiry = localStorage.getItem(OTP_EXPIRY_KEY);
      if (savedExpiry) {
        const expiryTime = parseInt(savedExpiry);
        if (expiryTime > Date.now()) {
          // If timer hasn't expired, return false
          return false;
        }
      }
      return true;
    };

    const setGenerateOTPTimer = () => {
      const TIMER_DURATION = 180; // 3 minutes in seconds
      const newExpiry = Date.now() + TIMER_DURATION * 1000;
      localStorage.setItem(OTP_EXPIRY_KEY, newExpiry.toString());
    };

    // Check if we can generate a new OTP
    // if (!canGenerateNewOTP()) {
    //   setShowOtpModal(true);
    //   return;
    // }

    // If we can generate new OTP, make the API call and set the timer

    setGenerateOTPTimer();
    supplierGeneratOTPExecuteRequest({
      body: {
        entityName: 'Supplier',
        requestName: 'GenericOTPExecuteRequest',
        RecordId: userDetails.supplierId,
        inputParamters: {
          OtpType: 1124, //bank OTP
        },
      },
    });
  };

  useEffect(() => {
    if (isSuccessGenerate) {
      setShowOtpModal(true);
    }
  }, [isSuccessGenerate]);

  const handleGetBankingDetailsOptions = () => {
    GetBankingDetails({
      body: {
        requestName: 'GetListOfBanks',
      },
    });
  };

  function maskMobile(mobile: any, options = {}) {
    const { showFirst = 3, showLast = 2, maskChar = '*' } = options;

    if (!mobile || mobile.length < showFirst + showLast + 1) return mobile;

    const cleanNumber = mobile.replace(/\D/g, '');
    const firstPart = cleanNumber.slice(0, showFirst);
    const lastPart = cleanNumber.slice(-showLast);
    const middleMask = maskChar.repeat(cleanNumber.length - showFirst - showLast);

    return `${firstPart}${middleMask}${lastPart}`;
  }

  useEffect(() => {
    if (isSuccessGenerate) {
      setShowOtpModal(true);
    }
  }, [isSuccessGenerate]);

  useEffect(() => {
    if (isErrorGenerate) {
      setShowOtpModal(false);
      showErrorToast(errorGenerate.data || 'Error generatting OTP');
    }
  }, [isErrorGenerate]);

  const handleOTPConfirm = useCallback(
    (otp) => {
      supplierConfirmOTPExecuteRequest({
        body: {
          entityName: 'Supplier',
          requestName: 'GenericConfirmOtp',
          recordId: userDetails.accomodationProviderId,
          inputParamters: {
            OTPInformation: {
              OTPNo: otp,
              email: userDetail.email,
              mobile: userDetail.mobile,
            },
          },
        },
      });
    },
    [supplierConfirmOTPExecuteRequest, userDetails.accomodationProviderId]
  );

  useEffect(() => {
    handleGetBankingDetailsOptions();
  }, []);

  useEffect(() => {
    if (isSuccessConfirm) {
      setIsLocked(false);
      setShowOtpModal(false);
    }
  }, [isSuccessConfirm]);

  useEffect(() => {
    if (isSuccess) {
      setIsLocked(true);
      if (tag != null) {
        showSuccessToast('Successfully updated banking details');
        setNextStep();
      } else {
        showSuccessToast('Successfully updated banking details');
        window.location.reload();
      }
    }
  }, [isSuccess, tag, setNextStep]);

  useEffect(() => {
    if (isError) {
      showErrorToast('Error updating banking details');
    }
  }, [isError]);

  useEffect(() => {
    if (isErrorConfirm && errorConfirm.errorData.IsLocked) {
      dispatch(clearAuthData());
    }
  }, [isErrorConfirm]);

  useEffect(() => {
    if (isErrorGenerate && errorGenerate.errorData.IsLocked) {
      showErrorToast(errorGenerate.data);
      dispatch(clearAuthData());
    }
  }, [isErrorGenerate]);

  const banks = getBankingDetailsProps?.data?.BankList?.bank;

  function findBankByName(banks, value) {
    const bank = banks?.find((bank) => bank.bankName === value);

    if (bank?.defaultCode === '' && isBranchCodeDisabled) {
      setIsBranchCodeDisabled(false);
    }
    if (bank?.defaultCode != '' && !isBranchCodeDisabled) {
      setIsBranchCodeDisabled(true);
    }
    return bank;
  }

  function isValidBranchCode(branchCode: string): boolean {
    return banks.some((bank) => bank.defaultCode && bank.defaultCode === branchCode);
  }

  const bankName = form.watch('Name');
  const selectedBank = findBankByName(banks, bankName);

  useEffect(() => {
    if (selectedBank?.defaultCode != '') {
      form.setValue('BranchNo', selectedBank?.defaultCode);
    } else if (selectedBank.defaultCode === '' && isValidBranchCode(form.getValues('BranchNo'))) {
      form.setValue('BranchNo', '');
    }
  }, [bankName]);

  useEffect(() => {
    const currentStep = searchParams.get('s');
    if (currentStep !== 'banking') {
      setSearchParams({ ...Object.fromEntries(searchParams), s: 'banking' });
    }
  }, []);

  const StatusBadge = ({ status, label }) => {
    const isSuccess = status === 'Success';
    const isFailed = status === 'Failed';
    const isPending = !status || (status !== 'Success' && status !== 'Failed');

    return (
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-gray-600">{label}:</span>
        <div
          className={`
          flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
          ${isSuccess ? 'bg-green-100 text-green-700' : isFailed ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}
        `}
        >
          {isSuccess && <CheckCircle2 className="h-3 w-3" />}
          {isFailed && <XCircle className="h-3 w-3" />}
          {isPending && <Info className="h-3 w-3" />}
          <span>{status || 'Pending'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="lg:col-span-9">
      <div className="space-y-6">
        <Card>
          {tag != null && (
            <div className="flex items-center w-full justify-center mt-3">
              {[1, 2, 3, 4].map((step, index) => (
                <StepperItem key={step} active={step <= 3} completed={step < 3} first={index === 0} last={index === 3} />
              ))}
            </div>
          )}
          <CardContent className="pt-6">
            {isLocked && (
              <Alert className="mb-6 bg-blue-50 border-blue-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                  <div>
                    <AlertDescription className="flex items-center gap-2 text-blue-600">
                      <Info className="h-4 w-4 text-blue-500" />
                      To make changes to this section you will need to authenticate
                      <br />
                      We do this to protect our accommodation partners & platform
                    </AlertDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLocked && (
                      <Button
                        variant="default"
                        className="w-full sm:w-auto flex items-center rounded-lg hover:bg-[#FF692E] hover:text-white border-2 px-[14px] py-[10px] bg-[#FF692E] text-white shadow-sm justify-center gap-2 border-[#ffffff1f]"
                        onClick={handleRequestOTP}
                      >
                        Request OTP
                      </Button>
                    )}
                    {!isLocked && (
                      <Button variant="ghost" size="icon" onClick={() => setIsLocked(true)}>
                        <Lock className="h-4 w-4" /> Lock
                      </Button>
                    )}
                  </div>
                </div>
              </Alert>
            )}

            <div className="mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-medium">Financial Information</h2>
                  <p className="text-sm text-gray-500">View and manage your finance information here.</p>
                </div>
              </div>
            </div>

            {showOtpModal && (
              <OTPModal
                isOpen={showOtpModal}
                onClose={() => setShowOtpModal(false)}
                onConfirm={handleOTPConfirm}
                isLoading={isLoadingOTP}
                onNewOtp={handleRequestOTP}
                isLoadingSubmit={isLoadingConfirm}
                isError={isErrorConfirm}
                errorMessage={errorConfirm?.data || 'Incorrect OTP'}
                description={`We've sent a code to ${maskMobile(userDetail.mobile, { showFirst: 2, showLast: 3 })}`}
                title={`Please check your phone.`}
                icon={<PhoneCall className="h-6 w-6 text-[#FF692E]" />}
              />
            )}

            <Form {...form}>
              <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-6">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <h3 className="text-md font-medium flex items-center gap-2">
                        Banking Details
                        {isLocked ? <Lock className="h-4 w-4 text-gray-400" /> : <LockOpen className="h-4 w-4 text-gray-400" />}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 sm:mt-0">
                        <StatusBadge status={bankDetails?.verificationStatus} label="Verification" />
                        <StatusBadge status={bankDetails?.validationStatus} label="Validation" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="Name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Bank Name <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select disabled={isLocked} value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger className={form.formState.errors.Name ? 'border-red-500' : ''}>
                                  <SelectValue placeholder="Select a bank" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {getBankingDetailsProps?.data?.BankList?.bank.map((option) => (
                                  <SelectItem key={option.bankName} value={option.bankName}>
                                    {option.bankName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="BranchNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Branch Number <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isBranchCodeDisabled || isLocked}
                                className={form.formState.errors.BranchNo ? 'border-red-500' : ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="AccountHolder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Account Holder <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isLocked}
                                placeholder="Enter account holder name"
                                className={form.formState.errors.AccountHolder ? 'border-red-500' : ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="AccountNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Account Number <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isLocked}
                                placeholder="Enter account number"
                                className={form.formState.errors.AccountNo ? 'border-red-500' : ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="AccountTypeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Account Type <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select disabled={isLocked} value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger className={form.formState.errors.AccountTypeId ? 'border-red-500' : ''}>
                                  <SelectValue placeholder="Select account type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {BANKING_ACCOUNT_TYPE_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="ProofOfBanking"
                        render={({ field }) => (
                          <FormItem>
                            <div className="space-y-3 w-full">
                              <label className="block text-sm font-medium text-gray-700">
                                Proof of Banking Document <span className="text-red-500">*</span>
                              </label>
                              <FileUploadInput
                                label=""
                                DocumentTypeId={UploadDocumentType.ProofOfBanking}
                                {...field}
                                disabled={isLocked}
                                required
                                error={form.formState.errors.ProofOfBanking}
                              />
                              {form.formState.errors.ProofOfBanking && (
                                <p className="text-sm text-red-500 mt-1">
                                  {form.formState.errors.ProofOfBanking.message || 'Proof of banking document is required'}
                                </p>
                              )}
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex pt-4 justify-end gap-4">
                  <Button
                    variant="outline"
                    disabled={isLocked && tag === null}
                    className="w-full sm:w-auto flex items-center rounded-lg border px-[14px] py-[10px] bg-[#fff] text-[#414651] shadow-sm justify-center gap-2 border-[#D5D7DA]"
                    type="button"
                  >
                    <SaveOffIcon /> Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="w-full sm:w-auto flex items-center rounded-lg hover:bg-[#FF692E] hover:text-white border-2 px-[14px] py-[10px] bg-[#FF692E] text-white shadow-sm justify-center gap-2 border-[#ffffff1f]"
                    variant="default"
                    disabled={isLocked || isLoading}
                  >
                    {!isLoading && <SaveIcon />} {isLoading ? <Spinner className="text-orange-700" /> : 'Save'}
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

export default BankingDetailsForm;

const banks1 = [
  {
    bankName: 'ABSA',
    defaultCode: '632005',
  },
  {
    bankName: 'CAPITEC BANK',
    defaultCode: '470010',
  },
  {
    bankName: 'FIRST NATIONAL BANK',
    defaultCode: '250655',
  },
  {
    bankName: 'NEDBANK',
    defaultCode: '198765',
  },
  {
    bankName: 'STANDARD BANK',
    defaultCode: '051001',
  },
  {
    bankName: 'ABN AMRO BANK',
    defaultCode: '740000',
  },
  {
    bankName: 'ACCESS BANK',
    defaultCode: '410105',
  },
  {
    bankName: 'AFRICAN BANK',
    defaultCode: '430000',
  },
  {
    bankName: 'ALBARAKA BANK',
    defaultCode: '800000',
  },
  {
    bankName: 'BNP PARIBAS',
    defaultCode: '688000',
  },
  {
    bankName: 'BANK ZERO',
    defaultCode: '888000',
  },
  {
    bankName: 'BIDVEST BANK',
    defaultCode: '462005',
  },
  {
    bankName: 'CAPITEC BUSINESS',
    defaultCode: '450105',
  },
  {
    bankName: 'DISCOVERY',
    defaultCode: '679000',
  },
  {
    bankName: 'FINBOND MUTUAL BANK',
    defaultCode: '589000',
  },
  {
    bankName: 'GRINDROD BANK',
    defaultCode: '584000',
  },
  {
    bankName: 'HSBC',
    defaultCode: '587000',
  },
  {
    bankName: 'INVESTEC BANK',
    defaultCode: '580105',
  },
  {
    bankName: 'J.P.MORGAN CHASE BANK',
    defaultCode: '432000',
  },
  {
    bankName: 'MTN BANKING',
    defaultCode: '490991',
  },
  {
    bankName: 'NEDBANK INCORPORATING FBC',
    defaultCode: '780117',
  },
  {
    bankName: 'OLYMPUS MOBILE BANK',
    defaultCode: '585001',
  },
  {
    bankName: 'PERMANENT BANK',
    defaultCode: '760005',
  },
  {
    bankName: 'POSTBANK',
    defaultCode: '460005',
  },
  {
    bankName: 'RMB PRIVATE BANK',
    defaultCode: '222026',
  },
  {
    bankName: 'SASFIN BANK',
    defaultCode: '683000',
  },
  {
    bankName: 'STANDARD CHARTERED BANK',
    defaultCode: '730020',
  },
  {
    bankName: 'STATE BANK OF INDIA',
    defaultCode: '801000',
  },
  {
    bankName: 'TYMEBANK',
    defaultCode: '678910',
  },
  {
    bankName: 'U BANK LIMITED',
    defaultCode: '431010',
  },
  {
    bankName: 'VBS MUTUAL',
    defaultCode: '588000',
  },
  //added branh codes
  {
    bankName: 'CITIBANK N.A.',
    defaultCode: '350005',
  },
  {
    bankName: 'HBZ BANK',
    defaultCode: '', // Fordsburg branch as default
  },
  {
    bankName: 'ITHALA',
    defaultCode: '755526', // Universal branch code
  },
  {
    bankName: 'NEDBANK LIMITED INCORPORATED BOE BANK',
    defaultCode: '198765', // Universal branch code
  },
  {
    bankName: 'S.A. RESERVE BANK',
    defaultCode: '900145', // Pretoria branch
  },
  {
    bankName: 'UNIBANK',
    defaultCode: '790005', // Head office
  },
];
