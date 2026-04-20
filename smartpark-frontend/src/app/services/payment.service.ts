import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface PaymentRequest {
  fine: any;
  resp: Subject<any|null>;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private req$ = new Subject<PaymentRequest>();

  // internal: host subscribes to this
  get requests(): Observable<PaymentRequest> { return this.req$.asObservable(); }

  // open the payment modal for a fine; returns an observable that emits the payload or null on cancel
  open(fine: any): Observable<any|null> {
    const resp = new Subject<any|null>();
    this.req$.next({ fine, resp });
    return resp.asObservable();
  }
}
