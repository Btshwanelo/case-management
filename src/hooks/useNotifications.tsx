import { RootState } from '@/store';
import { useSelector } from 'react-redux';

function useNotifications() {
  const notificationsDetails = useSelector((state: RootState) => state.notifications);

  return notificationsDetails;
}

export default useNotifications;
