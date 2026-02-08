import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { Balance, CheckActionRequest } from '@core/models/models';

@Injectable({ providedIn: 'root' })
export class BalanceService {

  private readonly apiUrl = `${environment.apiUrl}/balance`;

  readonly todayBalance = signal<Balance>({
    date: new Date().toISOString().split('T')[0],
    goodCount: 0,
    badCount: 0,
    goodWeight: 0,
    badWeight: 0,
    verdict: 'NEUTRAL'
  });

  readonly history = signal<Balance[]>([]);

  constructor(private http: HttpClient) {}

  toggleAction(request: CheckActionRequest): Observable<Balance> {
    return this.http.post<Balance>(`${this.apiUrl}/toggle`, request).pipe(
      tap(balance => this.todayBalance.set(balance))
    );
  }

  loadTodayBalance(): Observable<Balance> {
    return this.http.get<Balance>(`${this.apiUrl}/today`).pipe(
      tap(balance => this.todayBalance.set(balance))
    );
  }

  loadBalanceByDate(date: string): Observable<Balance> {
    return this.http.get<Balance>(`${this.apiUrl}/date/${date}`);
  }

  loadHistory(startDate: string, endDate: string): Observable<Balance[]> {
    return this.http.get<Balance[]>(`${this.apiUrl}/history`, {
      params: { startDate, endDate }
    }).pipe(
      tap(history => this.history.set(history))
    );
  }

  loadRecentHistory(): Observable<Balance[]> {
    return this.http.get<Balance[]>(`${this.apiUrl}/recent`).pipe(
      tap(history => this.history.set(history))
    );
  }
}
