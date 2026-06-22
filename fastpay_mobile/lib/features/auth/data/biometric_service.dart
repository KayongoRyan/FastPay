import 'package:local_auth/local_auth.dart';

class BiometricService {
  BiometricService({LocalAuthentication? localAuth})
      : _localAuth = localAuth ?? LocalAuthentication();

  final LocalAuthentication _localAuth;

  Future<BiometricCapability> getCapability() async {
    final canCheck = await _localAuth.canCheckBiometrics;
    final isSupported = await _localAuth.isDeviceSupported();
    final available = canCheck && isSupported;

    if (!available) {
      return const BiometricCapability(
        available: false,
        enrolled: false,
        label: 'Biometrics',
      );
    }

    final biometrics = await _localAuth.getAvailableBiometrics();
    final enrolled = biometrics.isNotEmpty;
    final label = _labelFor(biometrics);

    return BiometricCapability(
      available: true,
      enrolled: enrolled,
      label: label,
    );
  }

  Future<bool> authenticate(String reason) async {
    final capability = await getCapability();
    if (!capability.available || !capability.enrolled) {
      return false;
    }

    return _localAuth.authenticate(
      localizedReason: reason,
      options: const AuthenticationOptions(
        stickyAuth: true,
        biometricOnly: false,
      ),
    );
  }

  String _labelFor(List<BiometricType> types) {
    if (types.contains(BiometricType.face)) {
      return 'Face ID';
    }
    if (types.contains(BiometricType.fingerprint)) {
      return 'Fingerprint';
    }
    if (types.contains(BiometricType.iris)) {
      return 'Iris';
    }
    return 'Biometrics';
  }
}

class BiometricCapability {
  const BiometricCapability({
    required this.available,
    required this.enrolled,
    required this.label,
  });

  final bool available;
  final bool enrolled;
  final String label;
}
