import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
        catchError(httpError => {
            if(httpError.status === 401) {
                return throwError(httpError.statusText);
            }
            if(httpError instanceof HttpErrorResponse) {
                const applicationError = httpError.headers.get('Application-Error');
                if(applicationError) {
                    return throwError(applicationError);
                }
                const serverError = httpError.error;
                let modalStateErrors = ''; // all errors according to out model "password not correct" "password is too weak"...
                if(serverError.errors && typeof serverError.errors === 'object') {
                    for (const key in serverError.errors) {
                        if(serverError.errors[key]) {
                            modalStateErrors += serverError.errors[key] + '\n';
                        }
                    }
                }
                return throwError(modalStateErrors || serverError || 'Server Error');
            }

        })
    );
    throw new Error('Method not implemented.');
  }
}

export const ErrorInterceptorProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,
    multi: true
};
