export type TPage =
  | 'add-residence'
  | 'add-room'
  | 'residence-summary'
  | 'room-details'
  | 'describe-rooms'
  | 'more-about-property'
  | 'upload-property-images'
  | 'upload-property-documents'
  | 'student-application-list';

export type TEntityName = 'FacilityDocLib' | 'Facility';

export enum EUploadDocumentType {
  CoverImage = 889,
  NonCoverImage = 893,
  MunicipalPlan = 888,
  ProofOfAddress = 904,
  FloorPlan = 906,
  FireCertificate = 1020,
  ElectricalCertificate = 1019,
}

export type TRemoteFile = {
  documentTypeId: number;
  documentTypeName: string;
  fileName: string;
  fileContent: string;
  fileExtention: string;
  recordId: string;
  url: string;
};

export type TUploadedFile =
  | {
      file: File;
      preview: string | null;
      isCover?: boolean;
      remote: false;
      type?: EUploadDocumentType;
    }
  | {
      file: TRemoteFile;
      preview: string | null;
      isCover?: boolean;
      remote: true;
      type?: EUploadDocumentType;
    };
