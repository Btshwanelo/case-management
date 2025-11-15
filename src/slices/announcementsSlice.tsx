import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Announcement {
  title: string;
  content: string;
}

interface AnnouncementsState {
  announcements: Announcement[];
}

const initialState: AnnouncementsState = {
  announcements: [],
};

const announcementsSlice = createSlice({
  name: 'announcements',
  initialState,
  reducers: {
    setAnnouncements: (state, action: PayloadAction<Announcement[]>) => {
      state.announcements = action.payload;
    },
    addAnnouncement: (state, action: PayloadAction<Announcement>) => {
      state.announcements.push(action.payload);
    },
    updateAnnouncement: (state, action: PayloadAction<{ index: number; updatedAnnouncement: Announcement }>) => {
      const { index, updatedAnnouncement } = action.payload;
      if (index >= 0 && index < state.announcements.length) {
        state.announcements[index] = updatedAnnouncement;
      }
    },
    removeAnnouncement: (state, action: PayloadAction<number>) => {
      state.announcements.splice(action.payload, 1);
    },
  },
});

export const { setAnnouncements, addAnnouncement, updateAnnouncement, removeAnnouncement } = announcementsSlice.actions;

export default announcementsSlice.reducer;
