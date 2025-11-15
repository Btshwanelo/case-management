import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import EmptyStateIcon from '@/assets/NoDocuments__1.png';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { FileText, MoreVertical, ExternalLink, Building, MapPin, Search, X, CheckCircle, Download, View } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useExecuteRequest1Mutation, useGetOfferLettersQuery, useOfferLettersListingReqMutation } from '@/services/apiService';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import PageLoder from '@/components/PageLoder';
import Breadcrumb from '@/components/BreadCrumb';
import InsightCard from '@/components/InsightCard';
import ErrorPage from '@/components/ErrorPage';
import EmptyState from '@/components/EmptyState';
import EnhancedPagination from '@/components/EnhancedPagination';
import { getStatusBadgeClass } from '@/utils';
import { showMessageToast } from '@/components/MessageToast';
import { useGenerateOfferLetterPDFMutation } from '@/services/facilityService';
import FilePreviewModal from '@/components/FilePreviewModal';
import { Spinner } from '@/components/ui/spinner';

const OfferLettersScreen = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isSearch, setIsSearch] = useState(false);
  const [statusActionFilterValue, setStatusActionFilterValue] = useState('');
  const [loaderType, setLoaderType] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [offerId, setOfferId] = useState('');
  const [pageSize, setPageSize] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const userDetails = useSelector((state: RootState) => state.details.requestResults);
  const dispatch = useDispatch();
  const itemsPerPage = 5;

  const [
    offerLettersListingReq,
    {
      data: offerLetters,
      isLoading: isLoadungOfferLetters,
      isSuccess: isSuccessOfferLetters,
      isError: isErrorOfferLetters,
      error: errorOfferLetters,
    },
  ] = useOfferLettersListingReqMutation();
  const [GenerateOfferLetterPDF, generateProps] = useGenerateOfferLetterPDFMutation();
  const [GenerateCertificate, generateCertificateProps] = useExecuteRequest1Mutation();

  useEffect(() => {
    offerLettersListingReq({
      body: {
        entityName: 'OfferLetter',
        requestName: 'OfferLettersListingReq',
        inputParamters: {
          AccommodationProviderId: userDetails?.supplierId,
          Filters: [],
          SearchText: searchText,
          PageNumber: pageNumber,
          PageSize: pageSize,
          Status: statusFilter,
        },
      },
    });
  }, [isSearch, pageNumber, statusFilter]);

  const handleViewDocument = (url) => {
    if (url === null) {
      showMessageToast(
        `Your offer letter is being prepared! You'll receive an email with the offer letter document shortly. You can also check back here in a few minutes to sign it. If the letter is not available in 2hours, please contact support for assistance!`
      );
      return;
    } else {
      window.open(url, '_blank');
    }
  };
  const handleViewOffer = (inspectionId) => {
    setOfferId(inspectionId);
    GenerateOfferLetterPDF({
      body: {
        entityName: 'Facility',
        requestName: 'GenerateOfferLetterPDF',
        RecordId: inspectionId,
      },
    });
  };
  const handleViewCertificate = (inspectionId) => {
    setOfferId(inspectionId);
    GenerateCertificate({
      body: {
        EntityName: 'Inspection',
        RecordId: inspectionId,
        RequestName: 'GenerateAccredationCertificateExecuteRequest',
      },
    });
  };

  const summaryData = [
    {
      title: 'Total Offers',
      value: offerLetters?.Summary.totalOfferLetters,
      subtitle: 'Offer Letters',
      icon: <Building className="h-5 w-5 text-green-500" />,
      bgColor: 'bg-green-200',
    },
    {
      title: 'Pending',
      value: offerLetters?.Summary.pendingAcceptance,
      subtitle: 'Offer Letters',
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      bgColor: 'bg-blue-200',
    },
    {
      title: 'Approved',
      value: offerLetters?.Summary.approved,
      subtitle: 'Offer Letters',
      icon: <Building className="h-5 w-5 text-yellow-500" />,
      bgColor: 'bg-yellow-200',
    },
    {
      title: 'Rejected',
      value: offerLetters?.Summary.rejected,
      subtitle: 'Offer Letters',
      icon: <CheckCircle className="h-5 w-5 text-red-500" />,
      bgColor: 'bg-red-200',
    },
  ];

  const totalRecords = offerLetters?.RecordCount;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const breadcrumbItems = [{ path: '/offer-letter', label: 'Offer Letters' }];

  return (
    <DashboardLayout>
      <div className="">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {isErrorOfferLetters && <ErrorPage message={errorOfferLetters.data} />}
      {isLoadungOfferLetters && <PageLoder />}
      {generateProps.isSuccess && (
        <FilePreviewModal
          fileContent={generateProps?.data.results}
          fileName={'Offer Letter'}
          fileExtension={'pdf'}
          onClose={() => generateProps.reset()}
        />
      )}
      {generateCertificateProps.isSuccess && (
        <FilePreviewModal
          fileContent={generateCertificateProps?.data.results}
          fileName={'Certificate'}
          fileExtension={'pdf'}
          onClose={() => generateCertificateProps.reset()}
        />
      )}

      {isSuccessOfferLetters && (
        <div className=" space-y-6">
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 pb-3s">
            {summaryData.map((item, index) => (
              <InsightCard
                key={index}
                icon={item.icon}
                title={item.title}
                value={item.value}
                subtitle={item.subtitle}
                iconBgColor={item.bgColor}
              />
            ))}
          </div>

          {isSearch && (
            <div className="bg-blue-100  px-6 py-2 rounded-lg text-blue-600 font-semibold flex justify-between">
              <div>
                <span className="text-black"> Showing search results for </span> {searchText}
              </div>{' '}
              <X
                className="text-red-500 cursor-pointer"
                onClick={() => {
                  setSearchText('');
                  setIsSearch(!isSearch);
                }}
              />{' '}
            </div>
          )}

          {/* Table Card */}
          <Card className="rounded-md">
            <CardHeader>
              <CardTitle>All Offer Letters</CardTitle>
              <CardDescription>A list of all your property offer letters and their current status.</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col md:flex-row  justify-between mb-6 gap-2">
                <div className="flex flex-row gap-2 w-full md:w-1/3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search offer letters..."
                      className="pl-10 pr-8"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                    {searchText && (
                      <button
                        onClick={() => {
                          setSearchText('');
                          setIsSearch(!isSearch);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-75 transition-opacity"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                  <Button variant="outline" className="bg-orange-500 hover:bg-orange-600" onClick={() => setIsSearch(!isSearch)}>
                    <Search className="h-4 w-4 text-white" />
                  </Button>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="PendingAcceptance">Pending Acceptence</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Residence</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Total Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offerLetters.Listing.map((offer) => (
                    <TableRow key={offer.OfferLettersId}>
                      <TableCell className="font-medium">{offer.propertyName}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{offer.address}</span>
                        </div>
                      </TableCell>
                      <TableCell>{offer.totalCapacity}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeClass(offer.offerStatus)}>{offer.offerStatus}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={generateProps.isLoading || generateCertificateProps.isLoading}
                              className="border border-orange-500 text-orange-500 hover:text-orange-500"
                            >
                              {offerId === offer.inspectionId && (generateProps.isLoading || generateCertificateProps.isLoading) ? (
                                <Spinner />
                              ) : (
                                `Actions`
                              )}
                              {offerId != offer.inspectionId || (generateProps.isLoading && `Actions`)}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewOffer(offer.inspectionId)}
                              className="flex items-center font-semibold"
                            >
                              <Download className="mr-2 h-4 w-4" /> View Offer Letter
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleViewDocument(offer.documentURL)}
                              className="flex items-center font-semibold"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Reply Slip
                            </DropdownMenuItem>

                            {offer.offerStatus === 'Approved' && (
                              <DropdownMenuItem
                                onClick={() => handleViewCertificate(offer.inspectionId)}
                                className="flex items-center font-semibold"
                              >
                                <View className="mr-2 h-4 w-4" /> View Certificate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {offerLetters.Listing.length > 0 && (
                <div className="mt-4">
                  <EnhancedPagination
                    currentPage={pageNumber}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                      setLoaderType('pagination');
                      setPageNumber(page);
                    }}
                  />
                </div>
              )}

              {offerLetters.Listing.length < 1 && (
                <EmptyState
                  title="No offer letters found"
                  description="Create your first item to get started"
                  icon={EmptyStateIcon}
                  // action={{
                  //   label: 'View Applications',
                  //   onClick: () => navigate('/residences'),
                  // }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OfferLettersScreen;
