# Android APK Build Guide

## Prerequisites

Before building the Android APK, you need to install:

1. **Java Development Kit (JDK) 11+**
   - Download from: https://www.oracle.com/java/technologies/downloads/
   - Or use: `choco install openjdk` (if you have Chocolatey)

2. **Android Studio**
   - Download from: https://developer.android.com/studio
   - Install and configure

3. **Android SDK**
   - Installed automatically with Android Studio
   - Requires Android API level 21+

4. **Environmental Variables**
   - Set `JAVA_HOME` to your JDK installation path
   - Set `ANDROID_HOME` to your Android SDK path
   - Add both to your PATH

## Build Steps

### Step 1: Rebuild the React app
```bash
cd frontend
npm run build
```

### Step 2: Sync with Android
```bash
npx cap sync
```

### Step 3: Open Android Studio
```bash
npx cap open android
```

### Step 4: Build APK in Android Studio
1. Open Android Studio (from previous command)
2. Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Wait for build to complete
4. APK will be generated at: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

### Step 5: Deploy to Device
#### Option A: Using Command Line
```bash
# Connect Android device via USB and enable USB debugging
adb install frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

#### Option B: Using Android Studio
1. Connected device should appear in Android Studio toolbar
2. Click "Run" button to install and launch

## Android Permissions

The app automatically requests these permissions:
- **ACCESS_FINE_LOCATION** - Precise GPS location
- **ACCESS_COARSE_LOCATION** - Network-based location
- **INTERNET** - Connect to your backend API

These are configured in `frontend/android/app/src/main/AndroidManifest.xml`

## Building Release APK

For production deployment to Google Play:

```bash
# Build release APK (requires keystore)
cd frontend/android
./gradlew assembleRelease
```

This requires:
1. Creating a signing key (keystore)
2. Configuring release signing in Android Studio
3. Uploading to Google Play Store

## Troubleshooting

### "ANDROID_HOME not set"
```powershell
# Set environment variable (Windows PowerShell)
$env:ANDROID_HOME = "C:\Users\YourUsername\AppData\Local\Android\Sdk"
```

### "Java not found"
```powershell
# Set environment variable (Windows PowerShell)
$env:JAVA_HOME = "C:\Program Files\Java\jdk-11"
```

### Gradle sync fails
1. Go to **File** → **Invalidate Caches / Restart** in Android Studio
2. Restart Android Studio

### App crashes on startup
1. Check logcat in Android Studio: **View** → **Tool Windows** → **Logcat**
2. Look for permission errors
3. Ensure backend API URL is correct in `config.js`

## Features Available in APK

✅ Continuous background location tracking
✅ High-accuracy GPS positioning
✅ Native Android location permissions
✅ Better battery management
✅ Real-time friend location updates
✅ Profile pictures on map
✅ History playback

## Testing

### On Android Emulator
1. In Android Studio: **AVD Manager** → Create Virtual Device
2. Download system image for API 31+
3. Select device in toolbar and run app

### On Physical Device
1. Enable "Developer Mode" (tap Build Number 7 times in Settings)
2. Enable "USB Debugging" in Developer Options
3. Connect via USB
4. Run from Android Studio

## Next Steps

1. Test on Android device
2. Update backend API URL for production
3. Create signing key for Google Play
4. Submit to Google Play Store (requires developer account)

## Capacitor Docs

For more info: https://capacitorjs.com/docs/android

## Support

If you encounter issues:
1. Check Android Studio Logcat for errors
2. Verify all permissions are set correctly
3. Ensure backend is running and accessible
4. Check that geolocation is enabled on device
