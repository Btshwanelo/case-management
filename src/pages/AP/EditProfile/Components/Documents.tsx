import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormField } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { useSuppllierCreateDocumentExecuteReqMutation } from '@/services/apiService';
import FileUploadInput from '@/components/FileUploadInput'; // This will be our enhanced component
import { Spinner } from '@/components/ui/spinner';
import { showSuccessToast } from '@/components/SuccessToast';
import { removeForcedAction } from '@/slices/forcedActionsSlice';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { showErrorToast } from '@/components/ErrorToast ';
import StepperItem from '@/pages/OnBoarding/Components/Steppertem';
import { SaveIcon, SaveOffIcon } from 'lucide-react';

enum DocumentType {
  IdDocument = 'IdDocument',
  CipcDocuments = 'CipcDocuments',
  ProofOfAddress = 'ProofOfAddress',
  ProofOfBanking = 'ProofOfBanking',
}

enum UploadDocumentType {
  IDDocument = 886,
  CIPCDocument = 887,
  ProofOfAddress = 904,
  ProofOfBanking = 905,
}

const fieldNameToDocumentCodeMap = {
  [UploadDocumentType.IDDocument]: DocumentType.IdDocument,
  [UploadDocumentType.CIPCDocument]: DocumentType.CipcDocuments,
  [UploadDocumentType.ProofOfAddress]: DocumentType.ProofOfAddress,
  [UploadDocumentType.ProofOfBanking]: DocumentType.ProofOfBanking,
};

const DocumentUploadForm = ({ details, setNextStep }) => {
  const [createDocument, { isLoading: isCreating, isSuccess: isCreateSuccess, isError: isCreateError }] =
    useSuppllierCreateDocumentExecuteReqMutation();

  const [retrieveDocument, { isLoading: isRetrieving }] = useSuppllierCreateDocumentExecuteReqMutation();

  const [searchParams, setSearchParams] = useSearchParams();
  const tag = searchParams.get('tag');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSuccessUpdateForcedActions, setIsSuccessUpdateForcedActions] = useState(false);

  const form = useForm({
    defaultValues: {
      IdDocument: {},
      CipcDocuments: {},
      ProofOfAddress: {},
      // ProofOfBanking: {},
    },
  });

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await retrieveDocument({
          body: {
            entityName: 'SupplierDocLib',
            requestName: 'RetrieveDocument',
            inputParamters: {
              RelatedRecordId: details.accomodationProviderId,
              Base64: false,
            },
          },
        }).unwrap();

        if (response?.Documents) {
          response.Documents.forEach((document) => {
            const fieldName = fieldNameToDocumentCodeMap[document.documentTypeId];
            if (fieldName) {
              form.setValue(fieldName, {
                FileName: document.fileName,
                DocumentTypeId: document.documentTypeId,
                FileExtention: document.fileExtention,
                FileContent: document.fileContent,
                RecordId: document.recordId,
              });
            }
          });
        }
      } catch (error) {
        showErrorToast('Error retrieving documents');
      }
    };

    fetchDocuments();
  }, [details.accomodationProviderId, retrieveDocument, form]);

   useEffect(() => {
      const currentStep = searchParams.get('s');
      if (currentStep !== 'documents') {
        setSearchParams({ ...Object.fromEntries(searchParams), s: 'documents' });
      }
    }, []);

  const onSubmit = async (formData) => {
    const documentsToSubmit = Object.entries(formData)
      .filter(([_, doc]) => doc?.FileContent)
      .map(([_, doc]) => {
        const { RecordId, ...rest } = doc;
        return RecordId ? { EntityDocumentId: RecordId, ...rest } : rest;
      });

    try {
      await createDocument({
        body: {
          entityName: 'Supplier',
          recordId: details.accomodationProviderId,
          requestName: 'CreateDocumentExecuteRequest',
          inputParamters: {
            Documents: documentsToSubmit,
          },
        },
      }).unwrap();

      if (tag) {
        setIsSuccessUpdateForcedActions(true);
        dispatch(removeForcedAction(0));
        setNextStep();
      } else {
        showSuccessToast('Successfully updated documents');
      }
    } catch (error) {
      showErrorToast('Error updating documents');
    }
  };

  return (
    <div className="lg:col-span-9">
      <div className="space-y-6">
        <Card>
          {tag != null && (
            <div className="flex items-center w-full justify-center mt-3">
              {[1, 2, 3, 4].map((step, index) => (
                <StepperItem key={step} active={step <= 4} completed={step < 4} first={index === 0} last={index === 3} />
              ))}
            </div>
          )}
          <CardContent className="pt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-medium">Documents</h2>
              <p className="text-sm text-gray-500">View and manage your your documents here.</p>
            </div>

            <Form {...form}>
              <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="IdDocument"
                      rules={{ required: 'ID Document is required' }}
                      render={({ field }) => (
                        <FileUploadInput
                          label="ID Document"
                          DocumentTypeId={UploadDocumentType.IDDocument}
                          {...field}
                          disabled={isCreating || isRetrieving}
                        />
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="CipcDocuments"
                      rules={{ required: 'CIPC Document is required' }}
                      render={({ field }) => (
                        <FileUploadInput
                          label="CIPC Document"
                          DocumentTypeId={UploadDocumentType.CIPCDocument}
                          {...field}
                          disabled={isCreating || isRetrieving}
                        />
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ProofOfAddress"
                      rules={{ required: 'Proof of Address Document is required' }}
                      render={({ field }) => (
                        <FileUploadInput
                          label="Proof of Address Document"
                          DocumentTypeId={UploadDocumentType.ProofOfAddress}
                          {...field}
                          disabled={isCreating || isRetrieving}
                        />
                      )}
                    />
                    {/* <FormField
                      control={form.control}
                      name="ProofOfBanking"
                      rules={{ required: 'Proof of Banking Document is required' }}
                      render={({ field }) => (
                        <FileUploadInput
                          label="Proof of Banking Document"
                          DocumentTypeId={UploadDocumentType.ProofOfBanking}
                          {...field}
                          disabled={isCreating || isRetrieving}
                        />
                      )}
                    /> */}
                  </div>
                </div>

                <div className="flex pt-4 justify-end gap-4">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto flex items-center rounded-lg border px-[14px] py-[10px] bg-[#fff] text-[#414651] shadow-sm justify-center gap-2 border-[#D5D7DA]"
                    type="button"
                    disabled={isCreating || isRetrieving}
                  >
                    <SaveOffIcon /> Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="w-full sm:w-auto flex items-center rounded-lg hover:bg-[#FF692E] hover:text-white border-2 px-[14px] py-[10px] bg-[#FF692E] text-white shadow-sm justify-center gap-2 border-[#ffffff1f]"
                    variant="default"
                    disabled={isCreating || isRetrieving}
                  >
                    {!isCreating && <SaveIcon />} {isCreating ? <Spinner /> : ` Save`}
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

export default DocumentUploadForm;
