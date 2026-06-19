export interface BluetoothRelayPayload {
  signedTxXDR: string;
  recipientPhone?: string;
}

/**
 * Placeholder for BLE peer transfer. Wire react-native-ble-plx when hardware testing begins.
 */
export async function sendViaBluetooth(
  _payload: BluetoothRelayPayload,
): Promise<void> {
  throw new Error('Bluetooth relay is not implemented yet. Use QR flow for now.');
}

export async function receiveViaBluetooth(): Promise<BluetoothRelayPayload> {
  throw new Error('Bluetooth relay is not implemented yet. Use QR flow for now.');
}
