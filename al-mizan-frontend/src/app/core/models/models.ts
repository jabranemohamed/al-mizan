export interface Action {
  id: number;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  type: 'GOOD' | 'BAD';
  weight: number;
  category: string;
  icon: string;
  checked: boolean;
}

export interface Balance {
  date: string;
  goodCount: number;
  badCount: number;
  goodWeight: number;
  badWeight: number;
  verdict: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  checkedActions?: Action[];
}

export interface CheckActionRequest {
  actionId: number;
  date: string;
  checked: boolean;
}

export interface AiAdvice {
  advice: string;
  encouragement: string;
  hadithReference: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}
