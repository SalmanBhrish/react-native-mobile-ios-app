# Age Calculator UI

The app uses a single responsive screen implemented in `App.tsx` with no additional runtime dependencies.

## User flow

1. Tap **Select your date of birth** to open the calendar modal.
2. Navigate backward or forward by month. Navigation stops at the current month, and future days in the current month are disabled.
3. Select a day, then tap **Calculate age**.
4. The result card displays the age in completed years, months, and days as of the current local date.

If the calculate button is pressed before a date is selected, the date field is highlighted and an inline validation message is shown.

## Responsive and accessibility behavior

- The content fills narrow screens and is capped at 520 px on wider phones or tablets.
- A vertical `ScrollView` keeps all controls reachable on short screens.
- The calendar modal scales to the available width and is capped at 420 px.
- Interactive elements have accessible roles and labels; validation and results use live-region announcements.
- Touch targets are at least 40 px, with primary controls at least 56 px high.

## Implementation notes

- Dates are created at local midnight to avoid time-of-day comparison errors.
- Age calculation advances through calendar years and months using end-of-month clamping, then counts the remaining complete days.
- The picker prevents future input in both its month navigation and individual day controls. A second validation check also protects the calculation path.
