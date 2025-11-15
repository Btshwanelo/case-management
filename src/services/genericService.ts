import { apiSlice } from '../slices/apiSlice';

export const genericApisSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    PreviewDocumentReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    GenericOTPReq: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
  }),
});

export const { usePreviewDocumentReqMutation, useGenericOTPReqMutation } = genericApisSlice;
