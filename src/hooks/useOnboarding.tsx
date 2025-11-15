import { RootState } from '@/store';
import { useSelector } from 'react-redux';

function useOnboarding() {
  const onboardingDetails = useSelector((state: RootState) => state.details);

  return onboardingDetails;
}

export default useOnboarding;
