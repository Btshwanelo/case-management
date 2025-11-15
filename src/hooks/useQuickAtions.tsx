import { RootState } from '@/store';
import { useSelector } from 'react-redux';

function useQuickActions() {
  const quickActionsDetails = useSelector((state: RootState) => state.quickActions);

  return quickActionsDetails;
}

export default useQuickActions;
