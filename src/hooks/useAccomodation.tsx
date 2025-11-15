import { RootState } from '@/store';
import { useSelector } from 'react-redux';

function useAccomodation() {
  const accomodationDetails = useSelector((state: RootState) => state.accommodation);

  return accomodationDetails;
}

export default useAccomodation;
