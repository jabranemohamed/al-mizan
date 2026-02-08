import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { AdviceService } from '@core/services/advice.service';
import { BalanceService } from '@core/services/balance.service';
import { LanguageService } from '@core/i18n/language.service';

@Component({
  selector: 'app-advice',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="advice-page container animate-fade-in">
      <header class="page-header">
        <h1><i class="ri-sparkling-2-line"></i> {{ lang.t('advice.title') }}</h1>
        <p class="text-dim">{{ lang.t('advice.subtitle') }}</p>
      </header>

      <!-- Balance summary -->
      <div class="balance-summary card">
        <div class="summary-item">
          <span class="label">{{ lang.t('balance.goodLabel') }}</span>
          <span class="value text-green">{{ balanceService.todayBalance().goodCount }}</span>
        </div>
        <div class="summary-divider">⚖</div>
        <div class="summary-item">
          <span class="label">{{ lang.t('balance.badLabel') }}</span>
          <span class="value text-red">{{ balanceService.todayBalance().badCount }}</span>
        </div>
      </div>

      @if (adviceService.loading()) {
        <div class="loading-card card">
          <div class="loading-spinner">
            <i class="ri-sparkling-2-line pulse"></i>
          </div>
          <p>{{ lang.t('advice.loading') }}</p>
        </div>
      } @else if (adviceService.advice()) {
        <div class="advice-card card animate-slide-up">
          <div class="advice-section">
            <h3><i class="ri-chat-heart-line"></i> {{ lang.t('advice.sectionAdvice') }}</h3>
            <p class="advice-text">{{ adviceService.advice()!.advice }}</p>
          </div>

          @if (adviceService.advice()!.encouragement) {
            <div class="advice-section arabic-section">
              <h3><i class="ri-hearts-line"></i> {{ lang.t('advice.sectionDua') }}</h3>
              <p class="arabic-text">{{ adviceService.advice()!.encouragement }}</p>
            </div>
          }

          @if (adviceService.advice()!.hadithReference) {
            <div class="advice-section hadith-section">
              <h3><i class="ri-book-open-line"></i> {{ lang.t('advice.sectionRef') }}</h3>
              <p class="hadith-text">{{ adviceService.advice()!.hadithReference }}</p>
            </div>
          }
        </div>
      } @else {
        <div class="empty-state card">
          <i class="ri-sparkling-2-line"></i>
          <p>{{ lang.t('advice.empty') }}</p>
        </div>
      }

      <div class="action-bar">
        <button class="btn btn-primary" (click)="loadAdvice()" [disabled]="adviceService.loading()">
          <i class="ri-refresh-line"></i>
          {{ adviceService.advice() ? lang.t('advice.newAdvice') : lang.t('advice.getAdvice') }}
        </button>
      </div>
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

    .balance-summary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 32px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .summary-item {
      text-align: center;
      .label {
        display: block;
        font-family: var(--font-arabic);
        font-size: 0.8rem;
        color: var(--text-dim);
      }
      .value {
        font-family: var(--font-display);
        font-size: 2rem;
        font-weight: 700;
      }
    }

    .summary-divider {
      font-size: 1.5rem;
      color: var(--gold);
    }

    .loading-card {
      text-align: center;
      padding: 60px 24px;
      p { color: var(--text-dim); margin-top: 16px; }
    }

    .loading-spinner {
      font-size: 3rem;
      color: var(--gold);
    }

    .pulse {
      animation: pulse 1.5s ease infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0.7; }
    }

    .advice-card {
      margin-bottom: 24px;
    }

    .advice-section {
      padding: 20px 0;
      border-bottom: 1px solid var(--card-border);

      &:last-child { border-bottom: none; padding-bottom: 0; }
      &:first-child { padding-top: 0; }

      h3 {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--gold);
        margin-bottom: 10px;
        letter-spacing: 0.5px;
        i { margin-right: 6px; }
      }
    }

    .advice-text {
      font-size: 1rem;
      line-height: 1.7;
      color: var(--text);
    }

    .arabic-section .arabic-text {
      font-family: var(--font-arabic);
      font-size: 1.3rem;
      line-height: 2;
      color: var(--green);
      text-align: center;
      direction: rtl;
    }

    .hadith-section .hadith-text {
      font-style: italic;
      color: var(--text-dim);
      line-height: 1.6;
      font-size: 0.95rem;
    }

    .empty-state {
      text-align: center;
      padding: 60px 24px;
      i { font-size: 3rem; color: var(--gold); opacity: 0.4; display: block; margin-bottom: 16px; }
      p { color: var(--text-dim); }
    }

    .action-bar {
      text-align: center;
    }

    .animate-slide-up {
      animation: slideUp 0.5s ease both;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AdviceComponent implements OnInit {
  readonly adviceService = inject(AdviceService);
  readonly balanceService = inject(BalanceService);
  readonly lang = inject(LanguageService);

  ngOnInit(): void {
    this.balanceService.loadTodayBalance().subscribe();
  }

  loadAdvice(): void {
    this.adviceService.loadTodayAdvice(this.lang.currentLang()).subscribe();
  }
}