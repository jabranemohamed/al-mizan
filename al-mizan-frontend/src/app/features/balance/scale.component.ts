import { Component, Input, computed, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-scale',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="scale-container">
      <svg class="scale-svg" viewBox="0 0 700 280">
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f0d48a"/>
            <stop offset="50%" stop-color="#d4a853"/>
            <stop offset="100%" stop-color="#b8862d"/>
          </linearGradient>
          <linearGradient id="greenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#2dd4a0"/>
            <stop offset="100%" stop-color="#0f9b6e"/>
          </linearGradient>
          <linearGradient id="redGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ef6b6b"/>
            <stop offset="100%" stop-color="#c94444"/>
          </linearGradient>
          <filter id="glowGold">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- Base / Pillar -->
        <polygon points="300,270 400,270 375,220 325,220" fill="url(#goldGrad)" opacity="0.9"/>
        <rect x="340" y="62" width="20" height="158" rx="4" fill="url(#goldGrad)" opacity="0.85"/>

        <!-- Pivot -->
        <circle cx="350" cy="50" r="14" fill="url(#goldGrad)" filter="url(#glowGold)"/>
        <circle cx="350" cy="50" r="7" fill="#0a0e1a"/>
        <circle cx="350" cy="50" r="4" fill="url(#goldGrad)"/>

        <!-- Beam group (rotates) -->
        <g [attr.transform]="beamTransform" style="transform-origin: 350px 50px; transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);">
          <!-- Beam -->
          <rect x="80" y="46" width="540" height="8" rx="4" fill="url(#goldGrad)" opacity="0.9"/>

          <!-- Left chains -->
          <line x1="120" y1="54" x2="100" y2="140" stroke="#b8862d" stroke-width="2" opacity="0.6"/>
          <line x1="160" y1="54" x2="180" y2="140" stroke="#b8862d" stroke-width="2" opacity="0.6"/>

          <!-- Right chains -->
          <line x1="540" y1="54" x2="520" y2="140" stroke="#b8862d" stroke-width="2" opacity="0.6"/>
          <line x1="580" y1="54" x2="600" y2="140" stroke="#b8862d" stroke-width="2" opacity="0.6"/>

          <!-- Left plate (BAD) -->
          <ellipse cx="140" cy="150" rx="75" ry="18" fill="url(#redGrad)" opacity="0.25"/>
          <ellipse cx="140" cy="145" rx="70" ry="15" fill="none" stroke="url(#redGrad)" stroke-width="2" opacity="0.5"/>
          <text x="140" y="150" text-anchor="middle" font-family="Amiri, serif" font-size="14" fill="#ef6b6b" opacity="0.8">سيئات</text>

          <!-- Right plate (GOOD) -->
          <ellipse cx="560" cy="150" rx="75" ry="18" fill="url(#greenGrad)" opacity="0.25"/>
          <ellipse cx="560" cy="145" rx="70" ry="15" fill="none" stroke="url(#greenGrad)" stroke-width="2" opacity="0.5"/>
          <text x="560" y="150" text-anchor="middle" font-family="Amiri, serif" font-size="14" fill="#2dd4a0" opacity="0.8">حسنات</text>
        </g>
      </svg>
    </div>
  `,
  styles: [`
    .scale-container {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 600px;
      height: 280px;
    }

    .scale-svg {
      width: 100%;
      height: 100%;
    }

    @media (max-width: 950px) {
      .scale-container { width: 500px; }
    }
    @media (max-width: 640px) {
      .scale-container { width: 340px; }
    }
  `]
})
export class ScaleComponent {
  @Input() goodWeight = 0;
  @Input() badWeight = 0;

  get tiltAngle(): number {
    const diff = this.goodWeight - this.badWeight;
    return Math.max(-15, Math.min(15, diff * 2.5));
  }

  get beamTransform(): string {
    return `rotate(${this.tiltAngle}, 350, 50)`;
  }
}
