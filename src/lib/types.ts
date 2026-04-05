export type ConversationStatus = "ai_active" | "human_active" | "closed";
export type OrderStatus = "pending_payment" | "paid" | "pending_dropi" | "created_dropi" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "approved" | "rejected" | "cancelled";
export type MessageDirection = "inbound" | "outbound";

export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Product, "id">>;
      };
      customers: {
        Row: Customer;
        Insert: Omit<Customer, "id" | "created_at">;
        Update: Partial<Omit<Customer, "id">>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Conversation, "id">>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at">;
        Update: Partial<Omit<Message, "id">>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Order, "id">>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, "id" | "created_at">;
        Update: Partial<Omit<Payment, "id">>;
      };
      agent_config: {
        Row: AgentConfig;
        Insert: Omit<AgentConfig, "id">;
        Update: Partial<Omit<AgentConfig, "id">>;
      };
    };
  };
}

export interface Product {
  id: string;
  dropi_product_id: string;
  name: string;
  description?: string;
  base_price: number;
  suggested_price?: number;
  sale_price: number;
  active: boolean;
  variants?: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  dropi_variant_id: string;
  name: string;
  active: boolean;
}

export interface Customer {
  id: string;
  phone: string;
  name?: string;
  city?: string;
  address?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  customer_id: string;
  status: ConversationStatus;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
  customers?: Customer;
}

export interface Message {
  id: string;
  conversation_id: string;
  direction: MessageDirection;
  content: string;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_cod: boolean;
  status: OrderStatus;
  dropi_order_id?: string;
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  customers?: Customer;
  products?: Product;
}

export interface Payment {
  id: string;
  order_id: string;
  mp_payment_id?: string;
  mp_preference_id?: string;
  status: PaymentStatus;
  amount: number;
  payment_method?: string;
  created_at: string;
}

export interface AgentConfig {
  id: string;
  key: string;
  value: string;
  description?: string;
}
