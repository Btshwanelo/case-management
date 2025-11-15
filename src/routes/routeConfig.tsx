// routes/routeConfig.js
import { Navigate } from "react-router-dom";

// Import all components
import SignUpPage from "../pages/SignUp/index.tsx";
import SignApp from "../pages/react-example.tsx";
import SignIn from "../pages/SignIn/index.tsx";
import ForgotPassword from "../pages/ForgotPassword/index.tsx";
import ResetPassword from "../pages/ResetPassword/index.tsx";
import TermsAndConditionPage from "../pages/TermsAndConditions/index.tsx";
import VideoScreen from "../pages/WatchVideo/VideoScreen.tsx";
import LogCaseForm from "../pages/Cases/UnAuthorizedCase.tsx";
import BlockProfile from "../pages/AP/BlockProfile/index.tsx";
import Appointment from "../pages/AP/Appointment/index.tsx";
import NotFoundPage from "../pages/NotFound/index.tsx";

// Protected route components
import LandingPage from "../pages/LandingPage/index.tsx";
import AssetsLoader from "../pages/AssetsLoader/index.tsx";
import MyResidence from "../pages/Student/MyResidence/index.tsx";
import ReleasePayment from "../pages/Invoices/ReleasePayment/index.tsx";
import AddResidence from "../pages/AddResidence/index.tsx";
import ResidenceApplicationUpdatePage from "../pages/Student/MyApplications/EditApplication.tsx";
import ResidenceSummary from "../pages/AddResidence/ResidenceSummary.tsx";
import MoreAboutProperty from "../pages/AddResidence/MoreAboutProperty.tsx";
import UploadPropertyImages from "../pages/AddResidence/UploadPropertyImages.tsx";
import InstitutionAddProperty from "../pages/PropertyList/AddProperty.tsx";
import BillingPage from "../pages/Billing/index.tsx";
import UploadPropertyDocuments from "../pages/AddResidence/UploadPropertyDocuments.tsx";
import PaymentInfo from "../pages/AddResidence/PaymentInfo.tsx";
import Dashboard from "../pages/Dashboard/index.tsx";
import CancelPayment from "../pages/PaymentOptions/Components/CancelPayment.tsx";
import SuccessPayment from "../pages/PaymentOptions/Components/SuccessPayment.tsx";
import OfferLetter from "../pages/OfferLetter/index.tsx";
import PaymentOptions from "../pages/PaymentOptions/index.tsx";
import Tenant from "../pages/AP/Tenants/index.tsx";
import APEditProfile from "../pages/AP/EditProfile/index.tsx";
import ApplyForStudent from "../pages/StudentApplicationList/ApplyForStudent.tsx";
import UserProfile from "../pages/AP/Students/Details/index.tsx";
import ReserveApplicationPage from "../pages/AP/Students/Details/Reserve.tsx";
import StudentSearch from "../pages/AP/Students/Search/index.tsx";
import StudentSearchinvite from "../pages/AP/Students/Invite/index.tsx";
import Onboarding from "../pages/OnBoarding/index.tsx";
import InvoicesScreen from "../pages/Invoices/index.tsx";
import CasesScreen from "../pages/Cases/index.tsx";
import Terminations from "../pages/AP/Terminations/inde.tsx";
import CreateCase from "../pages/Cases/Create.tsx";
import CaseDetails from "../pages/Cases/Details.tsx";
import ResidenceApplicationPage from "../pages/Student/AccomodationDetails/Apply.tsx";
import StudentPropertyDetails from "../pages/Student/AccomodationDetails/index.tsx";
import SearchResidence from "../pages/Student/SearchResidence/index.tsx";
import CheckIn from "../pages/Student/CheckIn/index.tsx";
import CheckInFlow from "../pages/Student/CheckIn/CheckInFlow.tsx";
import CreateProfile from "../pages/SignIn/CreateProfile.tsx";
import StudentEditProfile from "../pages/Student/EditProfile/index.tsx";
import StudentList from "../pages/StudentList/index.tsx";
import StudentApplicationList from "../pages/StudentApplicationList/index.tsx";
import PropertyList from "../pages/PropertyList/index.tsx";
import PropertyDetails from "../pages/Institution/PropertyDetails.tsx";
import ApplicationsView from "../pages/Student/MyApplications/index.tsx";
import ResidenceApplications from "../pages/Residences/index.tsx";
import AppointmentDetail from "@/pages/AP/Appointment/AppointmentDetail.tsx";
import BookAppointment from "@/pages/AP/Appointment/BookAppointment.tsx";
import EventsList from "../pages/AP/Appointment/index.tsx";
import AppointmentBooking from "@/pages/AP/Appointment/BookAppointment.tsx";
import AppointmentDetails from "@/pages/AP/Appointment/AppointmentDetail.tsx";

