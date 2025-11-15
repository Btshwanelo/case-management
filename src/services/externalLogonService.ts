import { apiSlice } from '../slices/apiSlice';

export const externalLogonSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    resetProfile: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
  }),
});

export const { useResetProfileMutation } = externalLogonSlice;
