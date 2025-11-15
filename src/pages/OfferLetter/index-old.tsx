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
import { FileText, MoreVertical, ExternalLink, Building, MapPin, Search, X, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useGetOfferLettersQuery, useOfferLettersListingReqMutation } from '@/services/apiService';
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

const OfferLettersScreen = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isSearch, setIsSearch] = useState(false);
  const [statusActionFilterValue, setStatusActionFilterValue] = useState('');
  const [loaderType, setLoaderType] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
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

  useEffect(() => {
    console.log({
      AccommodationProviderId: userDetails?.supplierId,
      Filters: [],
      SearchText: searchText,
      PageNumber: pageNumber,
      PageSize: pageSize,
      Status: statusFilter,
    });
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

  console.log({
    data: offerLetters,
    isLoading: isLoadungOfferLetters,
    isSuccess: isSuccessOfferLetters,
    isError: isErrorOfferLetters,
    error: errorOfferLetters,
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      default:
        return 'pending';
    }
  };

  const handleViewDocument = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2 w-1/3">
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
                    <TableHead>Property Name</TableHead>
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
                        <Badge variant={getStatusColor(offer.OfferStatus)}>{offer.offerStatus}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="border border-orange-500 text-orange-500 hover:text-orange-500">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {offer.documentURL && (
                              <DropdownMenuItem onClick={() => handleViewDocument(offer.documentURL)} className="flex items-center">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Document
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {/* {offerLetters.Listing.length > 0 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => {
                            setLoaderType('pagination');
                            setPageNumber((p) => Math.max(1, p - 1));
                          }}
                          disabled={pageNumber === 1}
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i + 1}>
                          <PaginationLink
                            onClick={() => {
                              setLoaderType('pagination');
                              setPageNumber(i + 1);
                            }}
                            isActive={pageNumber === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => {
                            setLoaderType('pagination');
                            setPageNumber((p) => Math.min(totalPages, p + 1));
                          }}
                          disabled={pageNumber === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )} */}

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
