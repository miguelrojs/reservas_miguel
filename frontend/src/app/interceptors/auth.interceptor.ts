import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const token = localStorage.getItem('token');
  const tenantId = localStorage.getItem('tenantId');

  let cloned = req;

  if (token) {
    cloned = cloned.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  if (tenantId) {
    cloned = cloned.clone({
      setHeaders: {
        'X-Tenant-Id': tenantId
      }
    });
  }

  return next(cloned);
};
