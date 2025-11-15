import { apiSlice } from '../slices/apiSlice';

export const monthlyRentalSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    BiilingListingReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    ExportBillingListingReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
  }),
});

export const { useBiilingListingReqMutation, useExportBillingListingReqMutation } = monthlyRentalSlice;
