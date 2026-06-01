export interface WalletSummary {
  id: string;
  user_id: string;
  user_name: string;
  balance: number;
  credit_limit: number;
  is_suspended: boolean;
  last_transaction_at?: string;
}

export interface WalletTransaction {
  id: string;
  transaction_ref: string;
  type: "credit" | "debit" | "hold" | "refund";
  amount: number;
  balance_after: number;
  description?: string;
  created_at: string;
}

export interface TopupRequest {
  id: string;
  user_id: string;
  agent_id?: string;
  user_name?: string;
  agent_name?: string;
  agent_email?: string;
  amount: number;
  payment_method?: string;
  reference?: string;
  proof_url?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface WalletActionRequest {
  user_id?: string;
  agent_id?: string;
  amount: number;
  description?: string;
}
