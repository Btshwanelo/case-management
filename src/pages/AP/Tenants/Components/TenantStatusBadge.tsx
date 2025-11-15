// components/tenant/TenantStatusBadge.tsx
import React from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getStatusBadgeClass } from '@/utils';

interface TenantStatusBadgeProps {
  status: string;
  studentSigned?: boolean;
  apSigned?: boolean;
}

const TenantStatusBadge: React.FC<TenantStatusBadgeProps> = ({ status, studentSigned = false, apSigned = false }) => {
  return (
    <div className="flex items-center gap-2">
      <Badge variant={getStatusBadgeClass(status)}>{status}</Badge>

      {status === 'Pending Signature' && (
        <Popover>
          <PopoverTrigger asChild>
            <Eye className="h-4 w-4 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer" aria-label="View signing status" />
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0 shadow-lg border-gray-200" side="right" align="start">
            <div className="p-3 bg-orange-50 border-b border-orange-100">
              <h3 className="font-medium text-sm text-orange-800">Lease Signing Status</h3>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Student:</span>
                {studentSigned ? (
                  <span className="text-green-600 flex items-center bg-green-50 px-2 py-1 rounded text-xs">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    Signed
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center bg-red-50 px-2 py-1 rounded text-xs">
                    <XCircle className="h-3.5 w-3.5 mr-1.5" />
                    Not signed
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Landlord:</span>
                {apSigned ? (
                  <span className="text-green-600 flex items-center bg-green-50 px-2 py-1 rounded text-xs">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    Signed
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center bg-red-50 px-2 py-1 rounded text-xs">
                    <XCircle className="h-3.5 w-3.5 mr-1.5" />
                    Not signed
                  </span>
                )}
              </div>

              {!studentSigned && !apSigned && (
                <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <p>Waiting for Student to sign lease</p>
                </div>
              )}
              {studentSigned && !apSigned && (
                <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <p>Waiting for Landlord to sign lease</p>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default TenantStatusBadge;
