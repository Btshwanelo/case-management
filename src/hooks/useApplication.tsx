import { RootState } from '@/store';
import { useSelector } from 'react-redux';

function useApplication() {
  const applicationDetails = useSelector((state: RootState) => state.applicationReserve.application);

  return applicationDetails;
}

export default useApplication;
