import { TEntityName, TPage } from '@/types';
import { apiSlice } from '../slices/apiSlice';
import {
  TAddPageMasterValuesApiResponse,
  TFacilityMakePaymentApiResponse,
  TRetrieveAPInspectionFeeApiResponse,
  TRetrieveInstitutionStudentApplicationsApiResponse,
} from '@/types/api-response-bodies';

interface ApiResponse<T> {
  isSuccess: boolean;
  results: T | null;
  gotoUrl: string | null;
  clientExecuteFunctionOnSuccess: string | null;
  clientExecuteFunctionOnFailure: string | null;
  clientMessage: string | null;
  outputParameters: T;
}

export const authSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.query({
      query: ({ authToken, id }) => ({
        url: `/entities/ExecuteRequest?RequestName=Login`,
        method: 'GET',
        headers: { Authorization: authToken },
      }),
      providesTags: [],
    }),
    getOfferLetters: builder.query({
      query: ({ id }) => ({
        url: `/entities/Data/GetAPOfferLetters?AccomodationProviderId=${id}`,
        method: 'GET',
        // headers: { Authorization: authToken },
      }),
      providesTags: [],
    }),
    getApplicationRoomTypes: builder.query({
      query: (id) => ({
        url: `/entities/Data/GetFacilityApplicationDetails?AccomodationProviderId=${id}`,
        method: 'GET',
        // headers: { Authorization: authToken },
      }),
      providesTags: [],
    }),
    signUp: builder.mutation({
      query: ({ body }) => ({
        url: `/auth/external-register?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),

    createProfile: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    PreviewDocumentReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    contactPersonUpsert: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),

    getAPInvoices: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    facilityRemoveRecordReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
        invalidates: ['facility-data'],
      }),
      invalidatesTags: [],
    }),
    removeRecordReq: builder.mutation<
      unknown,
      {
        entityName: TEntityName;
        recordId: string;
      }
    >({
      query: ({ entityName, recordId }) => ({
        url: `/entities/ExecuteRequest?RequestName=RemoveRecordReq`,
        method: 'POST',
        body: {
          entityName,
          recordId,
          requestName: 'RemoveRecordReq',
        },
        invalidates: ['facility-data'],
      }),
    }),
    getStudentApplications: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    canStudentApplyForProperty: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    employeeRetrieveDepartureDatesReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    studentPropertyApplicationDates: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    studentPropertyApplicationMoveOutDates: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    getPropertyDetails: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    studentApplyForProperty: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    offerLettersListingReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    authenticateUser: builder.mutation({
      query: ({ body }) => ({
        url: `/auth/external-logon`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    registerUser: builder.mutation({
      query: ({ body }) => ({
        url: `/auth/external-register?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    createExternalLogon: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    getCurrentUser: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    getCases: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
        headers: {
          Authorization: `Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjI3NUIxNUFDOTQ2N0Y0MDE3OTMzNkM1OEQ4MTE2MkQ1IiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE3MzE1OTQ1ODIsImV4cCI6MTczMTYzNzc4MiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi5lenJhMzYwLmNvbSIsImF1ZCI6IkFlci1DUk0tQXBpIiwiY2xpZW50X2lkIjoieHJtLXBhc3N3b3JkLWF1dGgiLCJzdWIiOiI4YTViNGE0Mi1lYTE4LTQwMjItYjJlNi1lZGM5NjFkZmQ0MTciLCJhdXRoX3RpbWUiOjE3MzE1OTQ1ODIsImlkcCI6ImxvY2FsIiwidW5pcXVlX25hbWUiOiJwb3J0YWxAZXpyYTM2MC5jb20iLCJlbWFpbCI6InBvcnRhbEBlenJhMzYwLmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJQb3J0YWwgQXBwbGljYXRpb24iLCJpYXQiOjE3MzE1OTQ1ODIsInNjb3BlIjpbIkFlci1DUk0tQXBpIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbInB3ZCJdfQ.El5W34SzfxtjSgSwsICgbbQfFV8dpdTuJiLUwHNrQVqUlVXGGr2ut95ypEuh5iFMu0i0Wv3oPy5I-wDFRnmyrmiUjgTgPwkezt4hkSoSQA6vABzq_QxAf4WhhiFOt65a730_n5BrpVttvB4sJNJvoTAkIUDkwc2-wDXflIpNe9T4KGC3r1Jksiu6FpDzPb3q4Ydu0KuH-she0EGeKnzKiegT9ID_T8aVUavT3cIl6rpWP9ty9HMDgtbtfrPEipS-y5ttvUgjt9NjCGuCuLQv9VgumhleSvMllDm9s8O8P-1e2mf_Hm5-i2mHJMJGHAQyEU--DBaI2BExZWZXH9r73g`,
        },
      }),
      invalidatesTags: [],
    }),
    getCheckInListing: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    getCheckInRoomTypes: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    getTenantListing: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    getTenantListingAction: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    getStudentDetails: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    searchStudent: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    studentSearchProperty: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    getStudentsPropetyApplications: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    getCaseDetails: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    //following entity names
    investigationLine: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    retrievePlannedMoveOutDatesReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    checkIn: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    surveyResponseAnswer: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    surveyResponse: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    cancelCheckIn: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    signCheckInLease: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    address: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    supplier: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    bankAccount: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    employee: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    externalLogon: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    cases: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    caseRegarding: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    casesCreate: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    invoice: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    //changed
    retrieveSignwellReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    getListingActions: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    retrieveDocument: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    retrieveProfileDetailsReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    accomodationApplication: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    getAlertNotificationsReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    retrieveForcedActions: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    fetchRecordWithDocsReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    facilityRetrieveMasterValues: builder.query({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
    }),
    retrievePageMasterValues: builder.query<
      TAddPageMasterValuesApiResponse,
      {
        Page: TPage;
        CampusId?: string;
        SupplierId?: string;
      }
    >({
      query: ({ Page, CampusId, SupplierId }) => ({
        url: `/entities/ExecuteRequest?RequestName=RetrieveMasterValues`,
        method: 'POST',
        body: {
          entityName: 'Facility',
          requestName: 'RetrieveMasterValues',
          inputParamters: {
            Page,
            CampusId: CampusId || undefined,
            SupplierId: SupplierId || undefined,
          },
        },
      }),
    }),
    renewTenant: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    forcedActionUpsert: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    addressUpsertRecordReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    bankAccountUpsertRecordReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    suppllierCreateDocumentExecuteReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    suppllierUpsertRecordReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    employeeUpsertRecordReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),

    supplierDocLibretriveDocument: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    supplierGeneratOTPExecuteRequest: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    supplierConfirmOTPExecuteRequest: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    employeeRetrieveProfileDetailsReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    casesRetrieveCaseRegardingReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    facilityPaymenyReceivedReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    casesRetrieveCaseClassifications: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    casesUpsertRecordReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    bulkApplicationRejectReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    retrieveAPFacilities: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    externalLogonRetrieveAnnouncements: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    externalLogonRetrieveQuickActions: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    facilityUpsertRecordReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['facility-data'],
    }),
    externlaLogonRetrieveMasterValues: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    provinceRetrieveMasterValues: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    deleteRoom: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    termTypeRetrieveMasterValues: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    updateCoverImage: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    campusRetrieveMasterValues: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    facilityMakePaymentReq: builder.mutation<TFacilityMakePaymentApiResponse, { recordId: string }>({
      query: ({ recordId }) => ({
        url: `/entities/ExecuteRequest?RequestName=MakePaymentReq`,
        method: 'POST',
        body: {
          entityName: 'Facility',
          recordId,
          requestName: 'MakePaymentReq',
        },
      }),
      invalidatesTags: [],
    }),
    facilityRetrievePrevFacilityData: builder.query<
      Record<string, any>,
      {
        Page: TPage;
        FacilityId: string;
      }
    >({
      query: ({ Page, FacilityId }) => ({
        url: `/entities/ExecuteRequest?RequestName=RetrievePrevFacilityData`,
        method: 'POST',
        providesTags: ['facility-data'],
        body: {
          entityName: 'Facility',
          requestName: 'RetrievePrevFacilityData',
          inputParamters: {
            Page,
            FacilityId,
          },
        },
      }),
    }),
    employeeRetrieveInstiStudents: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    updateAmenity: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    studentRevokeApplication: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    checkInRoomInformation: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    employeeRetrieveTargetInstiProperties: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    exportStudents: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    retrieveAPInspectionFee: builder.query<TRetrieveAPInspectionFeeApiResponse, { recordId: string }>({
      query: ({ recordId }) => ({
        url: `/entities/ExecuteRequest?RequestName=RetrieveAPInspectionFee`,
        method: 'POST',
        body: {
          entityName: 'Facility',
          requestName: 'RetrieveAPInspectionFee',
          RecordId: recordId,
        },
      }),
    }),
    generateInspectionInvoice: builder.mutation<unknown, { recordId: string }>({
      query: ({ recordId }) => ({
        url: `/entities/ExecuteRequest?RequestName=UpsertRecordReq`,
        method: 'POST',
        body: {
          entityName: 'Facility',
          recordId,
          requestName: 'UpsertRecordReq',
          inputParamters: {
            Entity: {
              AdminFeeSstatus: '585',
            },
          },
        },
      }),
    }),

    accommodationApplicationsUpsertRecordReq: builder.mutation<
      unknown,
      {
        recordId?: string;
        values: Record<string, any>;
      }
    >({
      query: ({ values, recordId: RecordId }) => ({
        url: `/entities/ExecuteRequest?RequestName=InstiProcessApplication`,
        method: 'POST',
        body: {
          entityName: 'AccomodationApplications',
          requestName: 'InstiProcessApplication',
          RecordId,
          inputParamters: {
            Entity: {
              ...values,
            },
          },
        },
        invalidatesTags: ['accommodation-applications'],
      }),
    }),
    ExecuteRequest1: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    ExecuteRequest2: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    ExecuteRequest3: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    ExecuteRequest4: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    ExecuteRequest5: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),

    retrieveInstitutionStudentApplications: builder.query<
      TRetrieveInstitutionStudentApplicationsApiResponse,
      {
        supplierId: string;
        pageNumber?: number;
        pageSize?: number;
        Status: string;
        searchText?: string;
        Filters?: Array<{
          PortalListingId: string;
          ActionFilterId: string;
        }>;
      }
    >({
      query: ({ supplierId, pageNumber = 1, pageSize = 12, searchText = '', Filters = [], Status }) => ({
        url: `/entities/ExecuteRequest?RequestName=RetrieveInstiStudentApplications`,
        method: 'POST',
        body: {
          entityName: 'Employee',
          requestName: 'RetrieveInstiStudentApplications',
          inputParamters: {
            SupplierId: supplierId,
            PageNumber: pageNumber,
            PageSize: pageSize,
            SearchText: searchText,
            Filters,
            Status,
          },
        },
        providesTags: ['accommodation-applications'],
      }),
    }),
  }),
});

