import { RootState } from '@/store';
import { useSelector } from 'react-redux';

function useNavigation() {
  const navigationDetails = useSelector((state: RootState) => state.navigation);

  return navigationDetails;
}

export default useNavigation;
