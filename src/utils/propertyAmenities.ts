export type AmenityOptionKey = 'parking' | 'wifi' | 'pool';

type AmenityOption = {
  key: AmenityOptionKey;
  label: string;
  matcher: RegExp;
};

export const AMENITY_OPTIONS: AmenityOption[] = [
  {
    key: 'parking',
    label: 'Parking',
    matcher: /parking|car[\s-]?park|garage/i,
  },
  {
    key: 'wifi',
    label: 'Wi-Fi',
    matcher: /wi[\s-]?fi|internet/i,
  },
  {
    key: 'pool',
    label: 'Pool',
    matcher: /pool|swimming/i,
  },
];

export const getAmenityOptionKeys = (amenities: string[]) =>
  AMENITY_OPTIONS.filter(option =>
    amenities.some(amenity => option.matcher.test(String(amenity).trim())),
  ).map(option => option.key);

export const getAmenityOptionLabel = (key: AmenityOptionKey) =>
  AMENITY_OPTIONS.find(option => option.key === key)?.label ?? key;

export const getAmenityOptionLabels = (keys: AmenityOptionKey[]) =>
  AMENITY_OPTIONS.filter(option => keys.includes(option.key)).map(
    option => option.label,
  );
