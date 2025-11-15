import { fetchBaseQuery, createApi, BaseQueryApi, FetchArgs } from '@reduxjs/toolkit/query/react';
import config from '@/config';

const baseQuery = fetchBaseQuery({
  baseUrl: config.baseUrl,
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    headers.set('api-key', config.apiKey);
    // headers.set('X-ClientId', "ezra360-external");

    const authDetails: unknown = localStorage.getItem('persist:root');
    const token = JSON.parse(authDetails).auth;
    const accessToken = JSON.parse(token).accessToken;

    if (accessToken) {
      // headers.set('Authorization',`Bearer ${accessToken}`);
    }

    return headers;
  },
});

export const baseQueryWithTransform = async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: {}) => {
  const result = await baseQuery(args, api, extraOptions);
  // Handle HTTP errors
  if (result.error) {
    return { error: result.error };
  }

  const data: any = result.data;

  // Handle API-level errors (when isSuccess is false)
  if (data?.isSuccess === false) {
    return {
      error: {
        status: 'CUSTOM_ERROR',
        data: data.clientMessage || 'An unknown error occurred',
        errorData: data?.outputParameters || data,
      },
    };
  }

  const newData = data?.outputParameters || data;

  // Return successful data from outputParameters
  return { data: { ...newData, clientMessage: data?.clientMessage, results: data?.results, gotoUrl: data?.gotoUrl } };
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithTransform,
  tagTypes: ['facility-data', 'accommodation-applications'],
  endpoints: (builder) => ({}),
});
