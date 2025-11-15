import { fetchBaseQuery, createApi, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import config from '@/config';

// Define the base API response structure
interface BaseApiResponse {
  isSuccess?: boolean;
  clientMessage?: string;
  outputParameters?: Record<string, any>;
  results?: any;
  gotoUrl?: string;
}

// Define custom error structure
interface CustomError {
  status: 'CUSTOM_ERROR';
  data: string;
}

// Define the transformed response structure
interface TransformedResponse {
  clientMessage?: string;
  results?: any;
  gotoUrl?: string;
  [key: string]: any;
}

const baseQuery = fetchBaseQuery({
  baseUrl: config.baseUrl,
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    headers.set('api-key', config.apiKey);
    return headers;
  },
});

// Type the transform function
export const baseQueryWithTransform: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError | CustomError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await baseQuery(args, api, extraOptions);

  // Handle HTTP errors
  if (result.error) {
    return { error: result.error };
  }

  const data = result.data as BaseApiResponse;

  // Handle API-level errors (when isSuccess is false)
  if (data?.isSuccess === false) {
    return {
      error: {
        status: 'CUSTOM_ERROR',
        data: data.clientMessage || 'An unknown error occurred',
      },
    };
  }

  const newData = data?.outputParameters || data;

  // Return successful data with additional fields
  return {
    data: {
      ...newData,
      clientMessage: data?.clientMessage,
      results: data?.results,
      gotoUrl: data?.gotoUrl,
    } as TransformedResponse,
  };
};

// Define available tag types
export type ApiTags = 'facility-data' | 'accommodation-applications';

// Create the API slice with proper typing
export const apiSlice = createApi({
  baseQuery: baseQueryWithTransform,
  tagTypes: ['facility-data', 'accommodation-applications'] as ApiTags[],
  endpoints: (builder) => ({}),
});

// Export types for use in other slices
export type { BaseApiResponse, CustomError, TransformedResponse };
