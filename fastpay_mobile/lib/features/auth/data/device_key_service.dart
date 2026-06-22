import 'dart:convert';
import 'dart:math';

import 'package:cryptography/cryptography.dart';

class DeviceKeyMaterial {
  const DeviceKeyMaterial({
    required this.deviceId,
    required this.publicKey,
    required this.secretKey,
  });

  final String deviceId;
  final String publicKey;
  final String secretKey;
}

class StoredDeviceKey {
  const StoredDeviceKey({
    required this.deviceId,
    required this.secretKey,
  });

  final String deviceId;
  final String secretKey;
}

class DeviceKeyService {
  DeviceKeyService({Ed25519? algorithm}) : _algorithm = algorithm ?? Ed25519();

  static const deviceIdKey = 'fastpay_biometric_device_id';
  static const deviceSecretKey = 'fastpay_biometric_device_secret';

  final Ed25519 _algorithm;

  Future<DeviceKeyMaterial> generate() async {
    final keyPair = await _algorithm.newKeyPair();
    final publicKey = await keyPair.extractPublicKey();
    final privateKeyBytes = await keyPair.extractPrivateKeyBytes();
    final deviceId = _randomDeviceId();

    return DeviceKeyMaterial(
      deviceId: deviceId,
      publicKey: base64Encode(publicKey.bytes),
      secretKey: base64Encode(privateKeyBytes),
    );
  }

  Future<String> signChallenge(String secretKeyBase64, String challenge) async {
    final keyPair = await _algorithm.newKeyPairFromSeed(
      base64Decode(secretKeyBase64),
    );
    final signature = await _algorithm.sign(
      utf8.encode(challenge),
      keyPair: keyPair,
    );

    return base64Encode(signature.bytes);
  }

  String _randomDeviceId() {
    final random = Random.secure();
    final bytes = List<int>.generate(16, (_) => random.nextInt(256));
    return bytes.map((byte) => byte.toRadixString(16).padLeft(2, '0')).join();
  }
}
