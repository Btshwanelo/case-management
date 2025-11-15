import { RootState } from '@/store';
import { useSelector } from 'react-redux';

function useAnnoucements() {
  const announcementsDetails = useSelector((state: RootState) => state.announcements);

  return announcementsDetails;
}

export default useAnnoucements;
