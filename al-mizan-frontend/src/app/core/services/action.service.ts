import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { Action } from '@core/models/models';

@Injectable({ providedIn: 'root' })
export class ActionService {

  private readonly apiUrl = `${environment.apiUrl}/actions`;

  readonly actions = signal<Action[]>([]);
  readonly goodActions = signal<Action[]>([]);
  readonly badActions = signal<Action[]>([]);

  constructor(private http: HttpClient) {}

  loadAllActions(): Observable<Action[]> {
    return this.http.get<Action[]>(this.apiUrl).pipe(
      tap(actions => {
        this.actions.set(actions);
        this.goodActions.set(actions.filter(a => a.type === 'GOOD'));
        this.badActions.set(actions.filter(a => a.type === 'BAD'));
      })
    );
  }

  loadTodayActions(): Observable<Action[]> {
    return this.http.get<Action[]>(`${this.apiUrl}/today`).pipe(
      tap(actions => {
        this.actions.set(actions);
        this.goodActions.set(actions.filter(a => a.type === 'GOOD'));
        this.badActions.set(actions.filter(a => a.type === 'BAD'));
      })
    );
  }

  loadActionsByDate(date: string): Observable<Action[]> {
    return this.http.get<Action[]>(`${this.apiUrl}/date/${date}`).pipe(
      tap(actions => {
        this.actions.set(actions);
        this.goodActions.set(actions.filter(a => a.type === 'GOOD'));
        this.badActions.set(actions.filter(a => a.type === 'BAD'));
      })
    );
  }
}
