export {
  registerUser,
  loginUser,
  refreshSession,
  fetchCurrentUser,
  logoutUser,
  enrollBiometric,
  fetchBiometricChallenge,
  biometricLogin,
} from './api';
export { getBiometricCapability, promptBiometric } from './biometric';
export {
  generateDeviceKeyMaterial,
  signChallenge,
} from './device-key';
export {
  clearAuthSession,
  clearDeviceKeyMaterial,
  isAccessTokenExpired,
  isBiometricLockEnabled,
  loadAccessToken,
  loadDeviceKeyMaterial,
  loadRefreshToken,
  loadStoredUser,
  saveAuthSession,
  saveDeviceKeyMaterial,
  setBiometricLockEnabled,
  resetLocalBiometricState,
} from './storage';
export type {
  AuthSession,
  AuthTokens,
  AuthUser,
  BiometricEnrollInput,
  LoginInput,
  RegisterInput,
} from './types';
