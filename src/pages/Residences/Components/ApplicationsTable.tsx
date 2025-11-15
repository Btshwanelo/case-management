import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { getStatusBadgeClass } from '@/utils';
import EmptyState from '@/components/EmptyState';
import EmptyStateIcon from '@/assets/NoDocuments__1.png';
import { CheckCircle, ExternalLink, Eye, Trash2, X, XCircle } from 'lucide-react';

interface ApplicationsTableProps {
  applications: any[];
  selectedValue: string;
  selectedTenants: string[];
  selectAll: boolean;
  onSelectAll: () => void;
  onSelectTenant: (accomodationApplicationsId: string) => void;
  onViewApplication: (application: any) => void;
  handleSignleRejectReject: (application: any) => void;
}

export const ApplicationsTable = ({
  applications = [],
  selectedValue,
  selectedTenants,
  selectAll,
  onSelectAll,
  onSelectTenant,
  onViewApplication,
  handleSignleRejectReject,
}: ApplicationsTableProps) => {
  return (
    <RadioGroup value={selectedValue} onValueChange={(value) => console.log('value', value)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>
              <RadioGroupItem value="All" checked={selectAll} onClick={onSelectAll} className="w-5 h-5" />
            </TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead>Id Number</TableHead>
            <TableHead>Residence</TableHead>
            <TableHead>Campus</TableHead>

            <TableHead>Process Cycle</TableHead>
            <TableHead>Planned Move-In Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((application) => (
            <TableRow key={application.accomodationApplicationsId}>
              <TableCell>
                <RadioGroupItem
                  value={application.accomodationApplicationsId}
                  checked={selectedTenants.includes(application.accomodationApplicationsId)}
                  onClick={() => onSelectTenant(application.accomodationApplicationsId)}
                  className="w-5 h-5"
                />
              </TableCell>
              <TableCell className="font-medium">{application.studentName}</TableCell>
              <TableCell>{application.idNumber}</TableCell>
              {/* <TableCell>{application.accomodationApplicationsId}</TableCell> */}
              <TableCell className="max-w-40">{application.facilityName}</TableCell>
              <TableCell className="max-w-40">{application.campusIdName}</TableCell>

              <TableCell>{application.processCycle}</TableCell>
              <TableCell>{application.plannedMoveInDate}</TableCell>
              {/* <TableCell>{application.arrivalDate}</TableCell> */}
              <TableCell>
                <Badge variant={getStatusBadgeClass(application.status)}>{application.status}</Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="border border-orange-500 text-orange-500 hover:text-orange-500">
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewApplication(application)} className="flex items-center font-medium">
                      {' '}
                      <Eye className="mr-2 h-4 w-4" /> View details
                    </DropdownMenuItem>
                    {application.status != 'Approved' &&
                      application.status != 'Declined' &&
                      application.status != 'Pending Institution Review' && (
                        <DropdownMenuItem onClick={() => onViewApplication(application)} className="flex items-center font-medium">
                          {' '}
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </DropdownMenuItem>
                      )}
                    {application.status === 'Approved' && application.apSigningURL && (
                      <DropdownMenuItem onClick={() => window.open(application.apSigningURL, '_blank')}> View Agreement</DropdownMenuItem>
                    )}
                    {application.status === 'Pending Approval' && (
                      <DropdownMenuItem onClick={() => handleSignleRejectReject(application.accomodationApplicationsId)}>
                        <ExternalLink className="mr-2 h-4 w-4" /> Reject
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {applications?.length < 1 && (
        <EmptyState
          title="No residences found"
          description="Create your first item to get started"
          icon={EmptyStateIcon}
          // action={{
          //   label: "Add Residence",
          //   onClick: () =>navigate('/residences')
          // }}
          // secondaryAction={{
          //   label: "Refresh",
          //   onClick: () =>  console.log()
          // }}
        />
      )}
    </RadioGroup>
  );
};
