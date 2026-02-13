import { IApiClient } from '@cadence/api';

export class WebApiClient implements IApiClient {
  constructor(private baseUrl: string) {}

  buildUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(this.buildUrl(path), {
      ...options,
      credentials: 'include',
    });

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const body = await response.text();
      let message = `Request failed with status ${response.status}`;
      try {
        const data = JSON.parse(body);
        if (data?.message) message = data.message;
      } catch {}
      throw new Error(message);
    }

    const text = await response.text();
    if (!text) return null as T;
    return JSON.parse(text) as T;
  }

  async requestOrNull<T>(path: string, options?: RequestInit): Promise<T | null> {
    const response = await fetch(this.buildUrl(path), {
      ...options,
      credentials: 'include',
    });

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
      throw new Error('Unauthorized');
    }

    if (response.status === 404) return null;

    if (!response.ok) {
      const body = await response.text();
      let message = `Request failed with status ${response.status}`;
      try {
        const data = JSON.parse(body);
        if (data?.message) message = data.message;
      } catch {}
      throw new Error(message);
    }

    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text) as T;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const webApiClient = new WebApiClient(API_BASE_URL);
