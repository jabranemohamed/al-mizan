import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'balance',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('@features/auth/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('@features/auth/register.component').then(m => m.RegisterComponent)
      }
    ]
  },
  {
    path: 'balance',
    canActivate: [authGuard],
    loadComponent: () => import('@features/balance/balance.component').then(m => m.BalanceComponent)
  },
  {
    path: 'history',
    canActivate: [authGuard],
    loadComponent: () => import('@features/history/history.component').then(m => m.HistoryComponent)
  },
  {
    path: 'advice',
    canActivate: [authGuard],
    loadComponent: () => import('@features/advice/advice.component').then(m => m.AdviceComponent)
  },
  {
    path: '**',
    redirectTo: 'balance'
  }
];
