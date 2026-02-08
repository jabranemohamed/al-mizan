import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, inject } from '@angular/core';
import { Action } from '@core/models/models';
import { LanguageService } from '@core/i18n/language.service';

@Component({
  selector: 'app-arc-actions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="arc-container">
      <!-- Bad actions — LEFT arc -->
      @for (action of badActions; track action.id; let i = $index) {
        <div
          class="arc-item bad"
          [class.checked]="action.checked"
          [style.left.px]="getBadX(i)"
          [style.top.px]="getBadY(i)"
          [style.animation-delay]="i * 40 + 'ms'"
          (click)="toggle(action)">
          <span class="action-icon">{{ action.icon }}</span>
          <span class="checkbox">
            @if (action.checked) { <i class="ri-check-line"></i> }
          </span>
          <span class="tooltip">{{ lang.actionName(action) }}</span>
        </div>
      }

      <!-- Good actions — RIGHT arc -->
      @for (action of goodActions; track action.id; let i = $index) {
        <div
          class="arc-item good"
          [class.checked]="action.checked"
          [style.left.px]="getGoodX(i)"
          [style.top.px]="getGoodY(i)"
          [style.animation-delay]="i * 40 + 'ms'"
          (click)="toggle(action)">
          <span class="checkbox">
            @if (action.checked) { <i class="ri-check-line"></i> }
          </span>
          <span class="action-icon">{{ action.icon }}</span>
          <span class="tooltip">{{ lang.actionName(action) }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .arc-container {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 900px;
      height: 430px;
    }

    .arc-item {
      position: absolute;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      user-select: none;
      animation: fadeIn 0.4s ease both;

      &:hover {
        transform: scale(1.15);
        .tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
      }
    }

    .action-icon {
      font-size: 1.1rem;
      line-height: 1;
    }

    .checkbox {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 11px;
      color: white;
    }

    .arc-item.good .checkbox { border-color: rgba(45, 212, 160, 0.4); }
    .arc-item.bad .checkbox { border-color: rgba(239, 107, 107, 0.4); }

    .arc-item.checked.good .checkbox {
      background: var(--green);
      border-color: var(--green);
      box-shadow: 0 0 12px var(--green-glow);
    }

    .arc-item.checked.bad .checkbox {
      background: var(--red);
      border-color: var(--red);
      box-shadow: 0 0 12px var(--red-glow);
    }

    .arc-item.checked .action-icon {
      filter: brightness(1.3);
    }

    .tooltip {
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%) translateY(4px);
      background: rgba(10, 14, 26, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--text);
      padding: 5px 10px;
      border-radius: 8px;
      font-size: 0.72rem;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s ease;
      z-index: 10;
    }

    .arc-item.bad { transform-origin: right center; }
    .arc-item.good { transform-origin: left center; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 950px) {
      .arc-container { transform: translateX(-50%) scale(0.72); top: -50px; }
    }
    @media (max-width: 640px) {
      .arc-container { transform: translateX(-50%) scale(0.52); top: -100px; }
    }
  `]
})
export class ArcActionsComponent {
  @Input() goodActions: Action[] = [];
  @Input() badActions: Action[] = [];
  @Output() actionToggled = new EventEmitter<{ action: Action; checked: boolean }>();

  readonly lang = inject(LanguageService);

  private centerX = 450;
  private centerY = 420;
  private radius = 380;

  getBadX(i: number): number {
    const angle = this.getBadAngle(i);
    return this.centerX + this.radius * Math.cos(angle);
  }

  getBadY(i: number): number {
    const angle = this.getBadAngle(i);
    return this.centerY - this.radius * Math.sin(angle);
  }

  getGoodX(i: number): number {
    const angle = this.getGoodAngle(i);
    return this.centerX + this.radius * Math.cos(angle);
  }

  getGoodY(i: number): number {
    const angle = this.getGoodAngle(i);
    return this.centerY - this.radius * Math.sin(angle);
  }

  private getBadAngle(i: number): number {
    const count = Math.max(this.badActions.length - 1, 1);
    const start = Math.PI;
    const end = Math.PI * 0.54;
    return start + (i / count) * (end - start);
  }

  private getGoodAngle(i: number): number {
    const count = Math.max(this.goodActions.length - 1, 1);
    const start = 0;
    const end = Math.PI * 0.46;
    return start + (i / count) * (end - start);
  }

  toggle(action: Action): void {
    this.actionToggled.emit({ action, checked: !action.checked });
  }
}
