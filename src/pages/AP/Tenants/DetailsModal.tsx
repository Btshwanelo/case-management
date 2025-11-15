import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info as InfoIcon, User2 } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { getStatusBadgeClass } from '@/utils';
import SignWellWindow from '@/components/SignWellWindow';
import { ButtonLoader } from '@/components/ui/button-loader';

const StudentProfileModal = ({
  open,
  onSignLease,
  onViewLease,
  onTerminate,
  isLoadingSignWell,
  isLoadingAccomodation,
  onOpenChange,
  onRegenerate,
  isLoadingTerminate,
  data,
  isLoading,
  isSuccess,
  isLoadingRegenerate,
  isError,
  error,
}) => {
  const [selectedAction, setSelectedAction] = useState('');
  console.log('open', open);
  const getActionHandler = (action, index) => () => {
    switch (action) {
      case 'Sign Lease':
        setSelectedAction('Sign Lease');
        onSignLease('Sign Lease');
        break;
      case 'Regenerate':
        setSelectedAction('Regenerate');
        onRegenerate('Regenerate');
        break;
      case 'View Lease':
        setSelectedAction('View Lease');
        onViewLease('View Lease');
        break;
      case 'Terminate':
        setSelectedAction('Terminate');
        onTerminate('Terminate');
        break;
      case 'Renew':
        break;
      default:
        console.log('action not handled');
    }
  };

  return (
    <>
      <div />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="pl-6 text-2xl flex items-center gap-3 justify-start">
              <User2 /> Student Profile
            </DialogTitle>
          </DialogHeader>
          {isLoading && <Spinner size="large" />}
          {isError && <div className="font-medium">{error.data}</div>}
          {isSuccess && (
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-[300px,1fr] gap-6">
                {/* Left Sidebar */}

                <div className="space-y-6">
                  {/* Profile Card */}
                  <Card className="bg-gray-50">
                    <CardContent className="p-6">
                      <div className="border-b border-gray-300 mb-4 pb-4">
                        <h2 className="text-xl font-semibold">{data?.StudentDetails.name}</h2>
                        <p className="text-gray-700">{data?.StudentDetails.email}</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-2">Personal Info</h3>
                          <div className="space-y-3">
                            <div className="border-b border-gray-300 mb-4 pb-4">
                              <div className="text-sm text-gray-700">Cellphone</div>
                              <div>{data?.StudentDetails.email}</div>
                            </div>
                            <div className="border-b border-gray-300 mb-4 pb-4">
                              <div className="text-sm text-gray-700">ID Number</div>
                              <div>{data?.StudentDetails.idNumber}</div>
                            </div>

                            <div className="border-b border-gray-300 mb-4 pb-4">
                              <div className="text-sm text-gray-700">Term Type</div>
                              <div>{data?.StudentDetails.termTypetext}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-gray-50">
                      <CardContent className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Lease History</h2>
                        {data?.LeaseDetails.map((lease, index) => (
                          <div key={index} className="border-b border-gray-300 mb-4 pb-4">
                            <div className="flex justify-between mb-2">
                              <div className="font-medium">{lease.title}</div>
                              {lease.status != null && lease.status != '' && (
                                <Badge className="" variant={getStatusBadgeClass(lease.status)}>
                                  {lease.status}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-700">{lease.value}</div>
                          </div>
                        ))}
                        {data?.LeaseDetails.length < 1 && <div className="font-medium mt-9 justify-self-center">No lease history</div>}
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-50">
                      <CardContent className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Funding Status</h2>
                        {data?.FundingStatus.map((lease, index) => (
                          <div key={index} className="border-b border-gray-300 mb-4 pb-4">
                            <div className="flex justify-between mb-2">
                              <div className="font-medium">{lease.title}</div>
                              <Badge variant={getStatusBadgeClass(lease.status)}>{lease.status}</Badge>
                            </div>
                            <div className="text-sm text-gray-700">{lease.value}</div>
                          </div>
                        ))}
                        {data?.FundingStatus.length < 1 && <div className="font-medium mt-9 justify-self-center">No funding history</div>}
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-gray-50">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-2">Summary</h2>
                      <p className="text-gray-700 mb-4">A quick summary of the student's current status and what you can do about it.</p>
                      <div className="bg-white p-4 rounded-lg border flex gap-3">
                        <InfoIcon className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-medium mb-2">{data?.Notice[0].message}</div>
                          <p className="text-gray-700 text-sm">{data?.Notice[0].description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {data?.Actions?.length > 0 && (
                    <Card className="bg-gray-50">
                      <CardContent className="p-6">
                        <h2 className="text-xl font-semibold mb-2">Actions</h2>
                        <p className="text-gray-700 mb-4">These are the actions you can take based on the student's profile</p>

                        <div className="flex max-h- flex-wrap gap-4">
                          {data?.Actions.map((item, index) => (
                            <Button
                              key={index}
                              onClick={getActionHandler(item, index)}
                              className="bg-orange-500 hover:bg-orange-600 max-w-28 flex-1 md:flex-none"
                              size="lg"
                              disabled={isLoadingSignWell || isLoadingAccomodation || isLoadingRegenerate || isLoadingTerminate}
                            >
                              {selectedAction === item &&
                                (isLoadingSignWell || isLoadingAccomodation || isLoadingRegenerate || isLoadingTerminate) && (
                                  <ButtonLoader className="text-white" />
                                )}{' '}
                              {item}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StudentProfileModal;
