# EAS Build commands

Log in and connect this repository to an Expo/EAS project once:

```sh
npx eas-cli login
npx eas-cli init
```

The initialization command creates or selects the remote EAS project and adds its
`extra.eas.projectId` value to `app.json`. Commit that generated change.

Configure the public backend URL once for each EAS environment. Use a reachable
HTTPS tunnel for physical-device previews and the deployed production backend for
store builds. Do not include a trailing slash:

```sh
npx eas-cli env:create --environment preview --name EXPO_PUBLIC_AGE_API_URL --value https://your-preview-tunnel.example.com --visibility plaintext
npx eas-cli env:create --environment production --name EXPO_PUBLIC_AGE_API_URL --value https://api.example.com --visibility plaintext
```

`EXPO_PUBLIC_AGE_API_URL` is compiled into the application and is therefore not a
place for API keys, tokens, passwords, or other credentials. Keep secrets on the
backend or in non-public EAS secret variables used only by build/server tooling.

Create an installable Android test APK:

```sh
npx eas-cli build --platform android --profile preview
```

For local physical-device testing, `npm run dev:tunnel` starts the backend, opens
a temporary HTTPS Cloudflare tunnel, and passes its URL to Expo. The app deliberately
rejects Android emulator address `10.0.2.2`, because that address cannot work on a
physical device.

Create an iOS Simulator build:

```sh
npx eas-cli build --platform ios --profile ios-simulator
```

Create production store builds for Android and iOS:

```sh
npx eas-cli build --platform all --profile production
```

Validate the resolved EAS configuration without starting builds:

```sh
npx eas-cli config --platform android --profile preview
npx eas-cli config --platform ios --profile ios-simulator
npx eas-cli config --platform android --profile production
npx eas-cli config --platform ios --profile production
```

Production builds require the relevant Google Play and Apple signing credentials.
