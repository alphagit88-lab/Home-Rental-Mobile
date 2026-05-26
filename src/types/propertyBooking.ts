export type PropertyBookingDraft = {
  checkIn: string;
  checkOut: string;
  guestCount: number;
  serviceCategoryIds: number[];
  serviceCategoryNames: string[];
  serviceNotes: string;
};

export type BookingPaymentDraft = {
  email: string;
  fullName: string;
};
