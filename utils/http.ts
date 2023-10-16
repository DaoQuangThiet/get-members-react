import axios, { AxiosInstance, AxiosResponse } from 'axios';

class Http {
  protected readonly instance: AxiosInstance;

  constructor(baseURL?: string) {
    this.instance = axios.create({
      baseURL,
    });
  }

  getInstance(): AxiosInstance {
    return this.instance;
  }

  setCookie(cookie: string): void {
    this.instance.defaults.headers.common.Cookie = cookie;
  }

  clearAuthorization(): void {
    delete this.instance.defaults.headers.common.Cookie;
  }
}

export const http = {
  facebookInstance: new Http('https://www.facebook.com'),
};

export class HttpUtils {
  static getDataFromHttpResponse<T>(response: AxiosResponse<T>) {
    return response.data;
  }
}
