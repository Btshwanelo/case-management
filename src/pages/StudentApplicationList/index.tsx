import { useEffect, useRef, useState } from 'react';
import {
  useEmployeeMutation,
  useExportStudentsMutation,
  useGetTenantListingActionMutation,
  useLazyRetrieveInstitutionStudentApplicationsQuery,
  useRetrieveInstitutionStudentApplicationsQuery,
} from '@/services/apiService';
import { Search, UserCheck, Users, User, UserX, Pencil, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import DashboardLayout from '@/layouts/DashboardLayout';
import Breadcrumb from '@/components/BreadCrumb';
import InsightCard from '@/components/InsightCard';
import EmptyState from '@/components/EmptyState';
import EmptyStateIcon from '@/assets/NoDocuments__1.png';
import ErrorPage from '@/components/ErrorPage';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { X } from 'lucide-react';
import useCurrentUser from '@/hooks/useCurrentUser';
import { TAddPageMasterValuesApiResponse, TRetrieveInstitutionStudentApplicationsApiResponse } from '@/types/api-response-bodies';
import { cn } from '@/lib/utils';
import AsyncContent from '@/components/AsyncContent';
import { ButtonLoader } from '@/components/ui/button-loader';
import EnhancedPagination from '@/components/EnhancedPagination';
import StudentProfileModal from '../AP/Tenants/DetailsModal';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import { showSuccessToast } from '@/components/SuccessToast';
import { showErrorToast } from '@/components/ErrorToast ';
import FilterPopover from '../AP/Tenants/Filter';
import { getStatusBadgeClass } from '@/utils';
import { Badge } from '@/components/ui/badge';
import PageLoder from '@/components/PageLoder';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  usePrepopulateStudentInfoReqMutation,
  useStudentDetailsReqMutation,
  useUpsertAccomodationAppReqMutation,
} from '@/services/accomodationApplicationsEntity';
import { useRetrieveMasterValues1Mutation } from '@/services/masterValueService';
import ResidenceChangeModal from './ResidenceChangeModal';

type TEditableValues = Partial<Record<keyof TApplication, any>>;

type TApplication = TRetrieveInstitutionStudentApplicationsApiResponse['Listing'][number];
type TEditableCellProps = {
  data: TApplication;
  masterValues: TAddPageMasterValuesApiResponse;
  column: keyof TApplication;
  isEdit: boolean;
  onEditChange: (values: TEditableValues) => void;
  onResidenceChange?: (originalValue: string, newValue: string) => void;
};

const NEW_ROW_ID = 'new';
const NEW_ROW: TApplication = {
  studentName: { value: '(N/A)', inLineEdit: false, dataType: 'text', masterValueSchemaName: null },
  campusIdName: { value: '(N/A)', inLineEdit: false, dataType: 'text', masterValueSchemaName: null },
  idNumber: { value: '', inLineEdit: true, dataType: 'text', masterValueSchemaName: 'idNumber', validation: '^\\d{13}$' },
  gender: { value: '', inLineEdit: false, dataType: 'dropdown', masterValueSchemaName: null },
  facilityId: { value: '', inLineEdit: true, dataType: 'dropdown', masterValueSchemaName: 'FacilityId' },
  processCycle: { value: '', inLineEdit: true, dataType: 'dropdown', masterValueSchemaName: 'ProcessCycle' },
  studentTermType: { value: '', inLineEdit: true, dataType: 'dropdown', masterValueSchemaName: 'TermTypeId' },
  allowanceTypeId: { value: '', inLineEdit: true, dataType: 'dropdown', masterValueSchemaName: 'AllowanceTypeId' },
  studentStatus: { value: '', inLineEdit: false, dataType: 'dropdown', masterValueSchemaName: null },
  accomodationApplicationsId: { value: '', inLineEdit: false, dataType: 'text', masterValueSchemaName: null },
  facilityName: { value: '', inLineEdit: false, dataType: 'text', masterValueSchemaName: null },
  institutionIdName: { value: '', inLineEdit: false, dataType: 'text', masterValueSchemaName: null },
};

