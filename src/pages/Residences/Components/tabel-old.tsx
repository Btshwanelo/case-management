import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical } from 'lucide-react';
import { getStatusBadgeClass } from '@/utils';

export const ApplicationsTable = ({
  applications,
  selectedValue,
  selectedTenants,
  selectAll,
  onSelectAll,
  onSelectTenant,
  onViewApplication,
  setSelectedValue,
}) => {
  return (
    <RadioGroup value={selectedValue} onValueChange={setSelectedValue}>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead>
              <RadioGroupItem value="all" id="select-all" checked={selectAll} onClick={onSelectAll} className="w-5 h-5 rounded-md" />
            </TableHead>
            <TableHead>Facility Name</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead>Campus</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Move In Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications?.map((app) => (
            <TableRow key={app.accomodationApplicationsId}>
              <TableCell className="font-medium">
                <RadioGroupItem
                  value={app.accomodationApplicationsId}
                  id={`tenant-${app.accomodationApplicationsId}`}
                  // checked={selectedTenants.includes(app.accomodationApplicationsId)}
                  onClick={() => onSelectTenant(app.accomodationApplicationsId)}
                  className="w-5 h-5 rounded-md"
                />
              </TableCell>
              <TableCell className="font-medium">{app.facilityName}</TableCell>
              <TableCell>{app.studentName}</TableCell>
              <TableCell>{app.campusIdName}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeClass(app.status)}>{app.status}</Badge>
              </TableCell>
              <TableCell>{app.plannedMoveInDate ? new Date(app.plannedMoveInDate).toLocaleDateString() : '-'}</TableCell>
              <TableCell>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="border border-orange-500 text-orange-500 hover:text-orange-500">
                      View
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewApplication(app)}>View details</DropdownMenuItem>
                    {app.status === 'Approved' && app.apSigningURL && (
                      <DropdownMenuItem onClick={() => window.open(app.apSigningURL, '_blank')}>View Agreement</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </RadioGroup>
  );
};
