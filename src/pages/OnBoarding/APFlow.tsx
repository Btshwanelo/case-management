import React, { useEffect, useState } from 'react';
import CompanyDetails from './Components/CompanyDetails';
import AddressDetails from './Components/AddressDetails';
import BankingDetails from './Components/BankingDetails';
import ThankYou from './Components/ThankYou';
import ContactDetails from './Components/ContactDetails';
import NextOfKin from './Components/NextOfKin';
import APDocuments from './Components/APDocuments';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { updateInProgressStep } from '@/slices/detailsSlice';

const APFlow = () => {
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
        <CompanyDetails
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
    case 1080:
      return (
        <ContactDetails
          onNext={() => {
            dispatch(
              updateInProgressStep({
                title: 'NextOfKin',
                step: 1081,
              })
            );
          }}
        />
      ); //1080
    case 1081:
      return (
        <NextOfKin
          onNext={() => {
            dispatch(
              updateInProgressStep({
                title: 'AddressDetails',
                step: 1082,
              })
            );
          }}
        />
      ); //1081
    case 1082:
      return (
        <AddressDetails
          onNext={() => {
            dispatch(
              updateInProgressStep({
                title: 'BankingDetails',
                step: 1083,
              })
            );
          }}
        />
      ); //1082
    case 1083:
      return (
        <BankingDetails
          onNext={() => {
            dispatch(
              updateInProgressStep({
                title: 'APDocuments',
                step: 1084,
              })
            );
          }}
        />
      ); //1083
    case 1084:
      return (
        <APDocuments
          onNext={() => {
            dispatch(
              updateInProgressStep({
                title: 'ThankYou',
                step: 0,
              })
            );
          }}
        />
      ); //1084
    case 0:
      return <ThankYou />;
  }
  return <div></div>;
};

export default APFlow;
