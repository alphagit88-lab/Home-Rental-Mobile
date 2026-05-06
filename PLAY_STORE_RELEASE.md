# Home Rent Play Store Release Notes

## 1. App identity already set in the repo

- App name: `Home Rent`
- Android package: `com.homerental.mobile`
- Release bundle output: `android/app/build/outputs/bundle/release/app-release.aab`

## 2. Local release secrets

- Real release secrets live in `android/release-secrets.properties`
- A safe template lives in `android/release-secrets.properties.example`
- The local upload keystore path is `android/app/home-rent-upload-key.jks`

## 3. Public policy URLs

The app now points to these GitHub Pages URLs:

- Privacy policy: `https://alphagit88-lab.github.io/Home-Rental-Mobile/privacy-policy.html`
- Terms: `https://alphagit88-lab.github.io/Home-Rental-Mobile/terms.html`
- Account deletion: `https://alphagit88-lab.github.io/Home-Rental-Mobile/account-deletion.html`

Before Play submission, enable GitHub Pages for this repository and publish from the `docs/` folder so these URLs are live.

## 4. Support contact

- Support email used in the app: `alphagit88@gmail.com`
- Update `src/config/appSupport.ts` if you want different public support details.

## 5. Backend reminder

`src/services/rentalAuth.ts` still points to a temporary Cloudflare tunnel for the API. Replace that with your stable production backend URL before the Play release.

## 6. Build command

```powershell
cd android
.\gradlew.bat bundleRelease
```

## 7. Play Console checklist

- Upload the `.aab` from `android/app/build/outputs/bundle/release/`
- Add your store listing copy and screenshots
- Add the privacy policy URL above
- Complete Data safety, App access, Content rating, and Ads declarations
- If your Play developer account is a newer personal account, complete the required closed testing period before production

## 8. Play review accounts

Password for all review accounts:

- `PlayReview123!`

Accounts:

- Tenant: `playreview.tenant.20260506@example.com`
- Owner: `playreview.owner.20260506@example.com`
- Service provider: `playreview.provider.20260506@example.com`
