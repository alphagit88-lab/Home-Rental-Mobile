export type PropertyBookingDraft = {
  checkIn: string;
  checkOut: string;
  guestCount: number;
};

export type BookingPaymentDraft = {
  cardHolderName: string;
  cardNumber: string;
  cvv: string;
  email: string;
  expiryDate: string;
  fullName: string;
};
