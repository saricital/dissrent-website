export interface Car {
  name: string;
  img: string;
  price1: number;
  price2: number;
}

export interface SearchResult {
  pickupLocation: string;
  pickupDate: string;
  returnDate: string;
  days: number;
}

export interface BookingContext {
  carName?: string;
  carImg?: string;
  price1?: number;
  price2?: number;
  days?: number;
  pickupDate?: string;
  returnDate?: string;
  totalPrice?: number | null;
  pricingMode?: "standard" | "discount" | "quote";
}
