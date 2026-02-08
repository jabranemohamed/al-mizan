import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { LanguageService } from '@core/i18n/language.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page animate-fade-in">
      <div class="auth-card card">
        <div class="auth-header">
          <span class="bismillah">﷽</span>
          <h2>{{ lang.t('register.title') }}</h2>
          <p class="text-dim">{{ lang.t('register.subtitle') }}</p>
        </div>

        <form (ngSubmit)="onRegister()" class="auth-form">
          <div class="form-group">
            <label for="username">{{ lang.t('register.username') }}</label>
            <input id="username" type="text" [(ngModel)]="username" name="username"
                   [placeholder]="lang.t('register.usernamePlaceholder')" required autofocus>
          </div>

          <div class="form-group">
            <label for="email">{{ lang.t('register.email') }}</label>
            <input id="email" type="email" [(ngModel)]="email" name="email"
                   [placeholder]="lang.t('register.emailPlaceholder')" required>
          </div>

          <div class="form-group">
            <label for="password">{{ lang.t('register.password') }}</label>
            <input id="password" type="password" [(ngModel)]="password" name="password"
                   [placeholder]="lang.t('register.passwordPlaceholder')" required>
          </div>

          @if (error()) {
            <div class="error-message">{{ error() }}</div>
          }

          <button type="submit" class="btn btn-primary full-width" [disabled]="loading()">
            @if (loading()) {
              <i class="ri-loader-4-line spin"></i> {{ lang.t('register.loading') }}
            } @else {
              <i class="ri-user-add-line"></i> {{ lang.t('register.submit') }}
            }
          </button>
        </form>

        <p class="auth-footer">
          {{ lang.t('register.hasAccount') }}
          <a routerLink="/auth/login">{{ lang.t('register.login') }}</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 120px);
      padding: 20px;
    }

    .auth-card { width: 100%; max-width: 420px; }

    .auth-header { text-align: center; margin-bottom: 28px; }

    .bismillah {
      font-family: var(--font-arabic);
      font-size: 1.3rem;
      color: var(--gold);
      opacity: 0.6;
    }

    h2 {
      font-family: var(--font-display);
      font-size: 1.8rem;
      color: var(--gold);
      margin: 8px 0 4px;
    }

    .full-width { width: 100%; justify-content: center; }

    .auth-footer {
      text-align: center;
      font-size: 0.85rem;
      color: var(--text-dim);
    }

    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error-message {
      text-align: center;
      margin-bottom: 16px;
      padding: 8px;
      border-radius: 8px;
      background: rgba(239, 107, 107, 0.1);
    }
  `]
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  readonly lang = inject(LanguageService);

  username = '';
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  onRegister(): void {
    this.loading.set(true);
    this.error.set('');

    this.auth.register({
      username: this.username,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/balance']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error || this.lang.t('register.error'));
      }
    });
  }
}