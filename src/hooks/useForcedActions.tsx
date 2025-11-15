import { RootState } from '@/store';
import { useSelector } from 'react-redux';

function useForcedActions() {
  const forcedActionsDetails = useSelector((state: RootState) => state.forcedActions);

  return forcedActionsDetails;
}

export default useForcedActions;
