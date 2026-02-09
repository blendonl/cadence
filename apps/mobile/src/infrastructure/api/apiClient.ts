import { API_BASE_URL } from "@core/config/ApiConfig";
import { authClient } from "@core/auth/authClient";
import logger from "@utils/logger";

type AuthFailureCallback = () => void;

export class ApiClient {
  private baseUrl: string;
  private onAuthFailure: AuthFailureCallback | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  setOnAuthFailure(callback: AuthFailureCallback | null) {
    this.onAuthFailure = callback;
  }

  buildUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  private injectAuthHeaders(options?: RequestInit): RequestInit {
    const merged = { ...options };
    const headers = new Headers(merged.headers);

    const cookies = authClient.getCookie();
    if (cookies) {
      headers.set('Cookie', cookies);
    }

    merged.headers = headers;
    merged.credentials = 'omit';
    return merged;
  }

  async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = this.buildUrl(path);
    const authedOptions = this.injectAuthHeaders(options);
    const method = authedOptions?.method || 'GET';

    let requestBody: unknown = undefined;
    if (authedOptions?.body) {
      try {
        requestBody = JSON.parse(authedOptions.body as string);
      } catch {
        requestBody = authedOptions.body;
      }
    }

    logger.info('[ApiClient] Request', {
      method,
      url,
      body: requestBody,
    });

    let response: Response;
    try {
      response = await fetch(url, authedOptions);
    } catch (error) {
      logger.error('[ApiClient] Network error', error, { url, method });
      throw error;
    }

    if (response.status === 401) {
      this.onAuthFailure?.();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      try {
        const data = await this.parseResponse<unknown>(response);
        logger.error('[ApiClient] Error response', undefined, { status: response.status, data });
        if (data?.message) {
          message = data.message;
        }
      } catch {
      }
      throw new Error(message);
    }

    const responseData = await this.parseResponse<T>(response);
    logger.info('[ApiClient] Response', { status: response.status, data: responseData });

    return responseData as T;
  }

  async requestOrNull<T>(path: string, options?: RequestInit): Promise<T | null> {
    const url = this.buildUrl(path);
    const authedOptions = this.injectAuthHeaders(options);
    logger.info('[ApiClient] Starting request', { url, method: authedOptions?.method || 'GET' });

    const startTime = Date.now();
    let response: Response;
    try {
      response = await fetch(url, authedOptions);
    } catch (error) {
      logger.error('[ApiClient] Network error', error, { url, method: authedOptions?.method || 'GET' });
      throw error;
    }
    const duration = Date.now() - startTime;

    logger.info('[ApiClient] Response received', {
      url,
      status: response.status,
      duration: `${duration}ms`
    });

    if (response.status === 401) {
      this.onAuthFailure?.();
      throw new Error('Unauthorized');
    }

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      try {
        const data = await this.parseResponse<unknown>(response);
        if (data?.message) {
          message = data.message;
        }
      } catch {
      }
      logger.error('[ApiClient] Request failed', new Error(message), { url, status: response.status });
      throw new Error(message);
    }

    return (await this.parseResponse<T>(response)) as T;
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    const text = await response.text();
    if (!text) {
      return null as T;
    }

    const contentType = response.headers.get('content-type') || '';
    const looksJson = contentType.includes('application/json') || contentType.includes('+json');
    if (looksJson) {
      try {
        return JSON.parse(text) as T;
      } catch (error) {
        logger.error('[ApiClient] Invalid JSON response', error, {
          status: response.status,
          contentType,
          text,
        });
        throw new Error('Invalid JSON response');
      }
    }

    return text as unknown as T;
  }
}

export const apiClient = new ApiClient();