export const {
  useSignUpMutation,
  useEmployeeRetrieveInstiStudentsMutation,
  useEmployeeRetrieveTargetInstiPropertiesMutation,
  useLazyFacilityRetrievePrevFacilityDataQuery,
  useFacilityRetrievePrevFacilityDataQuery,
  useCasesRetrieveCaseRegardingReqMutation,
  useExternalLogonRetrieveAnnouncementsMutation,
  useTermTypeRetrieveMasterValuesMutation,
  useExternalLogonRetrieveQuickActionsMutation,
  useRetrieveAPFacilitiesMutation,
  useGetAlertNotificationsReqMutation,
  useCampusRetrieveMasterValuesMutation,
  useCasesRetrieveCaseClassificationsMutation,
  useSupplierGeneratOTPExecuteRequestMutation,
  useFacilityUpsertRecordReqMutation,
  useStudentRevokeApplicationMutation,
  useExportStudentsMutation,
  useProvinceRetrieveMasterValuesMutation,
  useCasesUpsertRecordReqMutation,
  useOfferLettersListingReqMutation,
  useSupplierConfirmOTPExecuteRequestMutation,
  useBulkApplicationRejectReqMutation,
  useSupplierDocLibretriveDocumentMutation,
  useRetrieveForcedActionsMutation,
  useFacilityRetrieveMasterValuesQuery,
  useLazyFacilityRetrieveMasterValuesQuery,
  useRetrievePageMasterValuesQuery,
  useUpdateAmenityMutation,
  useLazyRetrievePageMasterValuesQuery,
  useExternlaLogonRetrieveMasterValuesMutation,
  useFacilityMakePaymentReqMutation,
  useEmployeeRetrieveProfileDetailsReqMutation,
  useEmployeeUpsertRecordReqMutation,
  useGetOfferLettersQuery,
  useForcedActionUpsertMutation,
  useCasesCreateMutation,
  useCreateProfileMutation,
  useSuppllierUpsertRecordReqMutation,
  useFetchRecordWithDocsReqMutation,
  useUpdateCoverImageMutation,
  useAddressUpsertRecordReqMutation,
  useBankAccountUpsertRecordReqMutation,
  useSuppllierCreateDocumentExecuteReqMutation,
  useRetrieveSignwellReqMutation,
  useGetAPInvoicesMutation,
  useRenewTenantMutation,
  useAccomodationApplicationMutation,
  useGetStudentApplicationsMutation,
  useInvoiceMutation,
  useGetPropertyDetailsMutation,
  useFacilityPaymenyReceivedReqMutation,
  useEmployeeRetrieveDepartureDatesReqMutation,
  useCanStudentApplyForPropertyMutation,
  useContactPersonUpsertMutation,
  useStudentPropertyApplicationDatesMutation,
  useStudentPropertyApplicationMoveOutDatesMutation,
  useStudentApplyForPropertyMutation,
  useAuthenticateUserMutation,
  useRegisterUserMutation,
  useGetCurrentUserMutation,
  useCreateExternalLogonMutation,
  useGetListingActionsMutation,
  useRetrieveProfileDetailsReqMutation,
  useGetCasesMutation,
  useCheckInRoomInformationMutation,
  useGetCheckInListingMutation,
  useFacilityRemoveRecordReqMutation,
  useDeleteRoomMutation,
  useGetCheckInRoomTypesMutation,
  useGetTenantListingMutation,
  useGetTenantListingActionMutation,
  useGetStudentDetailsMutation,
  useSearchStudentMutation,
  useStudentSearchPropertyMutation,
  useGetStudentsPropetyApplicationsMutation,
  useCaseRegardingMutation,
  useGetCaseDetailsMutation,
  usePreviewDocumentReqMutation,
  useInvestigationLineMutation,
  useRetrievePlannedMoveOutDatesReqMutation,
  useCheckInMutation,
  useSurveyResponseAnswerMutation,
  useSurveyResponseMutation,
  useExternalLogonMutation,
  useCasesMutation,
  useCancelCheckInMutation,
  useSignCheckInLeaseMutation,
  useRetrieveDocumentMutation,
  useAddressMutation,
  useSupplierMutation,
  useBankAccountMutation,
  useGetApplicationRoomTypesQuery,
  useEmployeeMutation,
  useRetrieveAPInspectionFeeQuery,
  useGenerateInspectionInvoiceMutation,
  useRemoveRecordReqMutation,
  useRetrieveInstitutionStudentApplicationsQuery,
  useLazyRetrieveInstitutionStudentApplicationsQuery,
  useAccommodationApplicationsUpsertRecordReqMutation,
  //ExecuteRequests New Structure
  useExecuteRequest1Mutation,
  useExecuteRequest2Mutation,
  useExecuteRequest3Mutation,
  useExecuteRequest4Mutation,
  useExecuteRequest5Mutation,
} = authSlice;
