import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import EmptyStateIcon from '@/assets/NoDocuments__1.png';

import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  MoreVertical,
  Download,
  FileText,
  ExternalLink,
  AlertCircle,
  BanknoteIcon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  CheckCircle,
  Banknote,
  Calendar1,
  WalletIcon,
  FileDigit,
} from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { authSlice, useGetAPInvoicesMutation, useInvoiceMutation } from '@/services/apiService';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useNavigate } from 'react-router-dom';
import PDFViewer from './PDFViewr';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageLoder from '@/components/PageLoder';
import { getStatusBadgeClass } from '@/utils';
import Breadcrumb from '@/components/BreadCrumb';
import InsightCard from '@/components/InsightCard';
import ErrorPage from '@/components/ErrorPage';
import EmptyState from '@/components/EmptyState';
import EnhancedPagination from '@/components/EnhancedPagination';
import { useGetListingActionsMutation } from '@/services/portalListingService';
import FilterPopover from '../AP/Tenants/Filter';
import { createNewFilterArray } from '@/utils/helpers';
import FilePreviewModal from '@/components/FilePreviewModal';
import { useExportBillingListingReqMutation } from '@/services/monthlyRentalService';

const InvoicesScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isSearch, setIsSearch] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [loaderType, setLoaderType] = useState('');

  const [pageSize, setPageSize] = useState(12);
  const [filters, setFilters] = useState([]);

  const [bulkActionState, setBulkActionState] = useState({
    actions: [],
    selectedAction: 'All',
  });

  const [searchText, setSearchText] = useState('');
  const userDetails = useSelector((state: RootState) => state.details.requestResults);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [invoiceActionType, setInvoiceActionType] = useState('view');
  const [GetListingActions, actionsProps] = useGetListingActionsMutation();
  const [ExportBillingListingReq, exportProps] = useExportBillingListingReqMutation();

  const [
    getAPInvoices,
    {
      data: apInvoices,
      isLoading: isLoadingApInvoices,
      isSuccess: isSuccessApInvoices,
      isError: isErrorApInvoices,
      error: errorApInvoices,
    },
  ] = useGetAPInvoicesMutation();

  useEffect(() => {
    GetListingActions({
      body: {
        entityName: 'PortalListing',
        requestName: 'GetListingActions',
        inputParamters: {
          UserId: userDetails.supplierId,
          UserType: 'Supplier',
          PageRoute: '/invoice',
          PageName: 'Invoice',
        },
      },
    });
  }, []);

  const [
    invoice,
    {
      data: apDownloadInvoices,
      isLoading: isLoadingApDownloadInvoices,
      isSuccess: isSuccessApDownloadInvoices,
      isError: isErrorApDownloadInvoices,
      error: errorApDownloadInvoices,
    },
  ] = useInvoiceMutation();

  const formatCurrency = (amount) => {
    if (amount >= 1_000_000) {
      return `R${(amount / 1_000_000).toFixed(2)}M`;
    }
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewInvoice = (invoiceId) => {
    setInvoiceActionType('view');

    invoice({
      body: {
        entityName: 'Invoice',
        recordId: invoiceId,
        requestName: 'DownloadRecordExecuteRequest',
        inputParamters: {
          Format: 'PDF',
        },
      },
    });
  };

  const handleExport = () => {
    ExportBillingListingReq({
      body: {
        entityName: 'Invoice',
        requestName: 'ExportInvoiceListingReq',
        inputParamters: {
          supplierId: userDetails.supplierId,
        },
      },
    });
  };

  const downloadFiles = async (data: { name: string; extension: string; content: unknown }) => {
    const a = document.createElement('a');
    a.download = data.name + '.' + data.extension;
    a.href = `data:text/${data.extension};base64,${data.content}`;
    a.click();
  };
  useEffect(() => {
    if (exportProps.isSuccess) {
      downloadFiles({ name: exportProps.data?.file[0]?.name, extension: 'xlsx', content: exportProps.data?.file[0]?.content });
    }
  }, [exportProps.isSuccess]);

  const handleDownloadInvoice = (invoiceId) => {
    setInvoiceActionType('download-invoice');
    invoice({
      body: {
        entityName: 'Invoice',
        recordId: invoiceId,
        requestName: 'DownloadRecordExecuteRequest',
        inputParamters: {
          Format: 'PDF',
        },
      },
    });
  };

  const downloadFile = async (data: { name: string; extension: string; content: unknown }) => {
    const a = document.createElement('a');
    a.download = data.name + '.' + data.extension;
    a.href = `data:application/${data.extension};base64,${data.content}`;
    a.click();
  };

  useEffect(() => {
    if (isSuccessApDownloadInvoices && invoiceActionType === 'download-invoice') {
      downloadFile({ name: apDownloadInvoices.Filename, extension: 'pdf', content: apDownloadInvoices.results });
    }
  }, [isSuccessApDownloadInvoices]);

  const handleDownloadReport = (invoiceId: string) => {
    // API call placeholder

    ExportBillingListingReq({
      body: {
        entityName: 'MonthlyRental',
        requestName: 'ExportBillingListingReq',
        inputParamters: {
          supplierId: userDetails.supplierId,
          invoiceId: invoiceId,
        },
      },
    });
  };

  const handleCreateDispute = (invoiceId: string) => {
    navigate('/cases/create');
  };
  const handleReleasePayment = (invoiceId: string) => {
    navigate(`/invoices/${invoiceId}/payment`);
  };

  useEffect(() => {
    getAPInvoices({
      body: {
        entityName: 'Invoice',
        requestName: 'GetAPInvoicesExecuteReq',
        inputParamters: {
          APInvoices: {
            UserId: userDetails.relatedObjectIdObjectTypeCode === 'Supplier' ? userDetails?.supplierId : userDetails?.recordId,
            PropertyId: 'All',
            Year: new Date().getFullYear(),
          },
          Filters: filters,
          Status: statusFilter,
          SearchText: searchText,
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      },
    });
  }, [isSearch, pageNumber, filters, bulkActionState]);

  const totalRecords = apInvoices?.RecordCount;
  const totalPages = Math.ceil(totalRecords / pageSize);

  const summaryData = [
    {
      title: 'Paid to Date',
      value: formatCurrency(apInvoices?.InvoiceSummary?.billed),
      subtitle: 'Total Paid',
      icon: <Banknote className="h-5 w-5 text-blue-500" />,
      bgColor: 'bg-blue-200',
    },
    {
      title: 'Paid This Month',
      value: formatCurrency(apInvoices?.InvoiceSummary?.paid),
      subtitle: 'Current Month',
      icon: <Calendar1 className="h-5 w-5 text-green-500" />,
      bgColor: 'bg-green-200',
    },

    {
      title: 'Pending Payment',
      value: formatCurrency(apInvoices?.InvoiceSummary?.pending),
      subtitle: 'Outstanding',
      icon: <WalletIcon className="h-5 w-5 text-yellow-500" />,
      bgColor: 'bg-yellow-200',
    },
    {
      title: 'Tenants / Students Paid',
      value: apInvoices?.InvoiceSummary?.activeTenantVsStudentPaid,
      subtitle: 'Under Review',
      icon: <FileDigit className="h-5 w-5 text-purple-500" />,
      bgColor: 'bg-red-200',
    },
  ];

  const handleApplyFilters = (values: any) => {
    if (!actionsProps?.data?.ListingActionFilters) return;

    const nonBulkActionFilters = actionsProps?.data?.ListingActionFilters.filter((filter: any) => !filter.isBulkAction);

    const newArr = createNewFilterArray(nonBulkActionFilters, values);
    setFilters(newArr);
  };

  const breadcrumbItems = [{ path: '/Invoices', label: 'Invoices' }];

  return (
    <DashboardLayout>
      <Breadcrumb items={breadcrumbItems} />

      {isErrorApInvoices && <ErrorPage message={errorApInvoices.data} />}
      {isLoadingApInvoices && <PageLoder />}
      {isSuccessApDownloadInvoices && invoiceActionType === 'view' && (
        <FilePreviewModal
          fileContent={apDownloadInvoices.results}
          fileName={apDownloadInvoices.Filename}
          fileExtension={'pdf'}
          onClose={() => setInvoiceActionType('')}
        />
      )}

      {isSuccessApInvoices && (
        <div className=" mx-auto  space-y-6 b">
          <FilterPopover filters={actionsProps?.data?.ListingActionFilters} onApplyFilters={handleApplyFilters} />

          {/* Insight Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-2">
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

          {/* Search and Filter Section */}
          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle className="text-xl">
                <CardTitle className="text-xl flex justify-between">
                  <div>All Invoices</div>
                  {/* <div className="flex gap-2">
                                    <Button variant="default" disabled={exportProps.isLoading} type="button" onClick={handleExport}>
                                      <Download /> {exportProps.isLoading ? "Exporting...":"Export"}
                                    </Button>
                                  </div> */}
                </CardTitle>
              </CardTitle>
              <CardDescription>View and manage your property invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row  justify-between mb-6 gap-2">
                <div className="flex flex-row gap-2 w-full md:w-1/3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search invoices..."
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

                <div className="flex flex-row gap-2">
                  {actionsProps.data?.ListingActionFilters.map(
                    (action, index) =>
                      action.isBulkAction === true && (
                        <Select
                          key={index}
                          value={statusFilter}
                          onValueChange={(value) => {
                            const filteredItem = action?.actionFilters.find((item) => item.filterName === value);

                            const filteredItem2 = action?.actionFilters
                              .filter((item) => item.filterName === value) // Filter for items with "filterName" as "Lapsed"
                              .map((item) => ({
                                PortalListingId: action.portalListingId, // Static value as per the requirement
                                ActionFilterId: item.portalListingFilterId, // Map portalListingFilterId to ActionFilterId
                              }));

                            if (filteredItem) {
                              setBulkActionState({
                                actions: filteredItem.actions,
                                selectedAction: filteredItem.filterName,
                              });
                              setFilters(filteredItem2);
                            } else {
                              console.error(`No matching item found for filterName: ${value}`);
                            }

                            setStatusFilter(value);
                            setPageNumber(1); //reset page number
                          }}
                        >
                          {' '}
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={action?.label} />
                          </SelectTrigger>
                          <SelectContent>
                            {action.actionFilters.map((filter) => (
                              <SelectItem key={filter.portalListingFilterId} value={filter.filterName}>
                                {filter.filterName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )
                  )}

                  {bulkActionState.actions.length > 0 && (
                    <Select
                      value={bulkActionState.selectedAction}
                      onValueChange={(value) => setBulkActionState((prev) => ({ ...prev, selectedAction: value }))}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Bulk Action" />
                      </SelectTrigger>
                      <SelectContent>
                        {bulkActionState.actions.length > 0 ? (
                          bulkActionState.actions.map((action) => (
                            <SelectItem key={action.actionName} value={action.actionName}>
                              {action.actionName}
                            </SelectItem>
                          ))
                        ) : (
                          <p>No Action</p>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* Invoices Table */}
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Residence</TableHead>
                    <TableHead>Invoice Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apInvoices?.InvoiceDetails.map((invoice) => (
                    <TableRow key={invoice.invoiceId}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.propertyName}</TableCell>
                      <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                      <TableCell>{formatCurrency(invoice.invoiceTotal)}</TableCell>
                      <TableCell>{formatDate(invoice.paymentDate)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeClass(invoice.invoiceStatus)}>{invoice.invoiceStatus}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="border border-orange-500 text-orange-500 hover:text-orange-500">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewInvoice(invoice.invoiceId)}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice.invoiceId)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadReport(invoice.invoiceId)}>
                              <FileText className="mr-2 h-4 w-4" />
                              Download Report
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleCreateDispute(invoice.invoiceId)}>
                              <AlertCircle className="mr-2 h-4 w-4" />
                              Create Dispute
                            </DropdownMenuItem>
                            {invoice.invoiceStatus === 'Processed' && (
                              <DropdownMenuItem onClick={() => handleReleasePayment(invoice.invoiceId)}>
                                <BanknoteIcon className="mr-2 h-4 w-4" />
                                Release Payment
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {apInvoices?.InvoiceDetails.length > 0 && (
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

              {isSuccessApInvoices && apInvoices?.InvoiceDetails.length < 1 && (
                <EmptyState title="No invoices found" description="Create your first item to get started" icon={EmptyStateIcon} />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default InvoicesScreen;
