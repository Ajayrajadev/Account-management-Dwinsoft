# Finovate Mobile - Troubleshooting Guide

## Common Issues and Solutions

### 🐛 Web Bundle MIME Type Error

**Error:**
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Refused to execute script from 'http://localhost:8081/index.ts.bundle?platform=web...' because its MIME type ('application/json') is not executable
```

**Solution:**
This error occurs when React Native Web dependencies are missing or incompatible.

**Fixed by:**
1. Installing React Native Web dependencies:
   ```bash
   npm install react-native-web react-dom --legacy-peer-deps
   ```

2. Clearing Metro cache:
   ```bash
   npx expo start --clear
   ```

3. Updated TypeScript configuration for better web compatibility
4. Added Metro configuration for web platform support

### 🔧 React Version Conflicts

**Error 1:**
```
ERESOLVE unable to resolve dependency tree
peer react@"^18.0.0" from react-native-web
```

**Solution:**
Use legacy peer deps to resolve React version conflicts:
```bash
npm install --legacy-peer-deps
```

**Error 2:**
```
Incompatible React versions: The "react" and "react-dom" packages must have the exact same version.
Instead got:
  - react:      19.1.0
  - react-dom:  19.2.0
```

**Solution:**
Ensure both React and React DOM are at the same version:
```bash
# Check current versions
npm list react react-dom --depth=0

# Update React to match React DOM version
npm install react@19.2.0 --save --legacy-peer-deps

# Update TypeScript types to match
npm install @types/react@~19.2.0 --save-dev --legacy-peer-deps

# Clear cache and restart
npx expo start --clear
```

### 📱 Metro Bundler Issues

**Common Metro errors:**

1. **Clear Metro cache:**
   ```bash
   npx expo start --clear
   ```

2. **Reset Metro completely:**
   ```bash
   npx expo start --clear --reset-cache
   ```

3. **Restart with specific platform:**
   ```bash
   npx expo start --web --clear
   npx expo start --ios --clear
   npx expo start --android --clear
   ```

### 🌐 Web Platform Issues

**If web platform doesn't work:**

1. **Check Metro config** (`metro.config.js`):
   ```javascript
   const { getDefaultConfig } = require('expo/metro-config');
   const config = getDefaultConfig(__dirname);
   config.resolver.platforms = ['ios', 'android', 'native', 'web'];
   config.resolver.sourceExts.push('web.js', 'web.ts', 'web.tsx');
   module.exports = config;
   ```

2. **Check TypeScript config** (`tsconfig.json`):
   ```json
   {
     "extends": "expo/tsconfig.base",
     "compilerOptions": {
       "strict": true,
       "jsx": "react-jsx",
       "allowSyntheticDefaultImports": true,
       "esModuleInterop": true,
       "skipLibCheck": true
     }
   }
   ```

### 🔐 Backend Connection Issues

**Error:** API calls failing or 404 errors

**Solution:**
1. **Check backend is running:**
   ```bash
   cd ../finovate-backend
   npm run dev
   ```

2. **Verify API base URL** in `src/services/api.ts`:
   ```typescript
   const BASE_URL = 'http://localhost:5000/api';
   ```

3. **Check network connectivity:**
   - For iOS Simulator: Use `localhost`
   - For Android Emulator: Use `10.0.2.2:5000` or your computer's IP
   - For physical devices: Use your computer's IP address

### 📱 Device-Specific Issues

**iOS Simulator:**
- Make sure Xcode is installed
- Use `npm run ios` or press `i` in Expo CLI

**Android Emulator:**
- Make sure Android Studio is installed
- Start an Android Virtual Device (AVD)
- Use `npm run android` or press `a` in Expo CLI

**Physical Devices:**
- Install Expo Go app from App Store/Play Store
- Scan QR code from Expo CLI
- Make sure device is on same network as development machine

### 🔄 Authentication Issues

**Error:** Login fails or token issues

**Solution:**
1. **Check demo credentials:**
   - Email: `demo@finovate.com`
   - Password: `password123`

2. **Clear AsyncStorage:**
   ```javascript
   // In app, go to Settings and logout, or manually clear:
   import AsyncStorage from '@react-native-async-storage/async-storage';
   AsyncStorage.clear();
   ```

3. **Check backend auth endpoint:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"demo@finovate.com","password":"password123"}'
   ```

### 🎨 Styling Issues

**Charts not displaying:**
- Charts are currently using placeholder components
- To add real charts, install Victory Native or React Native Chart Kit
- Update `DashboardScreen.tsx` to use actual chart components

**Icons not showing:**
- Make sure `@expo/vector-icons` is installed
- Use Ionicons from `@expo/vector-icons`

### 🚀 Performance Issues

**Slow loading:**
1. **Enable Hermes** (already enabled in newer Expo versions)
2. **Optimize images** - use appropriate sizes
3. **Lazy load screens** - implement code splitting
4. **Reduce bundle size** - remove unused dependencies

**Memory issues:**
1. **Clear Metro cache** regularly
2. **Restart Expo CLI** if it becomes slow
3. **Close unused simulators/emulators**

### 📦 Dependency Issues

**Module resolution errors:**
1. **Clear node_modules:**
   ```bash
   rm -rf node_modules
   npm install
   ```

2. **Clear package-lock:**
   ```bash
   rm package-lock.json
   npm install
   ```

3. **Use legacy peer deps:**
   ```bash
   npm install --legacy-peer-deps
   ```

### 🔧 Development Tips

**Hot reloading not working:**
- Press `r` in Expo CLI to reload
- Press `Cmd+R` (iOS) or `R+R` (Android) in simulator
- Check if Fast Refresh is enabled

**Debugging:**
- Press `j` in Expo CLI to open debugger
- Use `console.log()` statements
- Check browser console for web platform
- Use React Native Debugger for advanced debugging

### 📋 Quick Fixes Checklist

When encountering issues, try these in order:

1. ✅ **Restart Expo CLI:** `Ctrl+C` then `npm start`
2. ✅ **Clear Metro cache:** `npx expo start --clear`
3. ✅ **Restart backend:** `cd ../finovate-backend && npm run dev`
4. ✅ **Clear node_modules:** `rm -rf node_modules && npm install`
5. ✅ **Check network connectivity:** Backend accessible at `http://localhost:5000`
6. ✅ **Verify demo credentials:** `demo@finovate.com` / `password123`
7. ✅ **Try different platform:** Web, iOS, or Android
8. ✅ **Check Expo CLI version:** `npm install -g @expo/cli@latest`

### 🆘 Getting Help

If issues persist:

1. **Check Expo documentation:** https://docs.expo.dev/
2. **Check React Native documentation:** https://reactnative.dev/
3. **Search GitHub issues:** Look for similar problems
4. **Create detailed issue report** with:
   - Error messages
   - Steps to reproduce
   - Platform (iOS/Android/Web)
   - Node.js version
   - Expo CLI version

### 📱 Production Deployment

**Building for production:**

1. **iOS:**
   ```bash
   eas build --platform ios
   ```

2. **Android:**
   ```bash
   eas build --platform android
   ```

3. **Web:**
   ```bash
   npx expo export --platform web
   ```

**Note:** Production builds require EAS (Expo Application Services) setup.

---

**Remember:** Most issues can be resolved by clearing caches and restarting services! 🔄
