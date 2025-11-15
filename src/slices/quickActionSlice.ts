import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface QuickAction {
  title: string;
  description: string;
  actionLink: string;
}

interface QuickActionsState {
  quickActions: QuickAction[];
}

const initialState: QuickActionsState = {
  quickActions: [],
};

const quickActionsSlice = createSlice({
  name: 'quickActions',
  initialState,
  reducers: {
    setQuickActions: (state, action: PayloadAction<QuickAction[]>) => {
      state.quickActions = action.payload;
    },
    addQuickAction: (state, action: PayloadAction<QuickAction>) => {
      state.quickActions.push(action.payload);
    },
    updateQuickAction: (state, action: PayloadAction<{ index: number; updatedAction: QuickAction }>) => {
      const { index, updatedAction } = action.payload;
      if (index >= 0 && index < state.quickActions.length) {
        state.quickActions[index] = updatedAction;
      }
    },
    removeQuickAction: (state, action: PayloadAction<number>) => {
      state.quickActions.splice(action.payload, 1);
    },
  },
});

export const { setQuickActions, addQuickAction, updateQuickAction, removeQuickAction } = quickActionsSlice.actions;

export default quickActionsSlice.reducer;
