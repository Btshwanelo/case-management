import React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useLocation } from 'react-router-dom';

import { setRedirectPath } from '@/slices/authSlice';
import ForcedActionsModal from '@/pages/ForcedAction';
import DismissableAlerts from '@/components/DismissableAlerts';
import Navbar from '@/components/Navbar';
import TermsAndConditionsModal from '@/components/TermsAndConditionsModal';
import OnboardingNavHeader from '@/components/OnboardingNavHeader';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const { pathname } = location;

  const forcedActions = useSelector((state: RootState) => state.forcedActions.forcedActions);
  const notifications = useSelector((state: RootState) => state.notifications.notifications);
  
  const dispatch = useDispatch();
  const redirectPath = useSelector((state: RootState) => state.auth.redirectPath);

  if (redirectPath !== '/') {
    dispatch(setRedirectPath('/'));
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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

        <DismissableAlerts alerts={notifications} />
      </>

      <div className="container mx-auto px-4 sm:px-4 lg:px-4 mt-6 mb-6">{children}</div>
    </div>
  );
};

export default DashboardLayout;