// Public routes configuration
export const publicRoutes = [
  // {
  //   path: "/sign-up",
  //   element: <SignUpPage />,
  //   requiresPublicRoute: false,
  // },
  // {
  //   path: "/sign",
  //   element: <SignApp />,
  //   requiresPublicRoute: false,
  // },
  {
    path: "/login",
    element: <SignIn />,
    requiresPublicRoute: false,
  },
  // {
  //   path: "/entry-type",
  //   element: <Navigate to="/login" />,
  //   requiresPublicRoute: false,
  // },
  // {
  //   path: "/forgot-password",
  //   element: <ForgotPassword />,
  //   requiresPublicRoute: false,
  // },
  // {
  //   path: "/terms-and-conditions",
  //   element: <TermsAndConditionPage />,
  //   requiresPublicRoute: false,
  // },
  // {
  //   path: "/reset-password",
  //   element: <ResetPassword />,
  //   requiresPublicRoute: false,
  // },
  // {
  //   path: "/watch-video",
  //   element: <VideoScreen />,
  //   requiresPublicRoute: false,
  // },
  // {
  //   path: "/support-case",
  //   element: <LogCaseForm />,
  //   requiresPublicRoute: false,
  // },
  // {
  //   path: '/block-profile',
  //   element: <BlockProfile />,
  //   requiresPublicRoute: false,
  // },
];

