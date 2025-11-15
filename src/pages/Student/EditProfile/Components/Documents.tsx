import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Info, Copy } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useSuppllierCreateDocumentExecuteReqMutation } from '@/services/apiService';
import FileUploadInput from '@/components/FileUploadInput';
import { Spinner } from '@/components/ui/spinner';
import { showSuccessToast } from '@/components/SuccessToast';
import { showErrorToast } from '@/components/ErrorToast ';
import { useSearchParams } from 'react-router-dom';
import { removeForcedAction } from '@/slices/forcedActionsSlice';
import { useDispatch } from 'react-redux';
import StepperItem from '@/pages/OnBoarding/Components/Steppertem';

enum DocumentType {
  IdDocument = 'IdDocument',
  CipcDocuments = 'CipcDocuments',
  ProofOfAddress = 'ProofOfAddress',
  ProofOfBanking = 'ProofOfBanking',
  Selfie = 'Selfie',
  ProofOfRegistration = 'ProofOfRegistration',
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
  950: DocumentType.ProofOfRegistration,
  951: DocumentType.Selfie,
};

const StudentDocumentsUpload = ({ details, setNextStep }) => {
  const [searchParams] = useSearchParams();
  const tag = searchParams.get('tag');
  const dispatch = useDispatch();

  const [suppllierCreateDocumentExecuteReq, { data, isLoading, isSuccess, isError }] = useSuppllierCreateDocumentExecuteReqMutation();
  const [supplierDocLibretriveDocument, { data: retrive, isLoading: isLoadingRetrive, isSuccess: isSuccessRetrive }] =
    useSuppllierCreateDocumentExecuteReqMutation();
  const form = useForm({
    defaultValues: {
      IdDocument: {},
      ProofOfRegistration: {},
      Selfie: {},
    },
  });

  useEffect(() => {
    supplierDocLibretriveDocument({
      body: {
        entityName: 'EmployeeDocLib',
        requestName: 'RetrieveDocument',
        inputParamters: {
          RelatedRecordId: details.studentDetails.employeeId,
          Base64: false,
        },
      },
    });
  }, []);

  useEffect(() => {
    if (isSuccessRetrive) {
      retrive?.Documents.forEach((document) => {
        form.setValue(fieldNameToDocumentCodeMap[document.documentTypeId], {
          FileName: document.fileName,
          DocumentTypeId: document.documentTypeId,
          FileExtention: document.fileExtention,
          FileContent: document.fileContent,
          RecordId: document.recordId, // Save the recordId for updates
        });
      });
    }
  }, [isSuccessRetrive]);

  const onSubmit = async (data) => {
    const documentsToSubmit = [
      data.IdDocument,
      data.ProofOfRegistration,
      data.Selfie,
      // data.ProofOfBanking,
    ]
      .filter((doc) => !!doc && !!doc.FileContent) // Only include documents with file content
      .map((doc) => ({
        ...doc,
        RecordId: doc.RecordId || undefined, // Remove RecordId for new documents
      }));

    suppllierCreateDocumentExecuteReq({
      body: {
        entityName: 'Employee',
        recordId: details.studentDetails.employeeId,
        requestName: 'CreateDocumentExecuteRequest',
        inputParamters: {
          Documents: documentsToSubmit.map((doc) => {
            // If the RecordId exists, keep it. If not, remove the field from the request.
            const { RecordId, ...rest } = doc;
            return RecordId ? { EntityDocumentId: RecordId, ...rest } : rest;
          }),
        },
      },
    });
  };

  if (isSuccess) {
    showSuccessToast('Profile updated successfully!');
  }

  if (isSuccess) {
    if (tag != null) {
      dispatch(removeForcedAction(0));
      setNextStep();
    } else {
      showSuccessToast('Sucessfully updated documents');
    }
  }

  if (isError) {
    showErrorToast('Error updating documents');
  }

  return (
    <div className="lg:col-span-9">
      {/* <div className="mb-6">
        <h1 className="text-2xl font-semibold">Profile</h1>
      </div> */}

      <div className="space-y-6">
        <Card>
          {tag != null && (
            <div className="flex items-center w-full justify-center mt-3">
              {[1, 2, 3].map((step, index) => (
                <StepperItem key={step} active={step <= 3} completed={step < 3} first={index === 0} last={index === 2} />
              ))}
            </div>
          )}
          <CardContent className="pt-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium">Documents</h2>
              <p className="text-sm text-gray-500">View your documents here.</p>
            </div>

            <Form {...form}>
              <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-8">
                  {/* Documents Section */}
                  <div>
                    <h3 className="text-md font-medium mb-4 flex items-center gap-2">
                      <Info className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">This will not be displayed on your profile.</span>
                    </h3>

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
                            // disabled={isSubmitting}
                          />
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="ProofOfRegistration"
                        rules={{ required: 'Proof of Registration is required' }}
                        render={({ field }) => (
                          <FileUploadInput
                            label="Proof of Registration"
                            DocumentTypeId={UploadDocumentType.ProofOfRegistration}
                            {...field}
                            // disabled={isSubmitting}
                          />
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="Selfie"
                        rules={{ required: 'Selfie is required' }}
                        render={({ field }) => (
                          <FileUploadInput
                            label="Selfie"
                            DocumentTypeId={UploadDocumentType.Selfie}
                            {...field}
                            // disabled={isSubmitting}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button variant="outline" className="min-w-28" type="button">
                    Cancel
                  </Button>
                  <Button type="submit" className="min-w-28" variant="default">
                    {isLoading ? <Spinner /> : 'Save'}
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

export default StudentDocumentsUpload;
function setNextStep() {
  throw new Error('Function not implemented.');
}
