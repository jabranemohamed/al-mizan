import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { ActionService } from '@core/services/action.service';
import { BalanceService } from '@core/services/balance.service';
import { Action } from '@core/models/models';
import { LanguageService } from '@core/i18n/language.service';
import { ScaleComponent } from './scale.component';
import { ArcActionsComponent } from './arc-actions.component';

@Component({
  selector: 'app-balance',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScaleComponent, ArcActionsComponent],
  template: `
    <div class="balance-page container">
      <!-- Header -->
      <header class="page-header animate-fade-in">
        <div class="bismillah">﷽</div>
        <h1>الميزان</h1>
        <p class="subtitle">{{ lang.t('balance.subtitle') }}</p>
      </header>

      <!-- Score boxes -->
      <div class="scores animate-fade-in">
        <div class="score-box bad">
          <div class="score-label">{{ lang.t('balance.badLabel') }}</div>
          <div class="score-value">{{ balance.todayBalance().badCount }}</div>
          <div class="score-weight">{{ lang.t('balance.weight') }} {{ balance.todayBalance().badWeight }}</div>
        </div>
        <div class="score-box verdict" [class]="balance.todayBalance().verdict.toLowerCase()">
          <div class="verdict-icon">
            @switch (balance.todayBalance().verdict) {
              @case ('POSITIVE') { ✦ }
              @case ('NEGATIVE') { ⚠ }
              @default { ⚖ }
            }
          </div>
          <div class="verdict-text">
            @switch (balance.todayBalance().verdict) {
              @case ('POSITIVE') { {{ lang.t('balance.positive') }} }
              @case ('NEGATIVE') { {{ lang.t('balance.negative') }} }
              @default { {{ lang.t('balance.neutral') }} }
            }
          </div>
        </div>
        <div class="score-box good">
          <div class="score-label">{{ lang.t('balance.goodLabel') }}</div>
          <div class="score-value">{{ balance.todayBalance().goodCount }}</div>
          <div class="score-weight">{{ lang.t('balance.weight') }} {{ balance.todayBalance().goodWeight }}</div>
        </div>
      </div>

      <!-- Arc + Scale -->
      <div class="main-area">
        <app-arc-actions
          [goodActions]="actions.goodActions()"
          [badActions]="actions.badActions()"
          (actionToggled)="onToggle($event)"
        />
        <app-scale
          [goodWeight]="balance.todayBalance().goodWeight"
          [badWeight]="balance.todayBalance().badWeight"
        />
      </div>

    </div>
  `,
  styles: [`
    .balance-page {
      padding-bottom: 60px;
    }

    .page-header {
      text-align: center;
      margin-bottom: 16px;
    }

    .bismillah {
      font-family: var(--font-arabic);
      font-size: 1.2rem;
      color: var(--gold);
      opacity: 0.5;
    }

    h1 {
      font-family: var(--font-arabic);
      font-size: 2.8rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--gold-light), var(--gold), var(--gold-dark));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      color: var(--text-dim);
      font-size: 0.9rem;
      letter-spacing: 1px;
    }

    .scores {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-bottom: 8px;
    }

    .score-box {
      text-align: center;
      padding: 12px 24px;
      border-radius: 16px;
      background: var(--card);
      border: 1px solid var(--card-border);
      backdrop-filter: blur(10px);
      min-width: 120px;

      &.good {
        border-color: rgba(45, 212, 160, 0.15);
        .score-value { color: var(--green); }
      }
      &.bad {
        border-color: rgba(239, 107, 107, 0.15);
        .score-value { color: var(--red); }
      }
      &.verdict {
        min-width: 100px;
        &.positive { border-color: rgba(45, 212, 160, 0.2); color: var(--green); }
        &.negative { border-color: rgba(239, 107, 107, 0.2); color: var(--red); }
        &.neutral { border-color: rgba(212, 168, 83, 0.2); color: var(--gold); }
      }
    }

    .score-label {
      font-family: var(--font-arabic);
      font-size: 0.75rem;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .score-value {
      font-family: var(--font-display);
      font-size: 2rem;
      font-weight: 700;
    }

    .score-weight {
      font-size: 0.7rem;
      color: var(--text-muted);
    }

    .verdict-icon { font-size: 1.5rem; }
    .verdict-text { font-family: var(--font-arabic); font-size: 0.85rem; }

    .main-area {
      position: relative;
      width: 100%;
      max-width: 1000px;
      margin: 0 auto;
      min-height: 560px;
    }

    @media (max-width: 640px) {
      .scores { gap: 8px; }
      .score-box { min-width: 90px; padding: 10px 14px; }
      .score-value { font-size: 1.5rem; }
      h1 { font-size: 2rem; }
    }
  `]
})
export class BalanceComponent implements OnInit {
  readonly actions = inject(ActionService);
  readonly balance = inject(BalanceService);
  readonly lang = inject(LanguageService);

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.actions.loadTodayActions().subscribe();
    this.balance.loadTodayBalance().subscribe();
  }

  onToggle(event: { action: Action; checked: boolean }): void {
    const today = new Date().toISOString().split('T')[0];
    this.balance.toggleAction({
      actionId: event.action.id,
      date: today,
      checked: event.checked
    }).subscribe(() => {
      // Update local checked state
      const all = this.actions.actions();
      const updated = all.map(a =>
        a.id === event.action.id ? { ...a, checked: event.checked } : a
      );
      this.actions.actions.set(updated);
      this.actions.goodActions.set(updated.filter(a => a.type === 'GOOD'));
      this.actions.badActions.set(updated.filter(a => a.type === 'BAD'));
    });
  }
}