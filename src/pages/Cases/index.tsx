import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import EmptyStateIcon from "@/assets/NoDocuments__1.png";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  MoreVertical,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  Plus,
  ExternalLink,
  X,
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { useGetCasesMutation } from "@/services/apiService";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageLoder from "@/components/PageLoder";
import { getStatusBadgeClass } from "@/utils";
import Breadcrumb from "@/components/BreadCrumb";
import InsightCard from "@/components/InsightCard";
import ErrorPage from "@/components/ErrorPage";
import EmptyState from "@/components/EmptyState";
import EnhancedPagination from "@/components/EnhancedPagination";

const CasesScreen = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isSearch, setIsSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loaderType, setLoaderType] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const navigate = useNavigate();

  const { relatedObjectId } = useSelector(
    (state: RootState) => state.auth.user
  );
  const userDetails = useSelector(
    (state: RootState) => state.details.requestResults
  );
  const dispatch = useDispatch();

  const [
    getCases,
    {
      data: Cases,
      isLoading: isLoadingCases,
      isSuccess: isSuccessCases,
      isError: isErrorCases,
      error: errorCases,
    },
  ] = useGetCasesMutation();

  useEffect(() => {
    getCases({
      body: {
        entityName: "Cases",
        requestName: "CasesListingReq",
        inputParamters: {
          UserId: userDetails.aPtype != "Institution" ? relatedObjectId : "",
          SearchText: searchTerm,
          PageNumber: pageNumber,
          PageSize: pageSize,
          Status: statusFilter,
          SupplierId:
            userDetails.aPtype === "Institution" ? userDetails.supplierId : "",
        },
      },
    });
  }, [isSearch, pageNumber, statusFilter]);

  // Sample data
  const data = {
    Summary: {
      totalCases: Cases?.Summary.totalCases,
      openCases: Cases?.Summary.openCases,
      closedCases: Cases?.Summary.closedCases,
      onHoldCases: Cases?.Summary.onHoldCases,
      totalCasesTrend: Cases?.Summary.totalCasesTrend,
      openCasesTrend: Cases?.Summary.openCasesTrend,
      closedCasesTrend: Cases?.Summary.closedCasesTrend,
      onHoldCasesTrend: Cases?.Summary.onHoldCasesTrend,
    },
    PageSize: Cases?.PageSize,
    RecordCount: Cases?.RecordCount,
    Pages: Cases?.Pages,
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleViewCase = (caseId) => {
    navigate(`/cases/${caseId}`);
  };

  const handleCreateCase = () => {
    navigate("/cases/create");
  };

  const summaryData = [
    {
      title: "Total Cases",
      value: data.Summary.totalCases,
      subtitle: "All Time",
      icon: <FolderOpen className="h-5 w-5 text-blue-500" />,
      bgColor: "bg-blue-200",
    },
    {
      title: "Open Cases",
      value: data.Summary.openCases,
      subtitle: "Active",
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      bgColor: "bg-yellow-200",
    },
    {
      title: "Closed Cases",
      value: data.Summary.closedCases,
      subtitle: "Resolved",
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      bgColor: "bg-green-200",
    },
    {
      title: "On Hold",
      value: data.Summary.onHoldCases,
      subtitle: "Pending",
      icon: <PauseCircle className="h-5 w-5 text-red-500" />,
      bgColor: "bg-red-200",
    },
  ];

  const totalRecords = Cases?.RecordCount;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const breadcrumbItems = [{ path: "/cases", label: "Cases" }];
  return (
    <DashboardLayout>
      {/* <Breadcrumb items={breadcrumbItems} />*/}

      {isLoadingCases && <PageLoder />}
      {isErrorCases && <ErrorPage message={errorCases.data} />}

      {isSuccessCases && (
        <div className=" space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="space-y-2"></div>
            <Button
              onClick={handleCreateCase}
              className="w-full sm:w-auto flex items-center rounded-lg hover:bg-[#a11b23] hover:text-white border-2 px-[14px] py-[10px] bg-[#a11b23] text-white shadow-sm justify-center gap-2 border-[#ffffff1f]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Case
            </Button>
          </div>

          {/* Insight Cards */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 pb-2">
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
            <div className="bg-blue-100  px-6 py-2 rounded-lg text-[#a11b23] font-semibold flex justify-between">
              <div>
                <span className="text-black"> Showing search results for </span>{" "}
                {searchTerm}
              </div>{" "}
              <X
                className="text-red-500 cursor-pointer"
                onClick={() => {
                  setSearchTerm("");
                  setIsSearch(!isSearch);
                }}
              />{" "}
            </div>
          )}

          {/* Cases Table Card */}
          <Card className="rounded-md">
            <CardHeader>
              <CardTitle>All Cases</CardTitle>
              <CardDescription>
                View and manage your support cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row  justify-between mb-6 gap-2">
                <div className="flex flex-row gap-2 w-full md:w-1/3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search cases..."
                      className="pl-10 pr-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setIsSearch(!isSearch);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-75 transition-opacity"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto flex items-center rounded-lg hover:bg-[#a11b23] hover:text-white border-2 px-[14px] py-[10px] bg-[#a11b23] text-white shadow-sm justify-center gap-2 border-[#ffffff1f]"
                    onClick={() => setIsSearch(!isSearch)}
                  >
                    <Search className="h-4 w-4 text-white" />
                  </Button>
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="OnHold">On Hold</SelectItem>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cases Table */}
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Case Number</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead>Regarding</TableHead>
                    <TableHead>Created On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Cases?.Listing.map((case_) => (
                    <TableRow key={case_.casesId}>
                      <TableCell className="font-medium">
                        <Button
                          variant={"link"}
                          className="pl-0 text-black"
                          onClick={() => handleViewCase(case_.casesId)}
                        >
                          {case_.caseNumber}
                        </Button>
                      </TableCell>
                      <TableCell>{case_.classification}</TableCell>
                      <TableCell>{case_.regarding || "-"}</TableCell>
                      <TableCell>{formatDate(case_.createdOn)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeClass(case_.caseStatus)}>
                          {case_.caseStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewCase(case_.casesId)}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="border border-[#a11b23] text-[#a11b23] hover:text-[#a11b23]"
                          >
                            View
                          </Button>
                        </Button>
                        {/* <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="border border-[#a11b23] text-[#a11b23] hover:text-[#a11b23]">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="font-medium"
                              onClick={(e) => {
                                handleViewCase(case_.casesId);
                              }}
                            >
                              View details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu> */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {/* {Cases?.Listing.length > 0 && (
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

              {Cases?.Listing.length > 0 && (
                <div className="mt-4">
                  <EnhancedPagination
                    currentPage={pageNumber}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                      setLoaderType("pagination");
                      setPageNumber(page);
                    }}
                  />
                </div>
              )}

              {isSuccessCases && Cases?.Listing.length < 1 && (
                <EmptyState
                  title="No cases found"
                  description="Create your first item to get started"
                  icon={EmptyStateIcon}
                  // action={{
                  //   label: 'Create a Case',
                  //   onClick: () => handleCreateCase(),
                  // }}
                  // secondaryAction={{
                  //   label: "Refresh",
                  //   onClick: () =>  console.log()
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

export default CasesScreen;