// Protected routes configuration
export const protectedRoutes = [
  // Home and main routes
  {
    path: '/',
    element: <CasesScreen />,
  },
  // {
  //   path: '/appointment',
  //   element: <EventsList />,
  // },
  // {
  //   path: '/appointment/:id',
  //   element: <AppointmentDetails />,
  // },
  // {
  //   path: '/appointment/:id/booking',
  //   element: <AppointmentBooking />,
  // },
  // {
  //   path: '/c1',
  //   element: <AssetsLoader />,
  // },
  // {
  //   path: '/my-residence',
  //   element: <MyResidence />,
  // },

  // Payment and billing routes
  // {
  //   path: '/invoices/:id/payment',
  //   element: <ReleasePayment />,
  // },
  // {
  //   path: '/billing',
  //   element: <BillingPage />,
  // },
  // {
  //   path: 'cancel',
  //   element: <CancelPayment />,
  // },
  // {
  //   path: 'success',
  //   element: <SuccessPayment />,
  // },
  // {
  //   path: 'payment-options',
  //   element: <PaymentOptions />,
  // },

  // Add residence workflow routes
  // {
  //   path: '/add-residence',
  //   element: <AddResidence step={1} />,
  // },
  // {
  //   path: '/add-room',
  //   element: <AddResidence step={2} />,
  // },
  // {
  //   path: '/describe-rooms',
  //   element: <AddResidence step={3} />,
  // },
  // {
  //   path: '/residence-summary',
  //   element: <ResidenceSummary />,
  // },
  // {
  //   path: '/more-about-property',
  //   element: <MoreAboutProperty />,
  // },
  // {
  //   path: '/upload-property-images',
  //   element: <UploadPropertyImages />,
  // },
  // {
  //   path: '/upload-property-documents',
  //   element: <UploadPropertyDocuments />,
  // },
  // {
  //   path: '/payment-info',
  //   element: <PaymentInfo />,
  // },

  // Student application routes
  // {
  //   path: '/student/applcation/:id/update',
  //   element: <ResidenceApplicationUpdatePage />,
  // },
  // {
  //   path: '/student-application-list/apply',
  //   element: <ApplyForStudent />,
  // },

  // Property and institution routes
  // {
  //   path: '/property-list/add-property',
  //   element: <InstitutionAddProperty />,
  // },
  // {
  //   path: '/property-list',
  //   element: <PropertyList />,
  // },
  // {
  //   path: '/intitution/property-details/:id',
  //   element: <PropertyDetails />,
  // },

  // Dashboard and main screens
  // {
  //   path: 'dashboard',
  //   element: <Dashboard />,
  // },
  // {
  //   path: 'offer-letter',
  //   element: <OfferLetter />,
  // },
  // {
  //   path: 'onboarding',
  //   element: <Onboarding />,
  // },

  // AP (Accommodation Provider) routes
  // {
  //   path: 'ap/tenants',
  //   element: <Tenant />,
  // },
  // {
  //   path: 'ap/edit-profile',
  //   element: <APEditProfile />,
  // },
  // {
  //   path: 'update-profile/documents',
  //   element: <APEditProfile />,
  // },
  // {
  //   path: '/ap/accomodation-applications/:recordId',
  //   element: <UserProfile />,
  // },
  // {
  //   path: '/ap/accomodation-applications/reserve',
  //   element: <ReserveApplicationPage />,
  // },
  // {
  //   path: 'ap/students/search',
  //   element: <StudentSearch />,
  // },
  // {
  //   path: 'ap/students/:id/invite',
  //   element: <StudentSearchinvite />,
  // },
  // {
  //   path: 'ap/students/:id',
  //   element: <UserProfile />,
  // },

  // Invoices and financial routes
  // {
  //   path: 'invoices',
  //   element: <InvoicesScreen />,
  // },

  // Cases and support routes
  {
    path: "cases",
    element: <CasesScreen />,
  },
  {
    path: "terminations",
    element: <Terminations />,
  },
  {
    path: "cases/create",
    element: <CreateCase />,
  },
  {
    path: "cases/:id",
    element: <CaseDetails />,
  },

  // Student-specific routes
  // {
  //   path: 'student/accomodation-details/:id/apply',
  //   element: <ResidenceApplicationPage />,
  // },
  // {
  //   path: 'student/accomodation-details/:id',
  //   element: <StudentPropertyDetails />,
  // },
  // {
  //   path: 'student/search-residence',
  //   element: <SearchResidence />,
  // },
  // {
  //   path: 'student/checkin',
  //   element: <CheckIn />,
  // },
  // {
  //   path: 'student/checkin/:id',
  //   element: <CheckInFlow />,
  // },
  // {
  //   path: 'student/edit-profile',
  //   element: <StudentEditProfile />,
  // },
  // {
  //   path: 'student/my-applications/home',
  //   element: <ApplicationsView />,
  // },

  // Profile routes
  // {
  //   path: 'profile/create',
  //   element: <CreateProfile />,
  // },

  // List and management routes
  // {
  //   path: '/student-list',
  //   element: <StudentList />,
  // },
  // {
  //   path: '/student-application-list',
  //   element: <StudentApplicationList />,
  // },
  // {
  //   path: 'residences',
  //   element: <ResidenceApplications />,
  // },
];

// Special routes (404, etc.)
export const specialRoutes = [
  {
    path: "*",
    element: <NotFoundPage />,
  },
];

