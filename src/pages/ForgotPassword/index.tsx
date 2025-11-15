import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import APForgotPassword from './APForgotPassword';
import StudentForgotPassword from './StudentForgotPassword';

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get('type');

  useEffect(() => {
    if (!type || (type !== 's' && type !== 'p')) {
      navigate('/login');
    }
  }, [type, navigate]);

  switch (type) {
    case 's':
      return <StudentForgotPassword />;
    case 'p':
      return <APForgotPassword />;
    default:
      return null;
  }
};

export default ForgotPassword;
