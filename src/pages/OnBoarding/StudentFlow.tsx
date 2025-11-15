import React, { useEffect, useState } from 'react';
import ThankYou from './Components/ThankYou';
import AcademicDetails from './Components/AcademicDetails';
import StudentDocuments from './Components/StudentDocuments';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { updateInProgressStep } from '@/slices/detailsSlice';
import StudentContactDetails from './Components/StudentContactDetails';
import StudentPersonalDetails from './Components/StudentPersonalDetails';
import NextOfKin from './Components/NextOfKin';
import StudentNextOfKin from './Components/StudentNextOfKin';

const StudentFlow = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { isProfileComplete, inProgressStep, profileDetails } = useSelector((state: RootState) => state.details);

  useEffect(() => {
    if (isProfileComplete) {
      navigate('/');
    }
  }, []);

  switch (inProgressStep.step) {
    case 1079:
      return (
        <StudentPersonalDetails
          onNext={() => {
            dispatch(
              updateInProgressStep({
                title: 'NextOfKin',
                step: 1080,
              })
            );
          }}
        />
      ); //1079
    // case 1080:
    //   return (
    //     <StudentContactDetails
    //       onNext={() => {
    //         dispatch(
    //           updateInProgressStep({
    //             title: 'AcademicDetails',
    //             step: 1081,
    //           })
    //         );
    //       }}
    //     />
    //   ); //1080
    case 1080:
      return (
        <StudentNextOfKin
          onNext={() => {
            dispatch(
              updateInProgressStep({
                title: 'AcademicDetails',
                step: 1081,
              })
            );
          }}
        />
      ); //1080
    case 1081:
      return (
        <AcademicDetails
          onNext={() => {
            dispatch(
              updateInProgressStep({
                title: 'StudentDocuments',
                step: 1082,
              })
            );
          }}
        />
      ); //1081
    case 1082:
      return (
        <StudentDocuments
          onNext={() => {
            dispatch(
              updateInProgressStep({
                title: 'ThankYou',
                step: 0,
              })
            );
          }}
        />
      ); //1082
    case 0:
      return <ThankYou />;
  }
  return <div></div>;
};

export default StudentFlow;
