import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ChevronRight, Cloud, UserCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useGetCaseDetailsMutation, useInvestigationLineMutation } from '@/services/apiService';
import { useParams } from 'react-router-dom';
import { convertFileToBase64, getId, getStatusBadgeClass } from '@/utils';
import { Spinner } from '@/components/ui/spinner';
import PageLoder from '@/components/PageLoder';
import { Badge } from '@/components/ui/badge';
import Breadcrumb from '@/components/BreadCrumb';
import ErrorPage from '@/components/ErrorPage';
import { showErrorToast } from '@/components/ErrorToast ';

const CaseDetails = () => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');
  const { id } = useParams();

  const [
    getCaseDetails,
    {
      data: CaseDetails,
      isLoading: isLoadingCaseDetails,
      isError: isErrorCaseDetails,
      isSuccess: isSuccessCaseDetails,
      error: errorCaseDetails,
    },
  ] = useGetCaseDetailsMutation();

  const [
    investigationLine,
    {
      isLoading: isLoadingInvestigationLine,
      isSuccess: isSuccessInvestigationLine,
      error: errorInvestigationLine,
      isError: isErrorInvestigationLine,
    },
  ] = useInvestigationLineMutation();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
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
              // Add preview URL for image files
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

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    await handleFileUpload(droppedFiles);
  };

  const handleFileInput = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    await handleFileUpload(selectedFiles);
    e.target.value = ''; // Reset input
  };

  const removeFile = (fileId) => {
    setFiles(files.filter((file) => file.id !== fileId));
  };

  const handleReply = () => {
    if (!reply.trim()) {
      setError('Please enter a reply before submitting.');
      return;
    }

    setError('');
    investigationLine({
      body: {
        entityName: 'InvestigationLine',
        requestName: 'UpsertRecordReq',
        inputParamters: {
          Entity: {
            Description: reply,
            CaseId: id,
            Direction: 560,
          },
          Documents: files,
        },
      },
    });
  };

  useEffect(() => {
    getCaseDetails({
      body: {
        entityName: 'Cases',
        requestName: 'RetrieveCaseDetailsReq',
        inputParamters: {
          CasesId: id,
        },
      },
    });
  }, []);

  useEffect(() => {
    if (isSuccessInvestigationLine) {
      setReply('');
      setFiles([]);
      getCaseDetails({
        body: {
          entityName: 'Cases',
          requestName: 'RetrieveCaseDetailsReq',
          inputParamters: {
            CasesId: id,
          },
        },
      });
    }
  }, [isSuccessInvestigationLine]);

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

  const breadcrumbItems = [
    // { path: '/cases', label: 'Cases' },
    { path: '/cases', label: 'Case Details' },
  ];

  if (isErrorInvestigationLine) {
    showErrorToast(errorInvestigationLine.data);
  }
  return (
    <DashboardLayout>
      <Breadcrumb items={breadcrumbItems} />

      {isLoadingCaseDetails && <PageLoder />}
      {isErrorCaseDetails && <ErrorPage message={errorCaseDetails.data} />}
      {isSuccessCaseDetails && (
        <div className="container mx-auto ">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Left Sidebar - Case Information */}
            <Card className="md:col-span-1 h-fit">
              <CardContent className="p-6 space-y-10">
                <h2 className="font-semibold text-lg">Case Information</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Requestor</p>
                    <p className="font-medium">
                      {CaseDetails?.CaseInformation[0].customerIdName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Submitted</p>
                    <p>{CaseDetails?.CaseInformation[0].submitted}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p>{CaseDetails?.CaseInformation[0].lastUpdated}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status/Priority</p>

                    <Badge
                      variant={getStatusBadgeClass(
                        CaseDetails?.CaseInformation[0].casesStatus
                      )}
                    >
                      {CaseDetails?.CaseInformation[0].casesStatus}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content Area */}
            <div className="md:col-span-3 space-y-6">
              <div>
                <h1 className="text-2xl font-semibold mb-2">
                  Case {CaseDetails?.CaseInformation[0].caseNumber}
                </h1>
                <p className="text-gray-600">Investigation Information</p>
              </div>

              {/* Messages */}
              {CaseDetails?.InvestigationLines.map((item) => (
                <Card key={item.investigationId}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <span className="bg-blue-200 p-2 rounded-md">
                        <UserCircle className="h-8 w-8 text-gray-700" />
                      </span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2 border-b ">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-sm text-gray-500">
                            {item.caseNumber}
                          </span>
                        </div>
                        <p>{item.description}</p>
                      </div>
                    </div>
                    {item?.documents?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {item?.documents?.map((doc) => (
                          <div
                            key={doc.fileName}
                            className="flex items-center justify-between bg-gray-50 p-2 rounded-md mb-2"
                          >
                            <div className="flex items-center space-x-2">
                              {doc.fileName}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Reply Section */}
              <Card className="">
                <CardContent className="p-6 space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Textarea
                    placeholder="Add reply..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    className="min-h-[100px]"
                  />

                  {/* File Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center ${
                      isDragging
                        ? "border-[#0086C9] bg-orange-50"
                        : "border-gray-200"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Cloud className="h-6 w-6 text-gray-400" />
                      <div>
                        <Button
                          variant="link"
                          className="text-[#0086C9] p-0 h-auto font-normal"
                          onClick={() =>
                            document.getElementById("file-upload").click()
                          }
                        >
                          Click to Upload
                        </Button>
                        <span className="text-gray-600"> or drag and drop</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        .SVG, .PNG, .JPG, .JPEG, .GIF, .PDF (max. 4MB)
                      </p>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        multiple
                        accept=".svg,.png,.jpg,.jpeg,.gif,.pdf"
                        onChange={handleFileInput}
                      />
                    </div>
                  </div>

                  {/* File Preview Section */}
                  {files.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">
                        Uploaded Files
                      </h3>
                      <div className="space-y-2">
                        {files.map((file) => (
                          <FilePreview key={file.id} file={file} />
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full bg-[#0086C9] hover:bg-[#0086C9]"
                    onClick={handleReply}
                    disabled={isLoadingInvestigationLine || !reply.trim()}
                  >
                    {isLoadingInvestigationLine ? (
                      <Spinner className="text-white" />
                    ) : (
                      "Reply"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CaseDetails;
