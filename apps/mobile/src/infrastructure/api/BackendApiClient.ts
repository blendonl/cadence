import { injectable } from 'tsyringe';
import { API_BASE_URL } from "../../core/config/ApiConfig";
import logger from "@utils/logger";

@injectable()
export class BackendApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  buildUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = this.buildUrl(path);
    const method = options?.method || 'GET';

    logger.info('[BackendApiClient] Request', {
      method,
      url,
      body: options?.body ? JSON.parse(options.body as string) : undefined,
    });

    const response = await fetch(url, options);

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      try {
        const data = await response.json();
        logger.error('[BackendApiClient] Error response', { status: response.status, data });
        if (data?.message) {
          message = data.message;
        }
      } catch {
        // Ignore JSON parse errors.
      }
      throw new Error(message);
    }

    const responseData = await response.json();
    logger.info('[BackendApiClient] Response', { status: response.status, data: responseData });

    return responseData as T;
  }

  async requestOrNull<T>(path: string, options?: RequestInit): Promise<T | null> {
    const url = this.buildUrl(path);
    logger.info('[BackendApiClient] Starting request', { url, method: options?.method || 'GET' });

    const startTime = Date.now();
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;

    logger.info('[BackendApiClient] Response received', {
      url,
      status: response.status,
      duration: `${duration}ms`
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      try {
        const data = await response.json();
        if (data?.message) {
          message = data.message;
        }
      } catch {
        // Ignore JSON parse errors.
      }
      logger.error('[BackendApiClient] Request failed', new Error(message), { url, status: response.status });
      throw new Error(message);
    }

    return (await response.json()) as T;
  }
}
