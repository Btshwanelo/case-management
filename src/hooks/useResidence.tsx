import { RootState } from '@/store';
import { useSelector } from 'react-redux';

function useResidence() {
  const residenceDetails = useSelector((state: RootState) => state.resident);

  return residenceDetails;
}

export default useResidence;
