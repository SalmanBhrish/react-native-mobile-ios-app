# EAS Build commands

Log in and connect this repository to an Expo/EAS project once:

```sh
npx eas-cli login
npx eas-cli init
```

The initialization command creates or selects the remote EAS project and adds its
`extra.eas.projectId` value to `app.json`. Commit that generated change.

Create an installable Android test APK:

```sh
npx eas-cli build --platform android --profile preview
```

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
