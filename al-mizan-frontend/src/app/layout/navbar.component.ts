import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-inner">
        <a routerLink="/balance" class="logo">
          <span class="logo-icon">☪</span>
          <span class="logo-text">الميزان</span>
        </a>

        @if (auth.isAuthenticated()) {
          <div class="nav-links">
            <a routerLink="/balance" routerLinkActive="active">
              <i class="ri-scales-3-line"></i>
              <span>Balance</span>
            </a>
            <a routerLink="/history" routerLinkActive="active">
              <i class="ri-calendar-line"></i>
              <span>Historique</span>
            </a>
            <a routerLink="/advice" routerLinkActive="active">
              <i class="ri-sparkling-2-line"></i>
              <span>Conseil IA</span>
            </a>
          </div>

          <div class="nav-user">
            <span class="username">{{ auth.currentUser()?.username }}</span>
            <button class="btn-logout" (click)="auth.logout()">
              <i class="ri-logout-box-r-line"></i>
            </button>
          </div>
        }
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(10, 14, 26, 0.85);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      height: 64px;
    }

    .nav-inner {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 20px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--gold);
    }

    .logo-icon {
      font-size: 1.5rem;
    }

    .logo-text {
      font-family: var(--font-arabic);
      font-size: 1.6rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--gold-light), var(--gold));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .nav-links {
      display: flex;
      gap: 6px;

      a {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: 24px;
        color: var(--text-dim);
        text-decoration: none;
        font-size: 0.85rem;
        font-weight: 500;
        transition: all 0.3s;

        i { font-size: 1.1rem; }

        &:hover {
          color: var(--text);
          background: rgba(255, 255, 255, 0.05);
        }

        &.active {
          color: var(--gold);
          background: rgba(212, 168, 83, 0.1);
        }
      }
    }

    .nav-user {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .username {
      font-size: 0.85rem;
      color: var(--text-dim);
    }

    .btn-logout {
      background: none;
      border: 1px solid rgba(239, 107, 107, 0.2);
      color: var(--red);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      transition: all 0.3s;

      &:hover {
        background: rgba(239, 107, 107, 0.1);
        border-color: var(--red);
      }
    }

    @media (max-width: 640px) {
      .nav-links span { display: none; }
      .username { display: none; }
    }
  `]
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
}
