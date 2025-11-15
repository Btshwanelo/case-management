import { RootState } from '@/store';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import APFlow from './APFlow';
import StudentFlow from './StudentFlow';
import useOnboarding from '@/hooks/useOnboarding';

const Onboarding = () => {
  const { relatedObjectIdObjectTypeCode } = useSelector((state: RootState) => state.auth.user);
  const onboardingDetails = useOnboarding();
  if (relatedObjectIdObjectTypeCode === 'Supplier') {
    return <APFlow />;
  }
  if (relatedObjectIdObjectTypeCode === 'Employee') {
    return <StudentFlow />;
  }

  return null;
};

export default Onboarding;
