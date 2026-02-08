import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Action } from '@core/models/models';

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
          <span class="action-label">
            {{ action.nameFr }}
            <small>{{ action.nameAr }}</small>
          </span>
          <span class="checkbox">
            @if (action.checked) { <i class="ri-check-line"></i> }
          </span>
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
          <span class="action-label">
            {{ action.nameFr }}
            <small>{{ action.nameAr }}</small>
          </span>
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
      gap: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
      user-select: none;
      animation: fadeIn 0.4s ease both;

      &:hover { transform: scale(1.07); }
    }

    .checkbox {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 12px;
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

    .action-label {
      font-size: 0.78rem;
      font-weight: 400;
      color: var(--text-dim);
      transition: color 0.3s;
      line-height: 1.2;
      display: flex;
      flex-direction: column;

      small {
        opacity: 0.5;
        font-size: 0.65rem;
      }
    }

    .arc-item.checked .action-label {
      color: var(--text);
      font-weight: 600;
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
