type ApiResponse<T> = {
  isSuccess: boolean;
  results: any;
  gotoUrl?: string;
  clientExecuteFunctionOnSuccess?: string | null;
  clientExecuteFunctionOnFailure?: string | null;
  clientMessage?: string | null;
  outputParameters?: T | null;
};

type ExtractedResponse<T> = {
  isSuccess: boolean;
  data: T | null;
  message: string | null;
};

export const handleApiResponse = <T>(response: ApiResponse<T>): ExtractedResponse<T> => {
  if (!response) {
    return {
      isSuccess: false,
      data: null,
      message: 'Unexpected error occurred. No response received.',
    };
  }

  if (response.isSuccess) {
    return {
      isSuccess: true,
      data: response ?? null,
      message: null,
    };
  } else {
    return {
      isSuccess: false,
      data: null,
      message: response.clientMessage ?? 'An error occurred. Please try again.',
    };
  }
};
