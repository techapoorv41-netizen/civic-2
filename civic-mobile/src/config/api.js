import { Platform } from 'react-native';

/**
 * Mobile API Configuration for CivicSense Shared REST API
 * 
 * Networking Guide:
 * - Android Emulator: 10.0.2.2 routes to the host development machine
 * - iOS Simulator: localhost routes to the host development machine
 * - Physical Device (Android/iOS): Requires host machine LAN Wi-Fi IP
 * - Production: Deployed HTTPS API URL (e.g. https://civicsense-backend.onrender.com/api/v1)
 */

// Host Wi-Fi IP for physical mobile testing (update to host machine's Wi-Fi IPv4)
export const LOCAL_WIFI_IP = '10.254.218.193';
export const API_PORT = '5000';
export const API_PREFIX = '/api/v1';

// Base dev URL per platform
export const DEV_API_URL = Platform.select({
  android: `http://10.0.2.2:${API_PORT}${API_PREFIX}`, // Standard Android emulator loopback
  ios: `http://localhost:${API_PORT}${API_PREFIX}`,    // iOS simulator loopback
  default: `http://localhost:${API_PORT}${API_PREFIX}`,
});

// Physical device Wi-Fi URL
export const PHYSICAL_DEVICE_API_URL = `http://${LOCAL_WIFI_IP}:${API_PORT}${API_PREFIX}`;

// Primary active base URL (default to DEV_API_URL, switch to PHYSICAL_DEVICE_API_URL for Wi-Fi)
export const API_BASE_URL = DEV_API_URL;
