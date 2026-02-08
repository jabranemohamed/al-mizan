import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BalanceService } from '@core/services/balance.service';
import { Balance } from '@core/models/models';
import { LanguageService } from '@core/i18n/language.service';

@Component({
  selector: 'app-history',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    <div class="history-page container animate-fade-in">
      <header class="page-header">
        <h1><i class="ri-calendar-line"></i> {{ lang.t('history.title') }}</h1>
        <p class="text-dim">{{ lang.t('history.subtitle') }}</p>
      </header>

      @if (loading()) {
        <div class="loading">
          <i class="ri-loader-4-line spin"></i> {{ lang.t('history.loading') }}
        </div>
      } @else if (balanceService.history().length === 0) {
        <div class="empty-state card">
          <i class="ri-calendar-todo-line"></i>
          <p>{{ lang.t('history.empty') }}</p>
        </div>
      } @else {
        <!-- Stats summary -->
        <div class="stats-grid">
          <div class="stat-card card">
            <div class="stat-value text-green">{{ positiveDays() }}</div>
            <div class="stat-label">{{ lang.t('history.positiveDays') }}</div>
          </div>
          <div class="stat-card card">
            <div class="stat-value text-red">{{ negativeDays() }}</div>
            <div class="stat-label">{{ lang.t('history.negativeDays') }}</div>
          </div>
          <div class="stat-card card">
            <div class="stat-value text-gold">{{ neutralDays() }}</div>
            <div class="stat-label">{{ lang.t('history.neutralDays') }}</div>
          </div>
        </div>

        <!-- History list -->
        <div class="history-list">
          @for (day of balanceService.history(); track day.date; let i = $index) {
            <div class="history-item card" [style.animation-delay]="i * 50 + 'ms'">
              <div class="day-date">
                <span class="day-name">{{ day.date | date:'EEE':'':lang.currentLang() }}</span>
                <span class="day-number">{{ day.date | date:'d MMM':'':lang.currentLang() }}</span>
              </div>

              <div class="day-bar">
                <div class="bar-bad" [style.width.%]="getBarPercent(day.badWeight, day)"></div>
                <div class="bar-good" [style.width.%]="getBarPercent(day.goodWeight, day)"></div>
              </div>

              <div class="day-scores">
                <span class="score-bad">{{ day.badCount }} <small>{{ lang.t('history.badLabel') }}</small></span>
                <span class="score-good">{{ day.goodCount }} <small>{{ lang.t('history.goodLabel') }}</small></span>
              </div>

              <div class="day-verdict" [class]="day.verdict.toLowerCase()">
                @switch (day.verdict) {
                  @case ('POSITIVE') { ✦ }
                  @case ('NEGATIVE') { ⚠ }
                  @default { ⚖ }
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 24px;
      h1 {
        font-family: var(--font-display);
        font-size: 1.8rem;
        color: var(--gold);
        i { margin-right: 8px; }
      }
    }

    .loading {
      text-align: center;
      padding: 60px;
      color: var(--text-dim);
      font-size: 1.1rem;
      .spin { animation: spin 1s linear infinite; }
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state {
      text-align: center;
      padding: 60px 24px;
      i { font-size: 3rem; color: var(--gold); opacity: 0.4; display: block; margin-bottom: 16px; }
      p { color: var(--text-dim); }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 28px;
    }

    .stat-card {
      text-align: center;
      padding: 16px;
    }

    .stat-value {
      font-family: var(--font-display);
      font-size: 2rem;
      font-weight: 700;
    }

    .stat-label {
      font-size: 0.8rem;
      color: var(--text-dim);
      margin-top: 2px;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .history-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 20px;
      animation: fadeIn 0.3s ease both;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .day-date {
      min-width: 70px;
      .day-name { display: block; font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; }
      .day-number { display: block; font-size: 0.95rem; font-weight: 600; }
    }

    .day-bar {
      flex: 1;
      height: 8px;
      background: var(--bg2);
      border-radius: 4px;
      display: flex;
      overflow: hidden;
    }

    .bar-bad {
      height: 100%;
      background: var(--red);
      border-radius: 4px 0 0 4px;
      transition: width 0.5s ease;
    }

    .bar-good {
      height: 100%;
      background: var(--green);
      border-radius: 0 4px 4px 0;
      transition: width 0.5s ease;
    }

    .day-scores {
      display: flex;
      gap: 12px;
      min-width: 130px;
      font-size: 0.85rem;

      .score-bad { color: var(--red); }
      .score-good { color: var(--green); }

      small {
        font-family: var(--font-arabic);
        font-size: 0.65rem;
        opacity: 0.7;
      }
    }

    .day-verdict {
      font-size: 1.2rem;
      min-width: 30px;
      text-align: center;

      &.positive { color: var(--green); }
      &.negative { color: var(--red); }
      &.neutral { color: var(--gold); }
    }

    @media (max-width: 640px) {
      .stats-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; }
      .stat-value { font-size: 1.4rem; }
      .history-item { gap: 10px; padding: 12px 14px; }
      .day-scores { min-width: auto; flex-direction: column; gap: 2px; }
    }
  `]
})
export class HistoryComponent implements OnInit {
  readonly balanceService = inject(BalanceService);
  readonly lang = inject(LanguageService);
  loading = signal(true);

  positiveDays = signal(0);
  negativeDays = signal(0);
  neutralDays = signal(0);

  ngOnInit(): void {
    this.balanceService.loadRecentHistory().subscribe({
      next: (history) => {
        this.positiveDays.set(history.filter(h => h.verdict === 'POSITIVE').length);
        this.negativeDays.set(history.filter(h => h.verdict === 'NEGATIVE').length);
        this.neutralDays.set(history.filter(h => h.verdict === 'NEUTRAL').length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getBarPercent(weight: number, day: Balance): number {
    const total = day.goodWeight + day.badWeight;
    return total > 0 ? (weight / total) * 100 : 50;
  }
}