import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';
import { useBankAccountMutation, useExecuteRequest1Mutation, useSupplierMutation } from '@/services/apiService';
import { Spinner } from '@/components/ui/spinner';
import { convertFileToBase64, getId } from '@/utils';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import { showSuccessToast } from '@/components/SuccessToast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StepperItem from './Steppertem';
import { ButtonLoader } from '@/components/ui/button-loader';
import OnboardingNavHeader from '@/components/OnboardingNavHeader';
import { Stepper } from '@/components/ui/stepper-item';

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

const FileUploadInput = ({ label, hint, required = false, onFileChange, error, touched }) => {
  const inputRef = React.useRef(null);
  const [fileName, setFileName] = React.useState('');
  const [file, setFile] = React.useState([]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        onFileChange([], 'File size must be less than 5MB');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        onFileChange([], 'Only JPEG, PNG and PDF files are allowed');
        return;
      }

      setFileName(file.name);

      const b64FilesPromises = [file].map((file) => {
        return new Promise((resolve, reject) => {
          convertFileToBase64(file)
            .then((b64) => {
              resolve({
                id: getId().toString(),
                FileName: file.name,
                FileExtention: file.name.split('.').pop() || '',
                DocumentTypeId: 905,
                FileContent: b64.split('base64,')[1],
              });
            })
            .catch((error) => {
              console.error('Error converting file to base64:', error);
              reject(error);
            });
        });
      });

      try {
        const b64Files = await Promise.all(b64FilesPromises);
        onFileChange(b64Files, '');
        setFile(() => [...b64Files]);
      } catch (error) {
        console.error('Failed to process files:', error);
        onFileChange([], 'Failed to process file');
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="flex gap-2">
        <Input
          value={fileName}
          placeholder="browse or drag a file here"
          readOnly
          className={cn('bg-white cursor-pointer flex-1', touched && error && 'border-red-500')}
          onClick={handleClick}
        />
        <Button type="button" variant="outline" className="flex items-center gap-2" onClick={handleClick}>
          <Upload className="h-4 w-4" /> Upload
        </Button>
        <input type="file" ref={inputRef} className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
      </div>
      {touched && error ? <p className="text-sm text-red-500">{error}</p> : <p className="text-sm text-gray-500">{hint}</p>}
    </div>
  );
};

