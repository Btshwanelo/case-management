import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronRight, Info, X, Upload } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import {
  useFacilityRetrievePrevFacilityDataQuery,
  useFacilityUpsertRecordReqMutation,
  useRemoveRecordReqMutation,
} from '@/services/apiService';
import { EUploadDocumentType, TRemoteFile, TUploadedFile } from '@/types';
import useResidence from '@/hooks/useResidence';
import DashboardLayout from '@/layouts/DashboardLayout';
import Sidebar from './Sidebar';

interface DocumentType {
  id: EUploadDocumentType;
  label: string;
  description: string;
  acceptedFormats: string[];
}

const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: EUploadDocumentType.MunicipalPlan,
    label: 'Municipal Plan',
    description: 'Upload your municipal approved building plan',
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
  },
  {
    id: EUploadDocumentType.ProofOfAddress,
    label: 'Proof of Address',
    description: 'Recent utility bill or official correspondence',
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
  },
  {
    id: EUploadDocumentType.FloorPlan,
    label: 'Floor Plan',
    description: 'Detailed floor plan of your property',
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
  },
];

const UploadDocuments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [files, setFiles] = useState<TUploadedFile[]>([]);
  const [searchParams] = useSearchParams();
  const isUpdate = searchParams.get('update');
  const residenceDetails = useResidence();

  const residentDetails = useSelector((state: RootState) => state.resident);
  const [facilityUpsertRecordReq, { isLoading, isSuccess }] = useFacilityUpsertRecordReqMutation();

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const getFilePreview = async (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const [removeRecordReq, { isLoading: isDeletingRecordReq }] = useRemoveRecordReqMutation();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, docType: EUploadDocumentType) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const preview = await getFilePreview(file);
    const existingIndex = files.findIndex((f) => f.type === docType);

    if (existingIndex >= 0) {
      const newFiles = [...files];
      newFiles[existingIndex] = { file, preview, type: docType, remote: false };
      setFiles(newFiles);
    } else {
      setFiles([...files, { file, preview, type: docType, remote: false }]);
    }
  };

  const removeFile = async (docType: EUploadDocumentType) => {
    try {
      const existing = files.find((f) => f.type === docType);
      if (existing?.remote) {
        await removeRecordReq({
          entityName: 'FacilityDocLib',
          recordId: existing.file.recordId,
        });
      }
      setFiles(files.filter((f) => f.type !== docType));
    } catch (error) {
      console.error(error);
    }
  };

  const shouldDisableBackButton = residenceDetails.fullEdit === false;

  const getDocumentStatus = (docType: EUploadDocumentType) => {
    return files.find((f) => f.type === docType);
  };

  const handleSubmit = async () => {
    if (files.length < DOCUMENT_TYPES.length) return;

    const documents = await Promise.all(
      files
        .filter((entry) => entry.remote === false)
        .map(async (file) => {
          const base64Content = await convertFileToBase64(file.file);
          return {
            FileName: file.file.name,
            FileExtention: file.file.name.split('.').pop(),
            DocumentTypeId: file.type,
            FileContent: base64Content.split(',')[1],
          };
        })
    );

    const payload = {
      entityName: 'Facility',
      requestName: 'CreateDocumentExecuteRequest',
      recordId: residentDetails.facilityId,
      inputParamters: {
        Documents: documents,
      },
    };

    await facilityUpsertRecordReq({ body: payload });
  };

  useEffect(() => {
    if (isSuccess) {
      if (location.state?.fullEdit === false) {
        navigate('/dashboard', { state: { fullEdit: true } });
      } else {
        navigate('/payment-info');
      }
    }
  }, [isSuccess, navigate]);

  const handleBackClick = () => {
    navigate(`/upload-property-images?update=true&residenceId=${residentDetails.facilityId}`);
  };
  const { data: prevData } = useFacilityRetrievePrevFacilityDataQuery(
    {
      FacilityId: residentDetails.facilityId,
      Page: 'upload-property-documents',
    },
    { skip: !isUpdate, refetchOnMountOrArgChange: true, refetchOnReconnect: true }
  );

  useEffect(() => {
    if (isUpdate && prevData && prevData.documents) {
      setFiles([
        ...prevData.documents.map((doc: TRemoteFile) => ({
          type: doc.documentTypeId,
          file: doc,
          preview: ['jpg', 'png', 'jpeg'].includes(doc.fileExtention) ? `data:image/jpeg;base64,${doc.fileContent}` : null,
          remote: true,
        })),
      ]);
    }
  }, [prevData, isUpdate]);

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4 max-w-[1200px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Progress Steps */}
          <Sidebar currentStep={4} />
          {/* Main Content */}
          <div className="lg:col-span-9">
            <Card>
              <CardHeader>
                <CardTitle>Required Documents</CardTitle>
                <CardDescription>Please upload all required documents for your property</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {DOCUMENT_TYPES.map((docType) => {
                  const uploadedFile = getDocumentStatus(docType.id);
                  const acceptedFormats = docType.acceptedFormats.join(',');

                  return (
                    <div key={docType.id} className="border rounded-lg p-4 transition-shadow hover:shadow-md">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium">{docType.label}</h3>
                          <p className="text-sm text-gray-500">{docType.description}</p>
                          <p className="text-xs text-gray-400">Accepted formats: {docType.acceptedFormats.join(', ')}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {uploadedFile ? (
                            <>
                              <span className="text-sm text-green-600">
                                {uploadedFile.remote === true ? uploadedFile.file.fileName : uploadedFile.file.name}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(docType.id)}
                                className="text-red-500 hover:text-red-600"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <div>
                              <input
                                type="file"
                                id={`file-${docType.id}`}
                                className="hidden"
                                accept={acceptedFormats}
                                onChange={(e) => handleFileChange(e, docType.id)}
                              />
                              <label htmlFor={`file-${docType.id}`}>
                                <Button variant="outline" size="sm" asChild>
                                  <span>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload
                                  </span>
                                </Button>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>

                      {uploadedFile?.preview && (
                        <div className="mt-4">
                          <img src={uploadedFile.preview} alt={`Preview of ${docType.label}`} className="max-h-40 rounded-md" />
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="flex justify-between pt-6">
                  <Button variant="outline" type="button" onClick={handleBackClick}>
                    Back
                  </Button>
                  <Button
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={handleSubmit}
                    disabled={isLoading || files.length < DOCUMENT_TYPES.length}
                  >
                    {isLoading ? 'Uploading...' : 'Next'}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                {files.length < DOCUMENT_TYPES.length && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <Info className="h-4 w-4" />
                    Please upload all required documents to continue
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UploadDocuments;
