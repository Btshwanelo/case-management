import React, { useEffect, useState } from 'react';

import LoginBg from '@/assets/dash-bg.jpg';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useLocation } from 'react-router-dom';

import { setRedirectPath } from '@/slices/authSlice';
import ForcedActionsModal from '@/pages/ForcedAction';
import DismissableAlerts from '@/components/DismissableAlerts';
import Navbar from '@/components/Navbar';
import TermsAndConditionsModal from '@/components/TermsAndConditionsModal';
import { useFacilityUpsertRecordReqMutation } from '@/services/apiService';
import termsAndCondition from '@/assets/file_terms.pdf';
import { updateRequestResults, updateTsAndCsAccepted } from '@/slices/detailsSlice';
import { isErrored } from 'stream';

const BackgroundImageLayout = ({ children }) => {
  const location = useLocation();
  const { pathname } = location;
  const [isOpen, setIsOpen] = useState(false);

  const forcedActions = useSelector((state: RootState) => state.forcedActions.forcedActions);
  const notifications = useSelector((state: RootState) => state.notifications.notifications);
  const userDetails = useSelector((state: RootState) => state.auth.user);
  const requestResults = useSelector((state: RootState) => state.details.requestResults);
  const dispatch = useDispatch();
  const redirectPath = useSelector((state: RootState) => state.auth.redirectPath);

  const [facilityUpsertRecordReq, { isLoading, isSuccess, isError }] = useFacilityUpsertRecordReqMutation();
  const handleUpdateTsAnCs = () => {
    facilityUpsertRecordReq({
      body: {
        entityName: 'ExternalLogOn',
        requestName: 'UpsertRecordReq',
        recordId: userDetails.externalLogonId,
        inputParamters: {
          Entity: {
            TsAndCsAccepted: true,
          },
        },
      },
    });
  };

  if (redirectPath !== '/') {
    dispatch(setRedirectPath('/'));
  }

  if (isSuccess) {
    dispatch(updateTsAndCsAccepted(true));
  }
  if (isError) {
    dispatch(updateTsAndCsAccepted(true));
  }

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col image-overlay"
      style={{
        backgroundImage: `
        linear-gradient(
          180deg, 
          rgba(243, 135, 68, 0.44) 0%, 
          rgba(220, 104, 3, 0.87) 100%
        ),
        url(${LoginBg})
      `,
        backgroundColor: 'lightgray', // Fallback color while image loads
      }}
    >
      <>
        <Navbar />
        {forcedActions?.length > 0 && pathname != forcedActions[0]?.url && (
          <ForcedActionsModal
            icon={forcedActions[0].icon}
            title={forcedActions[0].title}
            description={forcedActions[0].description}
            isRedirect={forcedActions[0].isRedirect}
            entity={forcedActions[0].entity}
            actionAttributes={forcedActions[0].actionAttributes}
            url={forcedActions[0].url}
          />
        )}

        {requestResults.tsAndCsAccepted != true && (
          <TermsAndConditionsModal
            isOpen={true}
            onAcceptTerms={handleUpdateTsAnCs}
            isLoading={isLoading}
            isSuccess={isSuccess}
            pdfUrl={termsAndCondition}
          />
        )}

        <DismissableAlerts alerts={notifications} />
      </>
      <div></div>
      <div className="container mx-auto px-4 sm:px-4 lg:px-4 mt-6 mb-6 z-2 ">{children}</div>
    </div>
  );
};

export default BackgroundImageLayout;
