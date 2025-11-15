// components/tenant/TenantTableActions.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { View, Eye, Signature, Recycle, Trash2 } from 'lucide-react';

interface TenantTableActionsProps {
  tenantId: string;
  accomodationApplicationsId: string;
  leaseStatus: string;
  apSigningURL: string | null;
  onViewDetails: (tenantId: string, accomodationApplicationsId: string, apSigningURL: string | null) => void;
  onViewLease: (accomodationApplicationsId: string) => void;
  onSignLease: (url: string) => void;
  onRenew: (tenantId: string) => void;
  onTerminate: (tenantId: string, accomodationApplicationsId: string) => void;
  isLoadingRenew?: boolean;
}

const TenantTableActions: React.FC<TenantTableActionsProps> = ({
  tenantId,
  accomodationApplicationsId,
  leaseStatus,
  apSigningURL,
  onViewDetails,
  onViewLease,
  onSignLease,
  onRenew,
  onTerminate,
  isLoadingRenew = false,
}) => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="border border-orange-500 text-orange-500 hover:text-orange-500">
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onViewDetails(tenantId, accomodationApplicationsId, apSigningURL)}
          className="flex items-center font-medium"
        >
          <View className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>

        {leaseStatus === 'Active' && (
          <DropdownMenuItem onClick={() => onViewLease(accomodationApplicationsId)} className="flex items-center font-medium">
            <Eye className="mr-2 h-4 w-4" />
            View Lease
          </DropdownMenuItem>
        )}

        {apSigningURL != null && leaseStatus !== 'Active' && (
          <DropdownMenuItem onClick={() => onSignLease(apSigningURL)} className="flex items-center font-medium cursor-pointer">
            <Signature className="mr-2 h-4 w-4" />
            Sign Lease
          </DropdownMenuItem>
        )}

        {leaseStatus === 'Terminated' && (
          <DropdownMenuItem onClick={() => onRenew(tenantId)} className="flex items-center font-medium">
            <Recycle className="mr-2 h-4 w-4 text-purple-500" />
            {isLoadingRenew ? <Spinner /> : 'Renew Lease'}
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {leaseStatus !== 'Terminated' && leaseStatus !== 'Active' && (
          <DropdownMenuItem
            onClick={() => onTerminate(tenantId, accomodationApplicationsId)}
            className="flex font-medium  text-red-500 cursor-pointer"
          >
            <Trash2 className="mr-2 h-4 w-4 text-red-500" />
            Terminate
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TenantTableActions;