const EditableCell = ({ data, column, isEdit, masterValues, onEditChange, onResidenceChange }: TEditableCellProps) => {
  const cell = data[column];

  const [updatedValues, setEditingState] = useState(() => ({
    [column]: cell?.value,
  }));

  const originalValue = useRef(cell?.value);

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    // Check if this is the facilityId field and value has changed
    if (column === 'facilityId' && updatedValues[column] !== originalValue.current) {
      // If we have a residence change handler and the value is actually changing
      if (onResidenceChange && updatedValues[column] !== originalValue.current) {
        const originalLabel = getResidenceLabel(originalValue.current, masterValues);
        const newLabel = getResidenceLabel(updatedValues[column], masterValues);

        onResidenceChange(originalLabel, newLabel);
      }
    }

    onEditChange(updatedValues);
  }, [isEdit, updatedValues]);

  // Helper function to get the residence label from its value
  const getResidenceLabel = (value, masterValues) => {
    if (!masterValues?.staticData) return value;

    const facilityData = masterValues.staticData.find((item) => item.schemaName === cell?.masterValueSchemaName);

    const facilityMatch = facilityData?.options.find((item) => item.value === value);
    return facilityMatch?.lable || value;
  };

  if (!cell) {
    return null;
  }

  const renderValue = () => {
    const renderSpecialLabel = () => {
      const masterValueSchemaName = cell?.masterValueSchemaName;
      const facilityData = masterValues.staticData.find((item) => item.schemaName === masterValueSchemaName);
      const facilityMatch = facilityData?.options.find((item) => item.value === cell?.value);
      const label = facilityMatch?.lable;

      return label || cell?.value;
    };

    switch (column) {
      case 'facilityId':
      case 'processCycle':
      case 'allowanceTypeId':
      case 'studentTermType':
        return <div className="w-40 h-9 flex items-center">{renderSpecialLabel()}</div>;
      default:
        return cell?.value;
    }
  };

  if (cell?.inLineEdit && isEdit) {
    const type = cell?.dataType;
    if (type === 'text') {
      return (
        <Input
          value={updatedValues[column]}
          required={data.accomodationApplicationsId?.value === ''}
          className="bg-white"
          placeholder="Enter value"
          autoFocus
          pattern={cell.validation}
          onChange={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setEditingState({ [column]: e.target.value });
          }}
        />
      );
    }
    if (type === 'dropdown') {
      return (
        <Select
          value={updatedValues[column]}
          required={data.accomodationApplicationsId?.value === ''}
          onValueChange={(value) => setEditingState({ [column]: value })}
        >
          <SelectTrigger className="bg-white w-full pl-2">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {masterValues.staticData
              .find((item) => item.schemaName === cell?.masterValueSchemaName)
              ?.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.lable}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      );
    }
  }
  return renderValue();
};

interface FieldValue {
  value: string;
  inLineEdit: boolean;
  dataType: string | null;
  masterValueSchemaName: string | null;
}

interface ApplicationData {
  [key: string]: FieldValue | null;
}
const isEditable = (data: ApplicationData): boolean => {
  return Object.values(data).some((field) => field !== null && field.inLineEdit === true);
};

