# Home Rental Mobile Feature Checklist

Based on the current codebase audit on 2026-04-02.

Legend:
- `[x]` already built and connected
- `[ ]` missing, only UI-only, or not fully connected yet

## 1. App Structure And Navigation

- [x] Splash/loading state before app decides where to go
- [x] Restore saved session on app launch
- [x] Separate tenant and property owner app flows
- [x] Bottom navigation with Dashboard, Properties, Bookings, and Account
- [x] Logout flow that clears the saved session
- [ ] Menu button actions are not connected yet
- [ ] Profile shortcut button actions are not connected yet

## 2. Authentication

- [x] Sign in screen
- [x] Tenant / Property Owner login mode switch
- [x] Email and password validation on login
- [x] Remember Me session persistence
- [x] Role check after login so tenant and owner accounts do not mix
- [x] Sign up screen
- [x] Sign up as Tenant or Property Owner
- [x] Account creation with backend API
- [ ] Forgot password flow is not connected yet
- [x] Edit profile screen
- [x] Update full name and email
- [x] Change password from profile screen

## 3. Tenant Dashboard

- [x] Tenant home/dashboard screen
- [x] Welcome hero section with user name
- [x] Load latest/live properties from backend
- [x] Featured/latest property preview
- [x] Quick navigation button to property search

## 4. Tenant Property Discovery

- [x] Property list screen
- [x] Search properties by text
- [x] Sort properties by Newest, A-Z, Bedrooms, Bathrooms
- [x] Filter by property type
- [x] Filter by listing type
- [x] Filter by bedroom range
- [x] Filter by bathroom range
- [x] Filter by amenities
- [x] Reset filters
- [x] Property cards with bedroom, bathroom, amenity, rent, and availability summary
- [x] Property detail screen
- [x] Property rent and availability display
- [x] Property amenities list
- [x] Property type / bedroom / bathroom summary
- [x] Property map preview
- [x] Open directions in Google Maps
- [ ] Move-in / move-out pickers on the main property list do not actually filter the list yet
- [ ] Favorite/heart on the property detail page is visual only

## 5. Tenant Booking Flow

- [x] Open booking flow from a property detail page
- [x] Booking screen with check-in and check-out selection
- [x] Guest count stepper
- [x] Property availability summary inside booking flow
- [x] Load blocked/booked dates from backend
- [x] Disable booked dates in booking calendar
- [x] Validate date range before continuing
- [x] Payment screen
- [x] Booking summary before submission
- [x] Card number, holder name, expiry, and CVV validation
- [x] Booking submission to backend
- [x] Save payment method as card and send last 4 digits
- [ ] Real payment gateway / card charging is not integrated; the app only collects payment details and submits the booking request

## 6. Tenant Bookings

- [x] Tenant bookings list screen
- [x] Load current tenant bookings from backend
- [x] Show booking status
- [x] Show stay date range
- [x] Show booking created date
- [x] Show booking amount/rent value
- [ ] Booking "View" button is UI only and does not open a booking details page yet

## 7. Owner Dashboard

- [x] Separate owner dashboard
- [x] Recent bookings summary on owner dashboard
- [x] My properties summary on owner dashboard
- [x] Quick navigation from owner dashboard to bookings
- [x] Quick navigation from owner dashboard to properties

## 8. Owner Property Management

- [x] Owner properties list screen
- [x] Load owner-only properties from backend
- [x] Add New Property flow
- [x] Owner property detail screen
- [x] Edit Property flow
- [x] Property name field
- [x] Property type selector
- [x] Listing type selector
- [x] Bedrooms counter
- [x] Bathrooms counter
- [x] Monthly rent field
- [x] Available From / Available To date fields
- [x] Amenities selector
- [x] Location text field
- [x] Description field
- [x] Gallery image picker
- [x] Gallery image preview and remove option
- [x] Save property to backend
- [x] Update property in backend
- [x] Property validation before save
- [x] Owner property detail view with rent, availability, amenities, stats, and live map preview
- [ ] Delete property flow is not implemented

## 9. Owner Maps And Location

- [x] Owner properties map overview
- [x] Show all owner properties as map markers
- [x] Auto-fit map to property markers
- [x] Zoom controls on owner map
- [x] Property location picker modal using native map
- [x] Tap map to save exact property latitude and longitude
- [x] Show selected coordinates before save
- [x] Property detail map preview card
- [x] Directions button from property map preview
- [x] Geocode location text when coordinates are missing during property save

## 10. Owner Booking Management

- [x] Owner bookings screen
- [x] Owner booking calendar
- [x] Highlight booked days on the calendar
- [x] Quick filters for Today, Last 8 days, and Last month
- [x] Month browsing in the booking calendar
- [x] Load owner bookings from backend by date window
- [x] Owner booking list below the calendar
- [x] Show tenant name, booking status, and stay range in owner booking list
- [ ] Owner booking "View" button is UI only and does not open a booking details page yet
- [ ] Approve / reject / update booking status actions are not implemented in the current app

## 11. Account And Settings Area

- [x] Account screen layout
- [x] Edit Profile entry works
- [x] Log out entry works
- [ ] Security item exists but has no action
- [ ] Notifications item exists but has no action
- [ ] Privacy item exists but has no action
- [ ] My Subscription item exists but has no action
- [ ] Help & Support item exists but has no action
- [ ] Terms and Policies item exists but has no action
- [ ] Free up space item exists but has no action
- [ ] Data Saver item exists but has no action
- [ ] Report a problem item exists but has no action
- [ ] Add account item exists but has no action

## 12. Data And Backend Integration

- [x] Auth API integration
- [x] Current user session storage in AsyncStorage
- [x] Public property fetch API
- [x] Owner property fetch API
- [x] Create property API
- [x] Update property API
- [x] Tenant bookings fetch API
- [x] Owner bookings fetch API
- [x] Property availability API
- [x] Create booking API
- [x] Property response normalization
- [x] Booking response normalization
- [x] Date normalization utilities

## 13. Reusable UI / Technical Work Already Done

- [x] Reusable auth input component
- [x] Reusable primary button component
- [x] Reusable inline state / message component
- [x] Reusable select field component
- [x] Reusable bottom navigation component
- [x] Shared responsive layout hook
- [x] Shared booking calendar utilities
- [x] Shared property presentation helpers
- [x] Shared booking presentation helpers

## 14. Best Next Features To Build

- [ ] Forgot password
- [ ] Real payment gateway integration
- [ ] Booking details screen for tenant bookings
- [ ] Booking details screen for owner bookings
- [ ] Owner booking approval / rejection actions
- [ ] Delete property
- [ ] Connect account/settings actions
- [ ] Connect menu/profile shortcut actions
- [ ] Make move-in / move-out filters affect property search results
