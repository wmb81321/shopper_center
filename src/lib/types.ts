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

export type ProductSource = "manual" | "dropi";

export interface Product {
  id: string;
  dropi_product_id: number | null;
  name: string;
  short_description?: string | null;
  description?: string | null;
  category?: string | null;
  base_price: number;
  suggested_price?: number | null;
  sale_price: number;
  images?: string[] | null;
  variants?: ProductVariant[] | null;
  dropi_stock?: number | null;
  weight?: number | null;
  ai_selling_points?: string | null;
  ai_objection_handling?: string | null;
  ai_keywords?: string[] | null;
  is_active: boolean;
  source: ProductSource;
  // campaign fields
  product_type?: string | null;
  combo_type?: string | null;
  combo_items?: string[] | null;
  price_regular?: number | null;
  price_promo?: number | null;
  promo_active?: boolean | null;
  features?: string[] | null;
  size_info?: string | null;
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

export type AdStatus = "active" | "paused" | "draft";
export type AdFormat = "video_reel" | "imagen_estatica" | "imagen_carrusel";

export interface Ad {
  id: string;
  product_id: string;
  ad_number: number;
  format: AdFormat;
  caption: string;
  status: AdStatus;
  created_at: string;
  updated_at: string;
  products?: CampaignProduct;
}

export interface Segment {
  id: string;
  product_id: string;
  label: string;
  age_min: number | null;
  age_max: number | null;
  gender: string | null;
  relationship_status: string[] | null;
  education: string[] | null;
  occupations: string[] | null;
  cities_tier1: string[] | null;
  cities_tier2: string[] | null;
  interests_layer1: string[] | null;
  interests_layer2: string[] | null;
  interests_layer3: string[] | null;
  device: string | null;
  android_models: string[] | null;
  ios_models: string[] | null;
  behaviors: string[] | null;
  created_at: string;
  products?: CampaignProduct;
}

export interface Benefit {
  id: string;
  payment_type: string;
  delivery_cost: string;
  coverage: string;
  delivery_days: number;
  required_fields: string[];
  world_cup_start: string | null;
  colombia_matches: { opponent: string; date: string }[] | null;
  updated_at: string;
}

export interface CampaignProduct {
  id: string;
  name: string;
  product_type: string | null;
  combo_type: string | null;
  price_regular: number | null;
  price_promo: number | null;
  promo_active: boolean | null;
  is_active: boolean;
}
