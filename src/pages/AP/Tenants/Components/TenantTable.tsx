// components/tenant/TenantTable.tsx
import React, { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tenant } from '@/types/tenant';
import TenantStatusBadge from './TenantStatusBadge';
import TenantTableActions from './TenantTableActions';

interface TenantTableProps {
  tenants: Tenant[];
  onSelectTenant: (tenantId: string) => void;
  onSelectAll: () => void;
  onViewDetails: (tenantId: string, accomodationApplicationsId: string, apSigningURL: string | null) => void;
  onViewLease: (accomodationApplicationsId: string) => void;
  onSignLease: (url: string) => void;
  onRenew: (tenantId: string) => void;
  onTerminate: (tenantId: string, accomodationApplicationsId: string) => void;
  selectedTenants: string[];
  selectAll: boolean;
  isLoadingRenew?: boolean;
}

const TenantTable: React.FC<TenantTableProps> = ({
  tenants,
  onSelectTenant,
  onSelectAll,
  onViewDetails,
  onViewLease,
  onSignLease,
  onRenew,
  onTerminate,
  selectedTenants,
  selectAll,
  isLoadingRenew = false,
}) => {
  const [selectedValue, setSelectedValue] = useState('');

  const handleValueChange = (value: string) => {
    setSelectedValue(value);

    if (value === 'all') {
      onSelectAll();
    } else {
      onSelectTenant(value);
    }
  };

  const formatPhoneNumber = (number: string) => {
    return number?.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  };

  return (
    <RadioGroup value={selectedValue} onValueChange={handleValueChange}>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>
              <RadioGroupItem value="all" id="select-all" checked={selectAll} onClick={onSelectAll} className="w-5 h-5 rounded-md" />
            </TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead className="max-w-36">Residence</TableHead>
            <TableHead className="max-w-36">Room Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Contact No</TableHead>
            <TableHead>Lease Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.map((tenant) => (
            <TableRow key={tenant.tenantId}>
              <TableCell className="font-medium">
                <RadioGroupItem
                  value={tenant.tenantId}
                  id={`tenant-${tenant.tenantId}`}
                  checked={selectedTenants.includes(tenant.tenantId)}
                  onClick={() => onSelectTenant(tenant.tenantId)}
                  className="w-5 h-5 rounded-md"
                />
              </TableCell>
              <TableCell className="font-medium">{tenant.studentIdName}</TableCell>
              <TableCell className="max-w-36">{tenant.facilityIdName}</TableCell>
              <TableCell className="max-w-36">{tenant.roomType}</TableCell>
              <TableCell>{tenant.price}</TableCell>
              <TableCell>{tenant.startDate}</TableCell>
              <TableCell>{tenant.endDate}</TableCell>
              <TableCell>{formatPhoneNumber(tenant.mobile)}</TableCell>
              <TableCell>
                <TenantStatusBadge status={tenant.leaseStatus} studentSigned={tenant.studentSigned} apSigned={tenant.apSigned} />
              </TableCell>
              <TableCell className="text-right">
                <TenantTableActions
                  tenantId={tenant.tenantId}
                  accomodationApplicationsId={tenant.accomodationApplicationsId}
                  leaseStatus={tenant.leaseStatus}
                  apSigningURL={tenant.apSigningURL}
                  onViewDetails={onViewDetails}
                  onViewLease={onViewLease}
                  onSignLease={onSignLease}
                  onRenew={onRenew}
                  onTerminate={onTerminate}
                  isLoadingRenew={isLoadingRenew}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </RadioGroup>
  );
};

export default TenantTable;
