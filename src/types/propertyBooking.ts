export type PropertyBookingDraft = {
  checkIn: string;
  checkOut: string;
  guestCount: number;
  serviceCategoryIds: number[];
  serviceCategoryNames: string[];
  serviceNotes: string;
};

export type BookingPaymentDraft = {
  cardHolderName: string;
  cardNumber: string;
  cvv: string;
  email: string;
  expiryDate: string;
  fullName: string;
};