// Route constants for easy reference throughout the app
export const ROUTES = {
  // Public routes
  SIGN_UP: "/sign-up",
  SIGN: "/sign",
  LOGIN: "/login",
  ENTRY_TYPE: "/entry-type",
  FORGOT_PASSWORD: "/forgot-password",
  TERMS_AND_CONDITIONS: "/terms-and-conditions",
  RESET_PASSWORD: "/reset-password",
  WATCH_VIDEO: "/watch-video",
  SUPPORT_CASE: "/support-case",
  BLOCK_PROFILE: "/block-profile",
  APPOINTMENT: "/appointment",

  // Protected routes - Main
  HOME: "/",
  C1: "/c1",
  MY_RESIDENCE: "/my-residence",
  DASHBOARD: "/dashboard",
  ONBOARDING: "/onboarding",

  // Protected routes - Payment & Billing
  BILLING: "/billing",
  PAYMENT_OPTIONS: "/payment-options",
  CANCEL_PAYMENT: "/cancel",
  SUCCESS_PAYMENT: "/success",
  OFFER_LETTER: "/offer-letter",

  // Protected routes - Add Residence Flow
  ADD_RESIDENCE: "/add-residence",
  ADD_ROOM: "/add-room",
  DESCRIBE_ROOMS: "/describe-rooms",
  RESIDENCE_SUMMARY: "/residence-summary",
  MORE_ABOUT_PROPERTY: "/more-about-property",
  UPLOAD_PROPERTY_IMAGES: "/upload-property-images",
  UPLOAD_PROPERTY_DOCUMENTS: "/upload-property-documents",
  PAYMENT_INFO: "/payment-info",

  // Protected routes - Student
  STUDENT_SEARCH_RESIDENCE: "/student/search-residence",
  STUDENT_CHECKIN: "/student/checkin",
  STUDENT_EDIT_PROFILE: "/student/edit-profile",
  STUDENT_MY_APPLICATIONS: "/student/my-applications/home",

  // Protected routes - AP (Accommodation Provider)
  AP_TENANTS: "/ap/tenants",
  AP_EDIT_PROFILE: "/ap/edit-profile",
  AP_STUDENTS_SEARCH: "/ap/students/search",

  // Protected routes - Cases & Support
  CASES: "/cases",
  CASES_CREATE: "/cases/create",
  TERMINATIONS: "/terminations",

  // Protected routes - Lists & Management
  STUDENT_LIST: "/student-list",
  STUDENT_APPLICATION_LIST: "/student-application-list",
  PROPERTY_LIST: "/property-list",
  RESIDENCES: "/residences",
  INVOICES: "/invoices",

  // Profile
  PROFILE_CREATE: "/profile/create",
};

// Route groups for easier management
export const ROUTE_GROUPS = {
  PUBLIC: [
    ROUTES.SIGN_UP,
    ROUTES.SIGN,
    ROUTES.LOGIN,
    ROUTES.ENTRY_TYPE,
    ROUTES.FORGOT_PASSWORD,
    ROUTES.TERMS_AND_CONDITIONS,
    ROUTES.RESET_PASSWORD,
    ROUTES.WATCH_VIDEO,
    ROUTES.SUPPORT_CASE,
    ROUTES.BLOCK_PROFILE,
    ROUTES.APPOINTMENT,
  ],
  STUDENT: [
    ROUTES.STUDENT_SEARCH_RESIDENCE,
    ROUTES.STUDENT_CHECKIN,
    ROUTES.STUDENT_EDIT_PROFILE,
    ROUTES.STUDENT_MY_APPLICATIONS,
  ],
  AP: [ROUTES.AP_TENANTS, ROUTES.AP_EDIT_PROFILE, ROUTES.AP_STUDENTS_SEARCH],
  ADMIN: [
    ROUTES.STUDENT_LIST,
    ROUTES.STUDENT_APPLICATION_LIST,
    ROUTES.PROPERTY_LIST,
  ],
  PAYMENT: [
    ROUTES.BILLING,
    ROUTES.PAYMENT_OPTIONS,
    ROUTES.CANCEL_PAYMENT,
    ROUTES.SUCCESS_PAYMENT,
    ROUTES.OFFER_LETTER,
  ],
  ADD_RESIDENCE_FLOW: [
    ROUTES.ADD_RESIDENCE,
    ROUTES.ADD_ROOM,
    ROUTES.DESCRIBE_ROOMS,
    ROUTES.RESIDENCE_SUMMARY,
    ROUTES.MORE_ABOUT_PROPERTY,
    ROUTES.UPLOAD_PROPERTY_IMAGES,
    ROUTES.UPLOAD_PROPERTY_DOCUMENTS,
    ROUTES.PAYMENT_INFO,
  ],
};
