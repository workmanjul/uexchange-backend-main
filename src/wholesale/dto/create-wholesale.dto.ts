export class CreateWholesaleDto {
  transaction_type: string;
  paid_by: string;
  amount: number;
  type_of_currency: string;
  date: string;
  company: string;
  wholeseller_sale_rate?: number;
  wholeseller_purchase_rate?: number;
  location?: string;
}