const BankingDetails = ({ onNext }) => {
  const [formData, setFormData] = React.useState({
    bankName: '',
    branchNo: '',
    accountHolder: '',
    accountNo: '',
    accountType: '',
  });

  const [errors, setErrors] = React.useState({
    bankName: '',
    branchNo: '',
    accountHolder: '',
    accountNo: '',
    accountType: '',
    proofOfBanking: '',
  });
  const [touched, setTouched] = React.useState({
    bankName: false,
    branchNo: false,
    accountHolder: false,
    accountNo: false,
    accountType: false,
    proofOfBanking: false,
  });

  const [files, setFiles] = React.useState([]);
  const [isBranchCodeDisabled, setIsBranchCodeDisabled] = React.useState(true);

  const userDetails = useSelector((state: RootState) => state.auth);
  const [GetBankingDetails, getBankingDetailsProps] = useExecuteRequest1Mutation();

  useEffect(() => {
    GetBankingDetails({
      body: {
        requestName: 'GetListOfBanks',
      },
    });
  }, []);

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'bankName':
        if (!value.trim()) {
          error = 'Bank name is required';
        } else if (value.trim().length < 2) {
          error = 'Bank name must be at least 2 characters';
        }
        break;
      case 'branchNo':
        if (!value.trim()) {
          error = 'Branch number is required';
        } else if (!/^\d{3,}$/.test(value.trim())) {
          error = 'Please enter a valid branch number (minimum 3 digits and only digits)';
        }
        break;
      case 'accountHolder':
        if (!value.trim()) {
          error = 'Account holder name is required';
        } else if (value.trim().length < 2) {
          error = 'Account holder name must be at least 2 characters';
        }
        break;
      case 'accountNo':
        if (!value.trim()) {
          error = 'Account number is required';
        } else if (!/^\d{6,}$/.test(value.trim())) {
          error = 'Please enter a valid account number (minimum 6 digits)';
        }
        break;
      case 'accountType':
        if (!value) {
          error = 'Account type is required';
        }
        break;
      case 'proofOfBanking':
        if (!value) {
          error = 'Proof of banking document is required';
        }
        break;
    }
    return error;
  };

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleAccountTypeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      accountType: value,
    }));

    setErrors((prev) => ({
      ...prev,
      accountType: validateField('accountType', value),
    }));

    setTouched((prev) => ({
      ...prev,
      accountType: true,
    }));
  };
  const handleBankChange = (value) => {
    const selectedBank = findBankByName(banks, value);

    setFormData((prev) => ({
      ...prev,
      bankName: value,
      branchNo: selectedBank?.defaultCode || '',
    }));

    // Validate both bankName and branchNo
    setErrors((prev) => ({
      ...prev,
      bankName: validateField('bankName', value),
      branchNo: validateField('branchNo', selectedBank?.defaultCode || ''),
    }));

    setTouched((prev) => ({
      ...prev,
      bankName: true,
      branchNo: true,
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, formData[name]),
    }));
  };

  const handleFileChange = (newFiles, error = '') => {
    setFiles(newFiles);
    setErrors((prev) => ({
      ...prev,
      proofOfBanking: error || (newFiles.length === 0 ? 'Proof of banking document is required' : ''),
    }));
    setTouched((prev) => ({
      ...prev,
      proofOfBanking: true,
    }));
  };

  const validateForm = () => {
    const newErrors = {
      bankName: validateField('bankName', formData.bankName),
      branchNo: validateField('branchNo', formData.branchNo),
      accountHolder: validateField('accountHolder', formData.accountHolder),
      accountNo: validateField('accountNo', formData.accountNo),
      accountType: validateField('accountType', formData.accountType),
      proofOfBanking: files.length === 0 ? 'Proof of banking document is required' : '',
    };

    setErrors(newErrors);
    setTouched({
      bankName: true,
      branchNo: true,
      accountHolder: true,
      accountNo: true,
      accountType: true,
      proofOfBanking: true,
    });

    return !Object.values(newErrors).some((error) => error !== '');
  };

  const [bankAccount, { isSuccess, isLoading, isError, data }] = useBankAccountMutation();
  const [supplier, { isSuccess: isSuccessDoc, isLoading: isLoadingDoc, isError: isErroDoc, data: dataDoc }] = useSupplierMutation();

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // const documentsToSubmit = [data.IdDocument, data.CipcDocuments, data.ProofOfAddress].filter((doc) => !!doc && !!doc.FileContent);

    bankAccount({
      body: {
        entityName: 'BankAccount',
        requestName: 'UpsertRecordReq',
        inputParamters: {
          Entity: {
            ProofOfBanking: '904',
            // BranchName: formData.branchName,
            Name: formData.bankName,
            AccountHolder: formData.accountHolder,
            AccountNo: formData.accountNo,
            BranchNo: formData.branchNo,
            AccountTypeId: formData.accountType,
            Documents: files,
            RelatedObjectId: userDetails.user.relatedObjectId,
            RelatedObjectIdObjectTypeCode: 'Supplier',
            ProfileSteps: 1084,
          },
        },
      },
    });

    supplier({
      body: {
        entityName: 'Supplier',
        recordId: userDetails.user.relatedObjectId,
        requestName: 'CreateDocumentExecuteRequest',
        inputParamters: {
          Documents: files,
        },
      },
    });
  };

  useEffect(() => {
    if (isSuccess && isSuccessDoc) {
      showSuccessToast('Profile Updated!');
      onNext();
    }
  }, [isSuccess, isSuccessDoc]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <OnboardingNavHeader />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Stepper */}
        {/* <div className="flex justify-center mb-12 overflow-x-auto py-4">
          <div className="flex items-center">
            <StepperItem active={true} completed={true} first={true} last={false} />
            <StepperItem active={true} completed={true} first={false} last={false} />
            <StepperItem active={true} completed={true} first={false} last={false} />
            <StepperItem active={true} completed={true} first={false} last={false} />
            <StepperItem active={true} completed={false} first={false} last={false} />
            <StepperItem active={false} completed={false} first={false} last={true} />
          </div>
        </div> */}
        <div className="mb-12">
          <Stepper steps={6} currentStep={4} />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-4">Complete your profile, {userDetails.user.name}</h1>
          <p className="text-gray-600">
            Congratulations on signing up to the NSFAS portal. We require additional information to ensure that you're set up for the best
            experience regardless of your selected profile.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-6">Banking Details</h2>
            <div className="space-y-6">
              {/* <div className="space-y-2">
                <Label htmlFor="bankName">
                  Bank Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="bankName"
                  name="bankName"
                  placeholder="Bank Name"
                  value={formData.bankName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={cn(touched.bankName && errors.bankName && 'border-red-500')}
                />
                {touched.bankName && errors.bankName && <p className="text-sm text-red-500">{errors.bankName}</p>}
              </div> */}

              <div className="space-y-2">
                <Label htmlFor="bankName">
                  Bank Name <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.bankName} onValueChange={handleBankChange}>
                  <SelectTrigger className={cn(touched.bankName && errors.bankName && 'border-red-500')}>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks?.map((option) => (
                      <SelectItem key={option.bankName} value={option.bankName}>
                        {option.bankName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {touched.bankName && errors.bankName && <p className="text-sm text-red-500">{errors.bankName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="branchNo">
                  Branch Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="branchNo"
                  name="branchNo"
                  placeholder="Branch Number"
                  value={formData.branchNo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isBranchCodeDisabled}
                  className={cn(touched.branchNo && errors.branchNo && 'border-red-500')}
                />
                {touched.branchNo && errors.branchNo && <p className="text-sm text-red-500">{errors.branchNo}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountHolder">
                  Account Holder <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="accountHolder"
                  name="accountHolder"
                  placeholder="Account Holder"
                  value={formData.accountHolder}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={cn(touched.accountHolder && errors.accountHolder && 'border-red-500')}
                />
                {touched.accountHolder && errors.accountHolder && <p className="text-sm text-red-500">{errors.accountHolder}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNo">
                  Account Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="accountNo"
                  name="accountNo"
                  placeholder="Account Number"
                  value={formData.accountNo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={cn(touched.accountNo && errors.accountNo && 'border-red-500')}
                />
                {touched.accountNo && errors.accountNo && <p className="text-sm text-red-500">{errors.accountNo}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType">
                  Account Type <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.accountType} onValueChange={handleAccountTypeChange}>
                  <SelectTrigger className={cn(touched.accountType && errors.accountType && 'border-red-500')}>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANKING_ACCOUNT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {touched.accountType && errors.accountType && <p className="text-sm text-red-500">{errors.accountType}</p>}
              </div>

              <FileUploadInput
                label="Proof of Banking"
                hint="Upload proof of banking document (PDF, JPEG, or PNG, max 5MB)"
                required
                onFileChange={handleFileChange}
                error={errors.proofOfBanking}
                touched={touched.proofOfBanking}
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-6">
            {/* <Button variant="outline">Previous</Button> */}
            <Button
              onClick={handleSubmit}
              className="bg-orange-500 hover:bg-orange-600"
              disabled={isLoading || Object.values(errors).some((error) => error !== '')}
            >
              {isLoading ? <ButtonLoader /> : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankingDetails;

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
    bankName: 'CITIBANK N.A.',
    defaultCode: '',
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
    bankName: 'HBZ BANK',
    defaultCode: '',
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
    bankName: 'ITHALA',
    defaultCode: '',
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
    bankName: 'NEDBANK LIMITED INCORPORATED BOE BANK',
    defaultCode: '',
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
    bankName: 'S.A. RESERVE BANK',
    defaultCode: '',
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
    bankName: 'UNIBANK',
    defaultCode: '',
  },
  {
    bankName: 'VBS MUTUAL',
    defaultCode: '588000',
  },
];
