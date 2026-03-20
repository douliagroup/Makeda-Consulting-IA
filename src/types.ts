export enum InvestmentRisk {
  PRUDENT = 'Prudent',
  BALANCED = 'Équilibré',
  DYNAMIC = 'Dynamique'
}

export interface SimulationParams {
  initialCapital: number;
  monthlySavings: number;
  duration: number;
  riskProfile: InvestmentRisk;
  expectedReturn: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface UserProfile {
  name?: string;
  type?: 'PME' | 'Particulier' | 'Institutionnel';
  capital?: number;
  goals?: string[];
  riskProfile?: InvestmentRisk;
  horizon?: number;
  lastProject?: string;
}

export interface SimulationInsight {
  type: 'Retraite' | 'Immobilier' | 'Éducation' | 'Autre';
  timestamp: Date;
  riskProfile: InvestmentRisk;
  targetCapital: number;
}
