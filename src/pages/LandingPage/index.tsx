import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import APLandingPage from './APLanding';
import StudentLandingPage from './StudentLanding';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const userDetails = useSelector((state: RootState) => state.details.requestResults);
  const navigation = useSelector((state: RootState) => state.details.navigation);

  useEffect(() => {
    if (
      !userDetails ||
      (userDetails.relatedObjectIdObjectTypeCode !== 'Supplier' && userDetails.relatedObjectIdObjectTypeCode !== 'Employee')
    ) {
      navigate('/login');
    }
  }, [userDetails, navigate]);

  if (userDetails.relatedObjectIdObjectTypeCode === 'Supplier') {
    return <APLandingPage userDetails={userDetails} navigation={navigation} />;
  }
  if (userDetails.relatedObjectIdObjectTypeCode === 'Employee') {
    return <StudentLandingPage userDetails={userDetails} navigation={navigation} />;
  }

  return null;
};

export default LandingPage;
