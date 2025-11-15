import { apiSlice } from '../slices/apiSlice';

export const portalListingSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    GetListingActions: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
  }),
});

export const { useGetListingActionsMutation } = portalListingSlice;
