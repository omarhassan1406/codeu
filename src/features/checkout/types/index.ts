export interface CheckoutItem {
  courseId: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  price: number;
  discount_price: number | null;
  instructor_name: string;
  instructor_avatar: string | null;
}

export interface PaymentDetails {
  method: "credit_card" | "digital_wallet";
  cardNumber?: string;
  cardName?: string;
  expiry?: string;
  cvv?: string;
  walletProvider?: string;
}

export interface PromoCode {
  code: string;
  discount_percent: number;
}

export interface CheckoutResult {
  success: boolean;
  transaction_id: string;
  enrollment_id: string;
  amount_paid: number;
}
