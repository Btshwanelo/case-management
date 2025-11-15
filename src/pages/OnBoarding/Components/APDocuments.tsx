import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSupplierMutation } from '@/services/apiService';
import { showSuccessToast } from '@/components/SuccessToast';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Spinner } from '@react-pdf-viewer/core';
import { useForm, FormProvider } from 'react-hook-form';
import { convertFileToBase64, getId } from '@/utils';
import StepperItem from './Steppertem';
import { ButtonLoader } from '@/components/ui/button-loader';
import OnboardingNavHeader from '@/components/OnboardingNavHeader';
import { Stepper } from '@/components/ui/stepper-item';
enum DocumentType {
  IdDocument = 'IdDocument',
  CipcDocuments = 'CipcDocuments',
  ProofOfAddress = 'ProofOfAddress',
  ProofOfBanking = 'ProofOfBanking',
}

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

const fieldNameToDocumentCodeMap: Record<number, DocumentType> = {
  886: DocumentType.IdDocument,
  887: DocumentType.CipcDocuments,
  904: DocumentType.ProofOfAddress,
  905: DocumentType.ProofOfBanking,
};

const FileUploadInput = React.forwardRef(({ label, hint, required = false, error, DocumentTypeId, onChange, disabled }, ref) => {
  const inputRef = React.useRef(null);
  const [fileName, setFileName] = React.useState('');
  const [fileError, setFileError] = React.useState('');

  const validateFile = (file) => {
    if (!file) return 'Please select a file';
    if (file.size > 5 * 1024 * 1024) return 'File size must be less than 5MB';
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      return 'Only PDF, JPEG and PNG files are allowed';
    }
    return '';
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setFileError(validationError);
        setFileName('');
        onChange(null);
        return;
      }

      try {
        const base64Content = await convertFileToBase64(file);
        setFileName(file.name);
        setFileError('');

        const fileData = {
          id: getId().toString(),
          FileName: file.name,
          FileExtention: file.name.split('.').pop() || '',
          DocumentTypeId: DocumentTypeId,
          FileContent: base64Content.split('base64,')[1],
        };

        onChange(fileData);
      } catch (error) {
        setFileError('Failed to process file');
        setFileName('');
        onChange(null);
      }
    }
  };

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={fileName}
            placeholder="Browse a file here"
            readOnly
            className={cn('bg-white cursor-pointer flex-1', (error || fileError) && 'border-red-500')}
            onClick={handleClick}
          />
          <Button type="button" variant="outline" className="flex items-center gap-2" onClick={handleClick} disabled={disabled}>
            <Upload className="h-4 w-4" /> Upload
          </Button>
          <input
            type="file"
            ref={inputRef}
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={disabled}
          />
        </div>
        {error || fileError ? (
          <p className="text-sm text-red-500">{error || fileError}</p>
        ) : (
          <p className="text-sm text-gray-500">{hint || 'Accepted formats: PDF, JPEG, PNG. Maximum file size: 5MB'}</p>
        )}
      </div>
    </div>
  );
});

const APDocuments = ({ onNext }) => {
  const [supplier, { isSuccess, isLoading, isError, data }] = useSupplierMutation();
  const userDetails = useSelector((state: RootState) => state.auth);
  const profileDetails = useSelector((state: RootState) => state.details);

  const methods = useForm({
    defaultValues: {
      IdDocument: null,
      CipcDocuments: null,
      ProofOfAddress: null,
    },
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    const documentsToSubmit = [data.IdDocument, data.CipcDocuments, data.ProofOfAddress].filter((doc) => !!doc && !!doc.FileContent);

    supplier({
      body: {
        entityName: 'Supplier',
        recordId: userDetails.user.relatedObjectId,
        requestName: 'CreateDocumentExecuteRequest',
        inputParamters: {
          Documents: documentsToSubmit.map((doc) => {
            const { RecordId, ...rest } = doc;
            return RecordId ? { EntityDocumentId: RecordId, ...rest } : rest;
          }),
        },
      },
    });

    supplier({
      body: {
        entityName: 'Supplier',
        recordId: userDetails.user.relatedObjectId,
        requestName: 'UpsertRecordReq',
        inputParamters: {
          Entity: { ProfileSteps: 1085 },
        },
      },
    });
  };

  useEffect(() => {
    if (isSuccess) {
      showSuccessToast('Profile Updated!');
      onNext();
    }
  }, [isSuccess]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <OnboardingNavHeader />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Stepper */}
        <div className="mb-12">
          <Stepper steps={6} currentStep={5} />
        </div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-4">Upload documents</h1>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p>Kindly Upload the following documents:</p>
            <ul className="list-disc pl-5 text-gray-600">
              <li>ID document of the contact person of the registered company</li>
              <li>CIPC documents of the business</li>
              <li>Proof of address document</li>
            </ul>
          </div>
        </div>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8">
              <div className="space-y-6">
                <FileUploadInput
                  label="ID Document"
                  required
                  error={methods.formState.errors.IdDocument?.message}
                  DocumentTypeId={UploadDocumentType.IDDocument}
                  onChange={(fileData) =>
                    methods.setValue('IdDocument', fileData, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  disabled={isLoading}
                />

                <FileUploadInput
                  label="CIPC Document"
                  required={profileDetails.requestResults.aPtype === 'Individual' ? false : true}
                  error={methods.formState.errors.CipcDocuments?.message}
                  DocumentTypeId={UploadDocumentType.CIPCDocument}
                  onChange={(fileData) =>
                    methods.setValue('CipcDocuments', fileData, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  disabled={isLoading}
                />

                <FileUploadInput
                  label="Proof Of Address Document"
                  required
                  error={methods.formState.errors.ProofOfAddress?.message}
                  DocumentTypeId={UploadDocumentType.ProofOfAddress}
                  onChange={(fileData) =>
                    methods.setValue('ProofOfAddress', fileData, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600"
                disabled={isLoading || !methods.formState.isValid || !methods.formState.isDirty}
              >
                {isLoading ? <ButtonLoader /> : 'Next'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default APDocuments;
