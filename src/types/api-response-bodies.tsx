export type TAddPageMasterValuesApiResponse = {
  staticData: {
    schemaName: string;
    options: {
      lable: string;
      value: string;
    }[];
  }[];
};

export type TRetrieveAPInspectionFeeApiResponse = {
  AdminFee: number;
  TotalCapacity: number;
};

export type TFacilityMakePaymentApiResponse = {
  name_first: string;
  name_last: string;
  email_address: string;
  cell_number: string;
  m_payment_id: string;
  amount: number;
  item_name: string;
  item_description: string;
  action: string;
  merchant_id: string;
  merchant_key: string;
  invoiceId: string;
};

export type TPrevFacilityDataApiResponse = {
  FacilityDetails: {
    inspectionDate: string | null;
    facilityId: string | null;
    amount: string | null;
    name: string | null;
    address: string | null;
    institutionId: string | null;
    campusId: string | null;
    gradingIdName: string | null;
    facilityStatusId: number;
    targetInstitution: string | null;
    kmToCampus: number;
    provinceId: number;
    totalBeds: string | null;
    fullEdit: string | null;
    buttons: string | null;
    documents: string | null;
  };
};

type TDataType = 'dropdown' | 'text';
type TListing = {
  value: string;
  inLineEdit: boolean;
  dataType: TDataType;
  masterValueSchemaName: string | null;
  validation?: string;
};

export type TRetrieveInstitutionStudentApplicationsApiResponse = {
  Summary: {
    totalApplications: number;
    pendingApproval: number;
    approved: number;
    rejected: number;
    pendingInstitutionReview: number;
  };
  PageSize: number;
  RecordCount: number;
  Pages: number;
  Listing: {
    accomodationApplicationsId: TListing | null;
    facilityName: TListing | null;
    facilityId: TListing | null;
    studentName: TListing | null;
    institutionIdName: TListing | null;
    campusIdName: TListing | null;
    gender: TListing | null;
    studentStatus: TListing | null;
    studentTermType: TListing | null;
    allowanceTypeId: TListing | null;
    idNumber: TListing | null;
    processCycle: TListing | null;
  }[];
  clientMessage: string | null;
  results: unknown[] | null;
  gotoUrl: string | null;
};
