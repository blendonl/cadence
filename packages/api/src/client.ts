export interface IApiClient {
  request<T>(path: string, options?: RequestInit): Promise<T>;
  requestOrNull<T>(path: string, options?: RequestInit): Promise<T | null>;
  buildUrl(path: string): string;
}
