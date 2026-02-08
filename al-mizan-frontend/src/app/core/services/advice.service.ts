import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { AiAdvice } from '@core/models/models';

@Injectable({ providedIn: 'root' })
export class AdviceService {

  private readonly apiUrl = `${environment.apiUrl}/advice`;

  readonly advice = signal<AiAdvice | null>(null);
  readonly loading = signal(false);

  constructor(private http: HttpClient) {}

  loadTodayAdvice(lang: string = 'fr'): Observable<AiAdvice> {
    this.loading.set(true);
    return this.http.get<AiAdvice>(`${this.apiUrl}/today`, {
      params: { lang }
    }).pipe(
      tap(advice => {
        this.advice.set(advice);
        this.loading.set(false);
      })
    );
  }
}