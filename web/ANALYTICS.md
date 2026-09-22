# Google Analytics 4

Both page entry points initialize the shared Google tag in `analytics.ts`.
It stays disabled unless a valid measurement ID is configured, the build is
production, and the hostname is `keduseworku.github.io`.

Set the repository Actions variable `VITE_GA_MEASUREMENT_ID` to the web stream's
`G-…` measurement ID, then run the Deploy site workflow. This ID is public, not
a secret. Vite embeds it during the build. Local development does not send hits.

GA4's config command sends the initial page view. These are separate HTML pages,
so no React route tracking or second manual page-view event is needed. Google
signals and advertising personalization are disabled. Enhanced measurement can
be configured in the Analytics web stream settings.

After deployment, visit the live site and check Analytics Realtime or Google
Tag Assistant to confirm receipt. An ad blocker may prevent collection.

Reference: https://developers.google.com/analytics/devguides/collection/ga4/tag-options
