import { RootState } from '@/store';
import { useSelector } from 'react-redux';

function useCurrentUser() {
  const userDetails = useSelector((state: RootState) => state.details.requestResults);

  return userDetails;
}

export default useCurrentUser;
