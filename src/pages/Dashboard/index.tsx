import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Users, Home, FileText, Briefcase, UserCheck } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useSearchParams } from 'react-router-dom';
import StudentDashboard from './StudentDashboard';
import APDashboard from './APDashboard';

const DashboardContent = () => {
  const { relatedObjectIdObjectTypeCode } = useSelector((state: RootState) => state.auth.user);
  const userDetails = useSelector((state: RootState) => state.details.requestResults);
  if (userDetails.relatedObjectIdObjectTypeCode === 'Supplier') {
    return <APDashboard userDetails={userDetails} />;
  }
  if (userDetails.relatedObjectIdObjectTypeCode === 'Employee') {
    return <StudentDashboard userDetails={userDetails} />;
  }

  return <div></div>;
};

export default DashboardContent;
