export class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function fetchJson(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  const text = await response.text();

  let payload: any = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      throw new ApiError('Unexpected server response. Please try again later.', response.status);
    }
  }

  if (!response.ok) {
    const message = payload?.error || payload?.message || 'Server request failed. Please try again later.';
    throw new ApiError(message, response.status, { url: String(input), body: payload });
  }

  return payload;
}

export function getFriendlyErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (error instanceof ApiError) {
    return error.message;
  }

  const message = typeof error === 'string' ? error
    : error instanceof Error ? error.message
    : undefined;

  if (message) {
    if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
      return 'Network issue: please check your connection and try again.';
    }

    return message;
  }

  return fallback;
}
