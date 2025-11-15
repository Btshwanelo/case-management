import { apiSlice } from '../slices/apiSlice';

interface FacilityDetails {
  checkInCode: string | null;
  inspectionDate: string | null;
  facilityId: string | null;
  amount: string | null;
  name: string | null;
  address: string | null;
  institutionId: string | null;
  campusId: string | null;
  gradingIdName: string | null;
  facilityStatusId: number | null;
  targetInstitution: string | null;
  kmToCampus: number | null;
  provinceId: number | null;
  totalBeds: string | null;
  fullEdit: boolean | null;
  facilityStatusIdText: string | null;
  buttons: [] | null;
  documents: [] | null;
}

interface PrevFacilityDataResponse {
  FacilityDetails: FacilityDetails;
  clientMessage: null;
  results: null;
  gotoUrl: null;
}

export const accomodationApplicationSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    RetrivePrevFacilityData: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    GetRoomTypesFacility: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    FacilityUpsertRecordReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    FacilityRetrieveAPInspectionFee: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    FacilityCreateDocumentExecuteRequest: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    FacilityDocLib: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    GenerateOfferLetterPDF: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    TerminationListing: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    FacilityDocLibUpsertRecordReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
  }),
});

export const {
  useRetrivePrevFacilityDataMutation,
  useFacilityUpsertRecordReqMutation,
  useFacilityCreateDocumentExecuteRequestMutation,
  useFacilityDocLibMutation,
  useTerminationListingMutation,
  useFacilityDocLibUpsertRecordReqMutation,
  useFacilityRetrieveAPInspectionFeeMutation,
  useGenerateOfferLetterPDFMutation,
  useGetRoomTypesFacilityMutation,
} = accomodationApplicationSlice;
