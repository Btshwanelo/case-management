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
    CheckInConfirmCode: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
  }),
});

export const { useCheckInConfirmCodeMutation } = accomodationApplicationSlice;
