import * as yup from 'yup';

export const formSchema = yup.object({
  name: yup.string().required('First name is required'),
  // password: yup.date().required("Birth date is required"),
});
// export const StudentSignUpSchema = yup.object({
//   firstName: yup.string().required('This field is required'),
//   lastName: yup.string().required('This field is required'),
//   password: yup.string().required('This field is required'),
//   confirmPassword: yup
//     .string()
//     .oneOf([yup.ref('password')], 'Passwords must match')
//     .required('This field is required'),
//   idNumber: yup
//     .string()
//     .matches(/^\d{13}$/, 'ID Number must be exactly 13 digits')
//     .required('This field is required'),
//   email: yup.string().email('Invalid email format').required('This field is required'),
// });

export const StudentSignUpSchema = yup.object({
  firstName: yup
    .string()
    .min(3, 'First name must be at least 3 characters')
    .matches(/^[A-Za-z\s]+$/, 'First name can only contain letters and spaces')
    .required('This field is required'),

  lastName: yup
    .string()
    .min(3, 'Last name must be at least 3 characters')
    .matches(/^[A-Za-z\s]+$/, 'Last name can only contain letters and spaces')
    .required('This field is required'),

  password: yup.string().required('This field is required'),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('This field is required'),

  idNumber: yup
    .string()
    .matches(/^\d{13}$/, 'ID Number must be exactly 13 digits')
    .required('This field is required'),

  email: yup.string().email('Invalid email format').required('This field is required'),

  mobile: yup
    .string()
    .matches(/^\d{10}$/, 'Mobile number must be exactly 10 digits')
    .required('This field is required'),
});

export const APSignUpSchema = yup.object({
  firstName: yup.string().required('This field is required'),
  password: yup.string().required('This field is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('This field is required'),
  email: yup.string().email('Invalid email format').required('This field is required'),
});
export const StudentUpdateProfileDetails = yup.object({
  firstName: yup.string(),
  lastName: yup.string(),
  email: yup.string(),
  mobileNumber: yup.string(),
  idNumber: yup.string(),
  gender: yup.string(),
  fullName: yup.string(),
  relationship: yup.string(),
  nextOfKinNumber: yup.string(),
  nextOfkInEmail: yup.string(),
});
export const StudentSignInSchema = yup.object({
  idNumber: yup
    .string()
    .required('ID number is required')
    .matches(/^\d{13}$/, 'ID Number must be exactly 13 digits'),
  password: yup.string().required('Password is required'),
});
export const APSignInSchema = yup.object({
  email: yup.string().required('Email number is required').email('Invalid email format'),
  password: yup.string().required('Password is required'),
});
export const APReserveApplication = yup.object({
  roomNumber: yup.string().required('This field is required'),
  reservationDuration: yup.string().required('This field is required'),
  capacityId: yup.string().required('This field is required'),
  // plannedMoveInDate: yup.string().required('This field is required'),
});
export const CreateCaseSchema = yup
  .object({
    CaseClassificationId: yup.string().required('This field is required'),
    NoticeMonth: yup.string().when('CaseClassificationId', {
      is: (id) => id && Boolean(id),
      then: (schema) => schema.required('This field is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    ClassificationOtherInput: yup.string().when('CaseClassificationId', {
      is: (id) => id && Boolean(id),
      then: (schema) => schema.required('This field is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    SubClassificationId: yup.string().when('CaseClassificationId', {
      is: (id) => id && Boolean(id),
      then: (schema) => schema.required('This field is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    SubClassificationOtherInput: yup.string().when('SubClassificationId', {
      is: (id) => id && Boolean(id),
      then: (schema) => schema.required('This field is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    RegardingId: yup.string(),
    Subject: yup.string().required('This field is required'),
    Description: yup.string().required('This field is required'),
  })
  .strict();
