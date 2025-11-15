import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronRight, Info, X, Upload } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import {
  useRemoveRecordReqMutation,
  useFacilityRetrievePrevFacilityDataQuery,
  useFacilityUpsertRecordReqMutation,
  useUpdateCoverImageMutation,
} from '@/services/apiService';
import { cn } from '@/lib/utils';
import { TRemoteFile, EUploadDocumentType, TUploadedFile } from '@/types';
import { showSuccessToast } from '@/components/SuccessToast';
import { showErrorToast } from '@/components/ErrorToast ';
import useResidence from '@/hooks/useResidence';
import DashboardLayout from '@/layouts/DashboardLayout';
import Sidebar from './Sidebar';

const UploadImages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const residenceDetails = useResidence();

  console.log('residenceDetails', residenceDetails);
  const isUpdate = searchParams.get('update');
  const [files, setFiles] = useState<TUploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const residentDetails = useSelector((state: RootState) => state.resident);

  const [facilityUpsertRecordReq, { isLoading, isSuccess }] = useFacilityUpsertRecordReqMutation();
  const [removeRecordReq, { isLoading: isDeletingRecordReq }] = useRemoveRecordReqMutation();
  const [updateCoverImage, { isLoading: isLoadingCover, isSuccess: isSuccessCover, isError: isErrorCover }] = useUpdateCoverImageMutation();

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const newFiles: TUploadedFile[] = [];

    for (const file of selectedFiles) {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        newFiles.push({
          file,
          preview,
          isCover: files.length === 0 && newFiles.length === 0,
          remote: false,
        });
      }
    }

    setFiles([...files, ...newFiles]);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(event.dataTransfer.files);
    const newFiles: TUploadedFile[] = [];

    for (const file of droppedFiles) {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        newFiles.push({
          file,
          preview,
          isCover: files.length === 0 && newFiles.length === 0,
          remote: false,
        });
      }
    }

    setFiles([...files, ...newFiles]);
  };

  const removeFile = async (index: number) => {
    try {
      if (files[index].remote) {
        await removeRecordReq({
          entityName: 'FacilityDocLib',
          recordId: files[index].file.recordId,
        });
      }
      const newFiles = files.filter((_, i) => i !== index);
      if (index === 0 && newFiles.length > 0) {
        newFiles[0].isCover = true;
      }
      setFiles(newFiles);
    } catch (error) {
      console.log('error', error);
    }
  };

  const setCover = (index: number) => {
    const newFiles = files.map((_, i) => ({ ..._, isCover: i === index }));
    setFiles(newFiles);
  };

  const handleSubmit = async () => {
    const documents = await Promise.all(
      files
        .filter((doc) => doc.remote === false)
        .map(async (file) => {
          const base64Content = await convertFileToBase64(file.file);
          return {
            FileName: file.file.name,
            FileExtention: file.file.name.split('.').pop(),
            DocumentTypeId: file.isCover ? EUploadDocumentType.CoverImage : EUploadDocumentType.NonCoverImage,
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
      navigate(
        isUpdate ? `/upload-property-documents?update=true&residenceId=${residentDetails.facilityId}` : '/upload-property-documents',
        {
          state: { fullEdit: location.state?.fullEdit },
        }
      );
    }
  }, [isSuccess]);

  const handleBackClick = () => {
    navigate(`/more-about-property?update=true`);
  };

  const { data: prevData } = useFacilityRetrievePrevFacilityDataQuery(
    {
      FacilityId: residentDetails.facilityId,
      Page: 'upload-property-images',
    },
    { skip: !isUpdate }
  );

  const handleUpdateCoverImage = (FacilityDocLibId) => {
    updateCoverImage({
      body: {
        entityName: 'FacilityDocLib',
        recordId: FacilityDocLibId,
        requestName: 'UpsertRecordReq',
        InputParamters: {
          Entity: {
            DocumentTypeId: 889,
          },
        },
      },
    });
  };

  useEffect(() => {
    if (isUpdate && prevData && prevData.documents) {
      setFiles([
        ...prevData.documents.map((doc: TRemoteFile) => ({
          isCover: doc.documentTypeId === EUploadDocumentType.CoverImage,
          file: doc,
          preview: ['jpg', 'png', 'jpeg'].includes(doc.fileExtention) ? `data:image/jpeg;base64,${doc.fileContent}` : undefined,
          remote: true,
        })),
      ]);
    }
  }, [prevData, isUpdate]);

  const shouldDisableBackButton = residenceDetails.fullEdit === false;

  if (isSuccessCover) {
    showSuccessToast('Cover Image Updated Successfully');
  }
  if (isErrorCover) {
    showErrorToast('Error Updating Cover Image');
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4 max-w-[1200px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Progress Steps */}
          <Sidebar currentStep={4} />

          <div className="lg:col-span-9">
            <Card>
              <CardHeader>
                <CardTitle>Upload Property Images</CardTitle>
                <CardDescription>Please upload pictures of your property (Minimum of 4 images)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div
                  className={cn(
                    'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer',
                    isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-300',
                    files.length === 0 ? 'h-64' : 'h-auto'
                  )}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <input type="file" multiple accept="image/*" className="hidden" id="file-upload" onChange={handleFileChange} />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <Upload className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium">Drop your images here or click to upload</p>
                      <p className="text-sm text-gray-500 mt-2">Please include photos of:</p>
                      <ul className="text-sm text-gray-500 mt-1">
                        <li>• Outdoor</li>
                        <li>• Room / Bedroom</li>
                        <li>• Kitchen / Kitchenette</li>
                        <li>• Bathroom</li>
                      </ul>
                    </div>
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {files.map((file, index) => {
                      return (
                        <div key={index} className="relative group">
                          {file.isCover && (
                            <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">Cover</div>
                          )}
                          <img src={file.preview || ''} alt={`Preview ${index}`} className="w-full h-40 object-cover rounded-lg" />
                          <button
                            disabled={isDeletingRecordReq}
                            onClick={() => removeFile(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-wait"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <button
                            disabled={isDeletingRecordReq}
                            onClick={() => {
                              if (isUpdate) {
                                handleUpdateCoverImage(file.file.recordId);
                              }
                              setCover(index);
                            }}
                            className="absolute bottom-2 right-2 left-2 bg-gray-400 text-black text-md rounded-sm shadow-sm p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-wait"
                          >
                            Set Cover
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  <Button variant="outline" type="button" onClick={handleBackClick} disabled={shouldDisableBackButton}>
                    Back
                  </Button>
                  <Button
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={handleSubmit}
                    disabled={isLoading || files.length < 4 || files.length > 10}
                  >
                    {isLoading ? 'Uploading...' : 'Next'}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                {files.length > 0 && files.length < 4 && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <Info className="h-4 w-4" />
                    Please upload at least 4 images
                  </div>
                )}
                {files.length > 10 && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <Info className="h-4 w-4" />
                    Please upload at most 10 images
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

export default UploadImages;
