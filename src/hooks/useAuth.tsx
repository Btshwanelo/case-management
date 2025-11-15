import { RootState } from '@/store';
import { useSelector } from 'react-redux';

function useAuth() {
  const authDetails = useSelector((state: RootState) => state.auth);

  return authDetails;
}

export default useAuth;
