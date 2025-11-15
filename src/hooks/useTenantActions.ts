// hooks/useTenantActions.ts
import { useEffect } from 'react';
import {
  useEmployeeMutation,
  useExportStudentsMutation,
  useRenewTenantMutation,
  useRetrieveSignwellReqMutation,
} from '@/services/apiService';
import { downloadFile } from '@/utils/helpers';
import { showSuccessToast } from '@/components/SuccessToast';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useTenantRegenerateLeaseMutation, useTerminateTenantReqMutation } from '@/services/tenantService';
import { showErrorToast } from '@/components/ErrorToast ';

export const useTenantActions = () => {
  const userDetails = useSelector((state: RootState) => state.details.requestResults);

  // Tenant details
  const [employee, { isLoading, isSuccess, isError, data, error }] = useEmployeeMutation();

  // Export students
  const [exportStudents, { isLoading: isLoadingExport, isSuccess: isSuccessExport, isError: isErrorExport, data: dataExport }] =
    useExportStudentsMutation();

  // Renew tenant
  const [renewTenant, { isLoading: isLoadingRenew, isSuccess: isSuccessRenew, isError: isErrorRenew, error: errorRenew, data: dataRenew }] =
    useRenewTenantMutation();

  // Regenerate lease
  const [
    tenantRegenerateLease,
    {
      isLoading: isLoadingRegenerate,
      isSuccess: isSuccessRegenerate,
      isError: isErrorRegenerate,
      data: dataRegenerate,
      error: errorRegenerate,
    },
  ] = useTenantRegenerateLeaseMutation();

  // Retrieve SignWell request
  const [
    retrieveSignwellReq,
    { isLoading: isLoadingSignWell, isSuccess: isSuccessSignWell, isError: isErrorSignWell, data: dataSignWell },
  ] = useRetrieveSignwellReqMutation();

  // Terminate tenant
  const [
    terminateTenantReq,
    { isLoading: isLoadingTerminate, isSuccess: isSuccessTerminate, isError: isErrorTerminate, data: dataTerminate },
  ] = useTerminateTenantReqMutation();

  // Handle export
  const handleExport = () => {
    exportStudents({
      body: {
        entityName: 'Tenant',
        requestName: 'ExportInstitutionListing',
        inputParamters: {
          supplierId: userDetails.supplierId,
        },
      },
    });
  };

  // Handle view details
  const handleViewDetails = (recordId: string) => {
    employee({
      body: {
        entityName: 'Tenant',
        requestName: 'StudentDetailsReq',
        recordId: recordId,
        Inputparamters: {
          accomodationProviderId: userDetails.supplierId,
        },
      },
    });
  };

  // Handle view lease
  const handleViewLease = (recordId: string) => {
    retrieveSignwellReq({
      body: {
        entityName: 'AccomodationApplications',
        requestName: 'RetrieveSignwellReq',
        recordId,
        inputParamters: {
          UserType: 'AP',
        },
      },
    });
  };

  // Handle tenant renewal
  const handleRenew = (tenantId: string | string[]) => {
    const isArray = Array.isArray(tenantId);

    renewTenant({
      body: {
        entityName: 'Tenant',
        requestName: 'RenewTenant',
        inputParamters: {
          Action: isArray ? 'Bulk' : 'Single',
          TenantIds: tenantId,
        },
      },
    });
  };

  // Handle lease regeneration
  const handleRegenerate = (tenantId: string) => {
    tenantRegenerateLease({
      body: {
        entityName: 'Tenant',
        requestName: 'RegenerateLeaseExecRequest',
        recordId: tenantId,
      },
    });
  };

  // Process export success
  useEffect(() => {
    if (isSuccessExport && dataExport?.file[0]) {
      downloadFile({
        name: dataExport.file[0].name,
        extension: 'xlsx',
        content: dataExport.file[0].content,
      });
    }
  }, [isSuccessExport, dataExport]);

  // Process renewal result
  useEffect(() => {
    if (isSuccessRenew) {
      if (dataRenew?.isRenewed === true) {
        showSuccessToast(dataRenew?.clientMessage);
      } else if (dataRenew?.isRenewed === false) {
        showErrorToast(dataRenew?.clientMessage);
      }
    }

    if (isErrorRenew) {
      showErrorToast(errorRenew?.data);
    }
  }, [isSuccessRenew, isErrorRenew, dataRenew, errorRenew]);

  // Handle regenerate error
  useEffect(() => {
    if (isErrorRegenerate) {
      showErrorToast(errorRegenerate?.data);
    }
  }, [isErrorRegenerate, errorRegenerate]);

  return {
    handleExport,
    handleViewDetails,
    handleViewLease,
    handleRenew,
    handleRegenerate,
    tenantDetailsData: data,
    tenantDetailsLoading: isLoading,
    tenantDetailsSuccess: isSuccess,
    tenantDetailsError: isError,
    tenantDetailsErrorData: error,
    exportLoading: isLoadingExport,
    renewLoading: isLoadingRenew,
    regenerateLoading: isLoadingRegenerate,
    regenerateSuccess: isSuccessRegenerate,
    signWellLoading: isLoadingSignWell,
    signWellSuccess: isSuccessSignWell,
    signWellData: dataSignWell,
    terminateLoading: isLoadingTerminate,
    terminateSuccess: isSuccessTerminate,
  };
};
