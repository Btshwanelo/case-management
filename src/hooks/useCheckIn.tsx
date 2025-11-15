import { RootState } from '@/store';
import { useSelector } from 'react-redux';

function useCheckIn() {
  const checkInDetails = useSelector((state: RootState) => state.checkIn);

  return checkInDetails;
}

export default useCheckIn;
