export interface CartRow {
  id: number;
  exchange_rate_id: number;
  currency: string;
  code: string;
  input_amount: number | undefined;
  we_buy_total?: number | undefined;
  we_sell_total?: number | undefined;
  currency_amount: number;
  total?: number;
  rate?: number;
}
