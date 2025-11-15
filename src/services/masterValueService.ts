import { apiSlice } from '../slices/apiSlice';

export const accomodationApplicationSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    RetrieveMasterValues1: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    RetrieveMasterValues2: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    RetrieveMasterValues3: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    RetrieveMasterValues4: builder.mutation({
      query: ({ body }) => ({
        url: `/entities/ExecuteRequest?RequestName=${body.requestName}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
  }),
});

export const {
  useRetrieveMasterValues1Mutation,
  useRetrieveMasterValues2Mutation,
  useRetrieveMasterValues3Mutation,
  useRetrieveMasterValues4Mutation,
} = accomodationApplicationSlice;
