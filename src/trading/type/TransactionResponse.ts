import { CartRow } from "./CartRow";

export interface TransactionResponse {
  id: number;
  country: String;
  country_id: number;
  pay_in: String;
  currency: String;
  code: String;
  we_buy?: number;
  we_sell?: number;
  cash?: number;
  interac?: number;
  money_order?: number;
  transaction_type: String;
  change?: number;
  deleteStatus: boolean;

  carts?: {
    id: number;
    transactionId: number;
    currency: string;
    total: number;
  }[];

  customerId?: number | null;
}