const StudentApplicationList = () => {
  const [errorCount, setErrorCount] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [{ recordId }, setEditingState] = useState({
    recordId: '',
  });
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [isSearch, setIsSearch] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const currentUser = useCurrentUser();
  const [filters, setFilters] = useState([]);
  const [pageSize, setPageSize] = useState(12);

  // State for residence change modal
  const [showResidenceModal, setShowResidenceModal] = useState(false);
  const [residenceChangeInfo, setResidenceChangeInfo] = useState({
    studentName: '',
    originalResidence: '',
    newResidence: '',
  });

  const [loaderType, setLoaderType] = useState('');
  const userDetails = useSelector((state: RootState) => state.details.requestResults);

  const editedValuesRef = useRef<TEditableValues>({});
  const originalResidenceValueRef = useRef('');
  const pendingResidenceChangeRef = useRef('');

  const onEditChangeHandlerRef = useRef((values: TEditableValues) => {
    editedValuesRef.current = {
      ...editedValuesRef.current,
      ...values,
    };
  });

  const [bulkActionState, setBulkActionState] = useState({
    actions: [],
    selectedAction: 'All',
  });

  const [UpsertAccomodationAppReq, upsertProps] = useUpsertAccomodationAppReqMutation();
  const [exportStudents, exportProps] = useExportStudentsMutation();
  const [RetrieveMasterValues1, masterValie1Props] = useRetrieveMasterValues1Mutation();
  const [StudentDetailsReq, studentDetailsProps] = useStudentDetailsReqMutation();
  const [getTenantListingAction, tenantListingProps] = useGetTenantListingActionMutation();

  const [retrieveInstitutionStudentApplications, { data, isLoading, isSuccess, isError, error }] =
    useLazyRetrieveInstitutionStudentApplicationsQuery();

  // Handler for residence change
  const handleResidenceChange = (originalResidence, newResidence) => {
    // Find the current student being edited
    const currentApplication = data?.Listing.find((app) => app.accomodationApplicationsId?.value === recordId);

    if (currentApplication) {
      setResidenceChangeInfo({
        studentName: currentApplication.studentName?.value || 'Student',
        originalResidence,
        newResidence,
      });

      // Store the original and new values for later use
      originalResidenceValueRef.current = editedValuesRef.current.facilityId;
      pendingResidenceChangeRef.current = editedValuesRef.current.facilityId;

      // Show confirmation modal
      setShowResidenceModal(true);
    }
  };

  // Handle confirmation from the modal
  const handleResidenceChangeConfirm = () => {
    // User confirmed the change, proceed with saving
    // saveCell(true); // Pass true to indicate confirmed residence change
    setShowResidenceModal(false);
  };

  // Handle cancellation from the modal
  const handleResidenceChangeCancel = () => {
    // Revert the change in the editedValuesRef
    if (originalResidenceValueRef.current) {
      editedValuesRef.current.facilityId = originalResidenceValueRef.current;
    }

    setShowResidenceModal(false);
  };

  useEffect(() => {
    RetrieveMasterValues1({
      body: {
        entityName: 'Facility',
        requestName: 'RetrieveMasterValues',
        inputParamters: {
          Page: 'student-application-list',
          SupplierId: currentUser.supplierId,
        },
      },
    });
  }, []);

  useEffect(() => {
    retrieveInstitutionStudentApplications({
      supplierId: currentUser.supplierId!,
      searchText,
      pageNumber,
      Filters: filters,
      Status: statusFilter,
    });
  }, [isSearch, pageNumber, statusFilter, filters, bulkActionState]);

  const summaryData = [
    {
      title: 'Total Applications',
      value: data?.Summary.totalApplications || 0,
      subtitle: '',
      icon: <Users className="h-5 w-5 text-green-500" />,
      bgColor: 'bg-green-200',
    },
    {
      title: 'Pending Institution Rewiew',
      value: data?.Summary.pendingInstitutionReview || 0,
      subtitle: '',
      icon: <User className="h-5 w-5 text-purple-500" />,
      bgColor: 'bg-purple-200',
    },
    {
      title: 'Pending Approval',
      value: data?.Summary.pendingApproval || 0,
      subtitle: '',
      icon: <User className="h-5 w-5 text-yellow-500" />,
      bgColor: 'bg-yellow-200',
    },
    {
      title: 'Approved',
      value: data?.Summary.approved || 0,
      subtitle: '',
      icon: <UserCheck className="h-5 w-5 text-blue-500" />,
      bgColor: 'bg-blue-200',
    },
    {
      title: 'Rejected',
      value: data?.Summary.rejected || 0,
      subtitle: '',
      icon: <UserX className="h-5 w-5 text-red-500" />,
      bgColor: 'bg-red-200',
    },
  ];

  const getEditClickHandler = (application: TApplication) => () => {
    editedValuesRef.current = {};
    setEditingState({ recordId: application.accomodationApplicationsId?.value || '' });

    // Store the original facilityId for comparison
    if (application.facilityId) {
      originalResidenceValueRef.current = application.facilityId.value;
    }
  };

  const saveCell = async (isResidenceChangeConfirmed = false) => {
    setErrorCount(0);

    // Check if there's a residence change that hasn't been confirmed
    const isResidenceChanged = editedValuesRef.current?.facilityId !== originalResidenceValueRef.current;

    if (isResidenceChanged && !isResidenceChangeConfirmed) {
      // If residence has changed but not confirmed yet, show the confirmation modal
      // The actual handleResidenceChange function would have been called from the EditableCell component
      return;
    }

    const updatedRecord = {
      FacilityId: editedValuesRef.current?.facilityId,
      TermTypeId: editedValuesRef.current?.studentTermType,
      AcademicTermId: editedValuesRef.current?.processCycle,
      IdNumber: editedValuesRef.current?.idNumber,
      AllowanceTypeId: editedValuesRef.current?.allowanceTypeId,
    };

    UpsertAccomodationAppReq({
      body: {
        entityName: 'AccomodationApplications',
        requestName: 'InstiProcessApplication',
        recordId: recordId === NEW_ROW_ID ? undefined : recordId,
        inputParamters: {
          Entity: updatedRecord,
        },
      },
    })
      .unwrap()
      .then(() => {
        setEditingState({ recordId: '' });
        editedValuesRef.current = {};

        // Show appropriate success message
        if (isResidenceChangeConfirmed) {
          showSuccessToast('Residence updated. Student will be notified of the change.');
        } else {
          showSuccessToast('Updated Record Successfully');
        }

        // Refresh data
        retrieveInstitutionStudentApplications({
          supplierId: currentUser.supplierId!,
          searchText,
          pageNumber,
          Filters: filters,
          Status: statusFilter,
        });
      })
      .catch((e) => {
        setErrorCount(1);
        console.log('error', e);
        showErrorToast('Error updating record');
      });
  };

  const exitEditing = () => {
    setEditingState({ recordId: '' });
    editedValuesRef.current = {};
  };

  const handleViewDetails = (recordId) => {
    setShowDetails(true);
    StudentDetailsReq({
      body: {
        entityName: 'AccomodationApplications',
        requestName: 'StudentDetailsReq',
        recordId: recordId,
        Inputparamters: {
          accomodationProviderId: userDetails.supplierId,
        },
      },
    });
  };

  useEffect(() => {
    getTenantListingAction({
      body: {
        entityName: 'PortalListing',
        requestName: 'GetListingActions',
        inputParamters: {
          UserId: userDetails.supplierId,
          UserType: 'Supplier',
          PageRoute: '/student-application-list',
          PageName: 'Student Application',
        },
      },
    });
  }, []);

  const createNewFilterArray = (array1, array2) => {
    return array2.map((filter) => {
      // Find the corresponding item in array1
      const relatedItem = array1.find((item) =>
        item.actionFilters.some((actionFilter) => actionFilter.portalListingFilterId === filter.portalListingFilterId)
      );

      return {
        PortalListingId: relatedItem ? relatedItem.portalListingId : '',
        ActionFilterId: filter.portalListingFilterId,
      };
    });
  };

  const createNewRow = () => {
    setEditingState({ recordId: NEW_ROW_ID });
  };

  const handleExport = () => {
    exportStudents({
      body: { requestName: 'ExportAllocationsReq', inputParamters: { supplierId: userDetails.supplierId } },
    });
  };

  if (upsertProps.isSuccess) {
    // Moved this to the save handler for better user experience
  }

  if (upsertProps.isError && errorCount === 0) {
    setErrorCount(1);
    showErrorToast('Error updating record');
  }

  const downloadFile = async (data: { name: string; extension: string; content: unknown }) => {
    const a = document.createElement('a');
    a.download = data.name + '.' + data.extension;
    a.href = `data:text/${data.extension};base64,${data.content}`;
    a.click();
  };

  useEffect(() => {
    if (exportProps.isSuccess) {
      downloadFile({ name: exportProps.data?.file[0]?.name, extension: 'xlsx', content: exportProps.data?.file[0]?.content });
    }
  }, [exportProps.isSuccess]);

  const renderRow = (application: TApplication, containsEditable: boolean, isEditingRow: boolean, isRecordEditable: boolean = true) => {
    return (
      <TableRow
        key={application.accomodationApplicationsId?.value}
        className={cn({ 'bg-gray-200 border border-input ring-ring ring-1': isEditingRow })}
      >
        <TableCell>
          <Checkbox />
        </TableCell>
        <TableCell className="font-medium">{application.studentName?.value}</TableCell>
        <TableCell>
          <EditableCell
            data={application}
            column="idNumber"
            isEdit={isEditingRow}
            onEditChange={onEditChangeHandlerRef.current}
            masterValues={masterValie1Props.data}
          />
        </TableCell>
        <TableCell>
          <EditableCell
            data={application}
            column="campusIdName"
            isEdit={isEditingRow}
            onEditChange={onEditChangeHandlerRef.current}
            masterValues={masterValie1Props.data}
          />
        </TableCell>
        <TableCell>
          <EditableCell
            data={application}
            column="processCycle"
            isEdit={isEditingRow}
            onEditChange={onEditChangeHandlerRef.current}
            masterValues={masterValie1Props.data}
          />
        </TableCell>
        <TableCell>
          <EditableCell
            data={application}
            column="allowanceTypeId"
            isEdit={isEditingRow}
            onEditChange={onEditChangeHandlerRef.current}
            masterValues={masterValie1Props.data}
          />
        </TableCell>
        <TableCell>
          <EditableCell
            data={application}
            column="facilityId"
            isEdit={isEditingRow}
            onEditChange={onEditChangeHandlerRef.current}
            masterValues={masterValie1Props.data}
            onResidenceChange={handleResidenceChange} // Add the handler for residence changes
          />
        </TableCell>
        <TableCell className="font-medium">
          {application.studentStatus != null && (
            <Badge variant={getStatusBadgeClass(application?.studentStatus?.value)}>{application?.studentStatus?.value}</Badge>
          )}
        </TableCell>
        <TableCell className="flex space-x-2 justify-end">
          {containsEditable && isEditingRow ? (
            <>
              <Button variant="default" size="sm" className="px-2 min-w-12" disabled={upsertProps.isLoading} onClick={() => saveCell(true)}>
                {upsertProps.isLoading ? <ButtonLoader className="text-white" /> : 'Save'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border border-orange-500 text-orange-500 hover:text-orange-500 px-1.5"
                onClick={exitEditing}
                disabled={upsertProps.isLoading}
              >
                Cancel
              </Button>
            </>
          ) : null}
          {!isEditingRow && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border border-orange-500 text-orange-500 hover:text-orange-500">
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewDetails(application.accomodationApplicationsId?.value)}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                {isRecordEditable ? (
                  <DropdownMenuItem onClick={getEditClickHandler(application)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Review
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </TableCell>
      </TableRow>
    );
  };

  const totalRecords = data?.RecordCount;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const breadcrumbItems = [{ path: '/Applications', label: 'Student Applications List' }];

  return (
    <DashboardLayout>
      <Breadcrumb items={breadcrumbItems} />
      <AsyncContent isLoading={isLoading || masterValie1Props.isLoading}>
        {isError && <ErrorPage message={error.data} />}
        {isLoading && <PageLoder />}

        {/* Student Details Modal */}
        <StudentProfileModal
          open={showDetails}
          data={studentDetailsProps.data}
          isSuccess={studentDetailsProps.isSuccess}
          isError={studentDetailsProps.isError}
          error={studentDetailsProps.error}
          isLoading={studentDetailsProps.isLoading}
          onOpenChange={setShowDetails}
          onSignLease={undefined}
          onViewLease={undefined}
          onTerminate={undefined}
          isLoadingSignWell={undefined}
          isLoadingAccomodation={undefined}
          onRegenerate={undefined}
          isLoadingTerminate={undefined}
          isLoadingRegenerate={undefined}
        />

        {/* Residence Change Confirmation Modal */}
        <ResidenceChangeModal
          open={showResidenceModal}
          onOpenChange={(open) => {
            if (!open) handleResidenceChangeCancel();
            setShowResidenceModal(open);
          }}
          onConfirm={handleResidenceChangeConfirm}
          isLoading={upsertProps.isLoading}
          studentName={residenceChangeInfo.studentName}
          originalResidence={residenceChangeInfo.originalResidence}
          newResidence={residenceChangeInfo.newResidence}
        />

        {isSuccess && (
          <div className="space-y-6">
            <div className="mb-4">
              <FilterPopover
                filters={tenantListingProps.data?.ListingActionFilters}
                onApplyFilters={(values) => {
                  const nonBulkActionFilters = tenantListingProps.data?.ListingActionFilters.filter((filter) => !filter.isBulkAction);
                  const newArr = createNewFilterArray(nonBulkActionFilters, values);

                  setFilters(newArr);
                }}
              />
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <div className="bg-blue-100 px-6 py-2 rounded-lg text-blue-600 font-semibold flex justify-between">
                <div>
                  <span className="text-black">Showing search results for </span> {searchText}
                </div>
                <X
                  className="text-red-500 cursor-pointer"
                  onClick={() => {
                    setSearchText('');
                    setIsSearch(!isSearch);
                  }}
                />
              </div>
            )}

            {/* Students List */}
            <Card className="rounded-md">
              <CardHeader>
                <CardTitle className="text-xl flex justify-between">
                  <div>Student Application List</div>
                  <div className="flex gap-2">
                    <Button variant="default" type="button" onClick={() => navigate('/student-application-list/apply')}>
                      + Apply For Student
                    </Button>
                    <Button variant="default" type="button" onClick={handleExport}>
                      <Download /> Export
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>View and manage student records</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2 w-1/3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search students..."
                        className="pl-10"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                      {searchText && (
                        <button
                          onClick={() => {
                            setSearchText('');
                            setIsSearch(!isSearch);
                            setPageNumber(1);
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
                    {tenantListingProps.data?.ListingActionFilters.map(
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

                {/* Table */}
                {data?.Listing.length > 0 && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveCell();
                    }}
                  >
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100">
                          <TableHead className="w-12">
                            <Checkbox />
                          </TableHead>
                          <TableHead>Student Name</TableHead>
                          <TableHead>ID Number</TableHead>
                          <TableHead>Campus</TableHead>
                          <TableHead>Process Cycle</TableHead>
                          <TableHead>Allowance Type</TableHead>
                          <TableHead>Residence</TableHead>
                          <TableHead>Application Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recordId === NEW_ROW_ID && renderRow(NEW_ROW, true, true)}
                        {data?.Listing?.map((application) => {
                          const containsEditable = Object.values(application).some((item) => item?.inLineEdit);
                          const isRecordEditable = isEditable(application);
                          const isEditingRow = recordId === application.accomodationApplicationsId?.value;
                          return renderRow(application, containsEditable, isEditingRow, isRecordEditable);
                        })}
                      </TableBody>
                    </Table>
                  </form>
                )}

                {/* Pagination */}
                {data?.Listing.length > 0 && (
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

                {isSuccess && data.Listing.length < 1 && (
                  <EmptyState title="No students found" description="No student records found" icon={EmptyStateIcon} />
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </AsyncContent>
    </DashboardLayout>
  );
};

export default StudentApplicationList;
