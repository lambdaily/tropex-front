export type InstitutionType = 'banco' | 'financiera' | 'cooperativa' | 'billetera';

export const INSTITUTION_TYPE_LABELS: Record<InstitutionType, string> = {
  banco: 'Banco',
  financiera: 'Financiera',
  cooperativa: 'Cooperativa',
  billetera: 'Billetera',
};

export interface FinancialInstitution {
  id: number;
  name: string;
  type: InstitutionType;
  code?: string;
  is_active: boolean;
}
