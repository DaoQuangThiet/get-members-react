import { AxiosError } from 'axios';
import { HttpStatusCode } from 'axios';
import { TFunction } from 'i18next';

export interface ErrorUtilsHandleErrorOptions<T> {
  isErrorInstanceFn?: (err: AxiosError<T>) => void;
  isNotErrorInstanceFn?: (err: string) => void;
  isUnprocessableEntityErrorFn?: (err: AxiosError<T>) => void;
  isUnauthorizedErrorFn?: (err: AxiosError<T>) => void;
  isNotFoundErrorFn?: (err: AxiosError<T>) => void;
  isSyntaxErrorFn?: (err: SyntaxError) => void;
  fn?: () => void;
}

// Check if error status code is 401
export const isUnauthorizedError = (error: AxiosError) => {
  return error.request.status === HttpStatusCode.Unauthorized;
};

// Check if error status code is 422
export const isUnprocessableEntityError = (error: AxiosError) =>
  error.request.status === HttpStatusCode.UnprocessableEntity;

// Check if error status code is 404
export const isNotFoundError = (error: AxiosError) =>
  error.request.status === HttpStatusCode.NotFound;

export class ErrorUtils {
  static handleError<T = string>(
    err: unknown,
    options?: ErrorUtilsHandleErrorOptions<T>
  ) {
    const {
      fn,
      isErrorInstanceFn,
      isNotErrorInstanceFn,
      isUnprocessableEntityErrorFn,
      isNotFoundErrorFn,
      isUnauthorizedErrorFn,
      isSyntaxErrorFn,
    } = options ?? {};
    if (err instanceof AxiosError) {
      // do something
      isErrorInstanceFn?.(err);
      if (isUnprocessableEntityError(err)) {
        isUnprocessableEntityErrorFn?.(err);
      }
      if (isNotFoundError(err)) {
        isNotFoundErrorFn?.(err);
      }
      if (isUnauthorizedError(err)) {
        isUnauthorizedErrorFn?.(err);
      }
    } else {
      if (typeof err === 'string') {
        isNotErrorInstanceFn?.(err);
      } else if (err instanceof SyntaxError) {
        isSyntaxErrorFn?.(err);
      }
    }
    fn && fn();
  }

  static handleCommonError(
    err: unknown,
    t: TFunction<'translation', undefined, 'translation'>
  ) {
    ErrorUtils.handleError(err, {
      isErrorInstanceFn: (error) => {
        // Handle error here
      },
    });
  }
}
