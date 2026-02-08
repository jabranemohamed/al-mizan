import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page animate-fade-in">
      <div class="auth-card card">
        <div class="auth-header">
          <span class="bismillah">﷽</span>
          <h2>Connexion</h2>
          <p class="text-dim">Accède à ta balance des actions</p>
        </div>

        <form (ngSubmit)="onLogin()" class="auth-form">
          <div class="form-group">
            <label for="username">Nom d'utilisateur</label>
            <input id="username" type="text" [(ngModel)]="username" name="username"
                   placeholder="Ton pseudo" required autofocus>
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input id="password" type="password" [(ngModel)]="password" name="password"
                   placeholder="Ton mot de passe" required>
          </div>

          @if (error()) {
            <div class="error-message">{{ error() }}</div>
          }

          <button type="submit" class="btn btn-primary full-width" [disabled]="loading()">
            @if (loading()) {
              <i class="ri-loader-4-line spin"></i> Connexion...
            } @else {
              <i class="ri-login-box-line"></i> Se connecter
            }
          </button>
        </form>

        <p class="auth-footer">
          Pas encore de compte ?
          <a routerLink="/auth/register">Créer un compte</a>
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

    .auth-card {
      width: 100%;
      max-width: 420px;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 28px;
    }

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

    .auth-form {
      margin-bottom: 20px;
    }

    .full-width {
      width: 100%;
      justify-content: center;
    }

    .auth-footer {
      text-align: center;
      font-size: 0.85rem;
      color: var(--text-dim);
    }

    .spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-message {
      text-align: center;
      margin-bottom: 16px;
      padding: 8px;
      border-radius: 8px;
      background: rgba(239, 107, 107, 0.1);
    }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  loading = signal(false);
  error = signal('');

  onLogin(): void {
    this.loading.set(true);
    this.error.set('');

    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/balance']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error || 'Identifiants incorrects');
      }
    });
  }
}
