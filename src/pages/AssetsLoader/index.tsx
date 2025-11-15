import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store';
import {
  useExternalLogonRetrieveAnnouncementsMutation,
  useExternalLogonRetrieveQuickActionsMutation,
  useGetAlertNotificationsReqMutation,
  useRetrieveForcedActionsMutation,
} from '@/services/apiService';
import { setForcedActions } from '@/slices/forcedActionsSlice';
import { setNotifications } from '@/slices/notificationSlice';
import PageLoder from '@/components/PageLoder';
import { setAnnouncements } from '@/slices/announcementsSlice';
import { setQuickActions } from '@/slices/quickActionSlice';

const AssetsLoader = () => {
  const userDetails = useSelector((state: RootState) => state.details.requestResults);
  const redirectPath = useSelector((state: RootState) => state.auth.redirectPath);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [getAlertNotificationsReq, { data: dataNotifications, isLoading: isLoadingAlerts, isSuccess: isAlertsSuccess }] =
    useGetAlertNotificationsReqMutation();

  const [retrieveForcedActions, { data: dataActions, isLoading: isLoadingActions, isSuccess: isActionsSuccess }] =
    useRetrieveForcedActionsMutation();
  const [
    externalLogonRetrieveAnnouncements,
    { data: dataAnnouncements, isLoading: isLoadingAnnouncements, isSuccess: isAnnouncementsSuccess },
  ] = useExternalLogonRetrieveAnnouncementsMutation();
  const [
    externalLogonRetrieveQuickActions,
    { data: dataQuickActions, isLoading: isLoadingQuickActions, isSuccess: isQuickActionsSuccess },
  ] = useExternalLogonRetrieveQuickActionsMutation();

  // Fetch alerts with error handling and loading state
  const fetchAlerts = useCallback(async () => {
    if (!userDetails?.externalLogonId) {
      console.warn('Missing externalLogonId, skipping alerts fetch');
      return;
    }

    try {
      const result = await getAlertNotificationsReq({
        body: {
          recordId: userDetails.externalLogonId,
          entityName: 'ExternalLogOn',
          requestName: 'GetAlertNotificationsReq',
        },
      }).unwrap();

      // Handle the successful response
      if (result?.Alerts) {
        dispatch(setNotifications(result.Alerts));
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  }, [userDetails?.externalLogonId, getAlertNotificationsReq, dispatch]);

  // Fetch forced actions with error handling and loading state
  const fetchForcedActions = useCallback(async () => {
    if (!userDetails?.supplierId && !userDetails?.recordId) {
      console.warn('Missing supplier/record ID, skipping forced actions fetch');
      return;
    }

    try {
      const result = await retrieveForcedActions({
        body: {
          entityName: 'ExternalLogon',
          requestName: 'RetrieveForcedActions',
          inputParamters: {
            UserId: userDetails?.supplierId || userDetails?.recordId,
            UserType: userDetails.relatedObjectIdObjectTypeCode,
          },
        },
      }).unwrap();

      // Handle the successful response
      if (result?.forcedActions) {
        dispatch(setForcedActions(result.forcedActions));
      }
    } catch (error) {
      console.error('Error fetching forced actions:', error);
    }
  }, [userDetails, retrieveForcedActions, dispatch]);

  // Fetch forced actions with error handling and loading state
  const fetchQuickActions = useCallback(async () => {
    if (!userDetails?.supplierId && !userDetails?.recordId) {
      console.warn('Missing supplier/record ID, skipping forced actions fetch');
      return;
    }

    try {
      const result = await externalLogonRetrieveQuickActions({
        body: {
          entityName: 'ExternalLogon',
          requestName: 'RetrieveQuickActions',
          inputParamters: {
            ExternalLogonId: userDetails.externalLogonId,
            PageNumber: 1,
            PageSize: 12,
          },
        },
      }).unwrap();

      // Handle the successful response
      if (result?.quickActions) {
        dispatch(setQuickActions(result.quickActions));
      }
    } catch (error) {
      console.error('Error fetching forced actions:', error);
    }
  }, [userDetails, retrieveForcedActions, dispatch]);
  // Fetch forced actions with error handling and loading state
  const fetchAnnouncements = useCallback(async () => {
    if (!userDetails?.supplierId && !userDetails?.recordId) {
      console.warn('Missing supplier/record ID, skipping forced actions fetch');
      return;
    }

    try {
      const result = await externalLogonRetrieveAnnouncements({
        body: {
          entityName: 'ExternalLogon',
          requestName: 'RetrieveAnnouncements',
          inputParamters: {
            ExternalLogonId: userDetails.externalLogonId,
          },
        },
      }).unwrap();

      // Handle the successful response
      if (result?.announcements) {
        dispatch(setAnnouncements(result.announcements));
      }
    } catch (error) {
      console.error('Error fetching forced actions:', error);
    }
  }, [userDetails, retrieveForcedActions, dispatch]);

  // Effect to fetch data and handle navigation
  useEffect(() => {
    const initializeData = async () => {
      // Wait for both requests to complete
      const results = await Promise.allSettled([fetchAlerts(), fetchForcedActions(), fetchAnnouncements(), fetchQuickActions()]);

      // Log any errors that occurred
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Request ${index} failed:`, result.reason);
        }
      });

      // Navigate after requests complete, regardless of outcome
      navigate('/');
    };

    initializeData();
  }, [fetchAlerts, fetchForcedActions, navigate, redirectPath]);

  // Handle loading states
  const isLoading = isLoadingAlerts || isLoadingActions;

  // Show loading indicator while requests are in progress
  return <div className="bg-white min-h-screen flex items-center justify-center">{isLoading && <PageLoder />}</div>;
};

export default AssetsLoader;
