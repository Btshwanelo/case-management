import { apiSlice } from '../slices/apiSlice';

// Input Types
interface StudentDetailsInputParameters {
  accomodationProviderId: string;
}

interface StudentDetailsRequestBody {
  entityName: 'AccomodationApplications';
  requestName: 'StudentDetailsReq';
  recordId: string;
  Inputparamters: StudentDetailsInputParameters;
}

// Response Types
interface LeaseDetail {
  title: string;
  value: string;
  status: string | null;
  leaseStatus: string | null;
  terminationStatus: string | null;
  noticeMonth: string | null;
  color: string | null;
  supplierId: string | null;
  employeedId: string | null;
  applicationStatus: number;
  facilityIdName: string | null;
}

interface FundingStatus {
  title: string;
  status: string;
  value: string;
}

interface StudentDetails {
  name: string;
  email: string;
  idNumber: string;
  status: number;
  statustext: string;
  termType: number;
  termTypetext: string;
  plannedMoveInDate: string;
  applicationStatus: number;
  applicationStatustext: string;
  employeeId: string;
  mobile: string;
}

interface Notice {
  noticeType: string;
  consentMessage: string;
  message: string;
  consentRequired: boolean;
  description: string;
}

interface StudentDetailsResponse {
  LeaseDetails: LeaseDetail[];
  FundingStatus: FundingStatus[];
  StudentDetails: StudentDetails;
  nsfasFundingStatus: null;
  Notice: Notice[];
  Actions: any[];
  clientMessage: null;
  results: null;
  gotoUrl: null;
}

export const accomodationApplicationSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    StudentDetailsReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    PrepopulateStudentInfoReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    FilterFaciltyByCampusReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    UpsertAccomodationAppReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    ServeNotice: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    AccomodationAppRegenerateLease: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),

    AccomodationApplicationsUpsertRecordReq: builder.mutation<
      StudentDetailsResponse,
      { recordId: string; Inputparamters: StudentDetailsInputParameters }
    >({
      query: ({ recordId, Inputparamters }) => ({
        url: `/entities/ExecuteRequest??RequestName=StudentDetailsReq`,
        method: 'POST',
        body: {
          entityName: 'AccomodationApplications',
          requestName: 'StudentDetailsReq',
          recordId,
          Inputparamters,
        } as StudentDetailsRequestBody,
      }),
      invalidatesTags: [],
    }),
  }),
});

export const {
  useStudentDetailsReqMutation,
  useFilterFaciltyByCampusReqMutation,
  useAccomodationAppRegenerateLeaseMutation,
  usePrepopulateStudentInfoReqMutation,
  useUpsertAccomodationAppReqMutation,
  useServeNoticeMutation,
} = accomodationApplicationSlice;

// Export types for use in components
export type { StudentDetailsResponse, StudentDetails, LeaseDetail, FundingStatus, Notice };

// accomodationApplication({
//     body: {
//       entityName: 'AccomodationApplications',
//       requestName: 'UpsertRecordReq',
//       recordId: recordId,
//       inputParamters: {
//         Entity: {
//           StatusId: 70,
//         },
//       },
//     },
//   });

// getStudentDetails({
//     body: {
//       entityName: 'AccomodationApplications',
//       requestName: 'StudentDetailsReq',
//       recordId: id,
//       Inputparamters: {
//         accomodationProviderId: 'c8b6f76b-9db8-4788-bb90-f4cccd0ad57b',
//       },
//     },
//   });

// retrieveSignwellReq({
//     body: {
//       entityName: 'AccomodationApplications',
//       requestName: 'RetrieveSignwellReq',
//       recordId: recordId,
//       inputParamters: {
//         UserType: 'AP',
//       },
//     },
//   });

// accomodationApplication({
//     body: {
//       entityName: 'AccomodationApplications',
//       requestName: 'UpsertRecordReq',
//       recordId: accomodationDetails.accomodationApplicationsId,
//       inputParamters: {
//         Entity: {
//           StatusId: 69,
//           CapacityId: data.capacityId,
//           RoomNumber: data.roomNumber,
//           ReservationDuration: data.reservationDuration,
//         },
//       },
//     },
//   });

// studentApplyForProperty({
//     body: {
//       entityName: 'AccomodationApplications',
//       requestName: 'UpsertRecordReq',
//       inputParamters: {
//         Entity: {
//           studentId: userDetails.recordId,
//           facilityId: id,
//           capacityId: preferedRoomType,
//           PreferredRoomTypeId: preferedRoomType,
//           PlannedMoveInDate: plannedMoveInDate,
//           ArrivalDate: plannedArrivalDate,
//           DepartureDate: departureDates?.DepartureDates,
//           PlannedMoveOutDate: plannedMoveOutDate,
//         },
//       },
//     },
//   });

// employee({
//     body: {
//       entityName: 'AccomodationApplications',
//       requestName: 'StudentDetailsReq',
//       recordId: recordId,
//       Inputparamters: {
//         accomodationProviderId: userDetails.supplierId,
//       },
//     },
//   });

// query: ({ values, recordId: RecordId }) => ({
//     url: `/entities/ExecuteRequest`,
//     method: 'POST',
//     body: {
//       entityName: 'AccomodationApplications',
//       requestName: 'InstiProcessApplication',
//       RecordId,
//       inputParamters: {
//         Entity: {
//           ...values,
//         },
//       },
//     },
//     invalidatesTags: ['accommodation-applications'],
//   }),
