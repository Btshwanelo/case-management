import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { updateNavigation, updateProfileComplete, updateRequestResults } from '@/slices/detailsSlice';
import { useGetCurrentUserMutation } from '@/services/apiService';

const ThankYou = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { externalLogonId, relatedObjectIdObjectTypeCode } = useSelector((state: RootState) => state.auth.user);

  const [
    getCurrentUser,
    { isLoading: isLoadingCurrentUser, isSuccess: isSuccessCurrentUser, isError: isErrorCurrentUser, data: CurrentUser },
  ] = useGetCurrentUserMutation();

  useEffect(() => {
    if (relatedObjectIdObjectTypeCode === 'Supplier') {
      getCurrentUser({
        body: {
          entityName: 'ExternalLogon',
          requestName: 'RetrieveCurrentUser',
          inputParamters: {
            ExternalLogonId: externalLogonId,
          },
        },
      });
    }
  }, []);

  useEffect(() => {
    if (isSuccessCurrentUser) {
      dispatch(updateNavigation(CurrentUser.navigation));
      dispatch(updateProfileComplete(true));
      dispatch(updateRequestResults(CurrentUser.requestResults));
      // navigate('/c1');
    }
  }, [isSuccessCurrentUser, CurrentUser]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-xl w-full text-center space-y-2">
        {/* Success Icon */}
        <div className="mb-4">
          <div className="h-16 w-16 rounded-full border-2 border-zinc-200 flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-gray-800" />
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-gray-900">Thank you!</h1>

          <p className="text-md text-zinc-600">Your profile has been set up successfully.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Button
            className="bg-orange-500 hover:bg-orange-600 px-8"
            onClick={() => {
              dispatch(updateProfileComplete(true));
              navigate('/c1');
            }}
          >
            Go To Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
