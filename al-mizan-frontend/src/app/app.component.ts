import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar.component';
import { LanguageService } from '@core/i18n/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar />
    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styles: [`
    .main-content {
      position: relative;
      z-index: 1;
      min-height: calc(100vh - 64px);
      padding-top: 20px;
    }
  `]
})
export class AppComponent {
  private lang = inject(LanguageService);
}
