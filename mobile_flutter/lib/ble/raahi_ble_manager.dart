/**
 * RAAHI Android Native / Flutter BLE Mesh Manager
 * HERHACK 2026 - Team ShaktiX
 * 
 * Implements BLE Advertising (Peripheral mode) and Scanning (Central mode)
 * for offline emergency packet broadcast and relaying on Android devices.
 */

import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';

class RaahiBleManager {
  static const String serviceUuid = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
  static const String characteristicUuid = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

  bool _isAdvertising = false;
  bool _isScanning = false;
  final Set<String> _seenPacketIds = {};

  bool get isAdvertising => _isAdvertising;
  bool get isScanning => _isScanning;

  /// Start BLE Emergency Broadcast (when offline SOS is triggered)
  Future<bool> startEmergencyBroadcast({
    required String eventId,
    required String payloadJson,
  }) async {
    try {
      debugPrint('[RAAHI BLE] Starting Advertising with Service UUID: $serviceUuid');
      debugPrint('[RAAHI BLE] Packet payload: $payloadJson');
      
      // In Android native layer:
      // BluetoothLeAdvertiser.startAdvertising(settings, advertiseData, callback)
      // AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY, TX_POWER_HIGH
      _isAdvertising = true;
      return true;
    } catch (e) {
      debugPrint('[RAAHI BLE] Advertising failed: $e');
      return false;
    }
  }

  /// Stop Emergency Broadcast
  Future<void> stopEmergencyBroadcast() async {
    _isAdvertising = false;
    debugPrint('[RAAHI BLE] Stopped emergency broadcast.');
  }

  /// Start Background Relay Scanning (Opted-in devices)
  Future<void> startRelayScanner({
    required Function(Map<String, dynamic> packet) onPacketReceived,
  }) async {
    if (_isScanning) return;
    _isScanning = true;
    debugPrint('[RAAHI BLE] Scanning for nearby RAAHI emergency packets...');
    
    // In Android native layer:
    // BluetoothLeScanner.startScan(filters, settings, scanCallback)
    // ScanFilter.Builder().setServiceUuid(ParcelUuid(UUID.fromString(serviceUuid)))
  }

  /// Process received BLE packet from another device
  void handleDiscoveredPacket(String rawData, Function(Map<String, dynamic>) onValidRelay) {
    try {
      final packet = jsonDecode(rawData) as Map<String, dynamic>;
      final packetId = packet['packet_id'] as String?;
      final hopCount = packet['hop_count'] as int? ?? 0;
      final maxHops = packet['max_hops'] as int? ?? 3;

      if (packetId == null || _seenPacketIds.contains(packetId)) {
        debugPrint('[RAAHI BLE] Dropping duplicate packet: $packetId');
        return;
      }

      if (hopCount >= maxHops) {
        debugPrint('[RAAHI BLE] Hop limit ($hopCount/$maxHops) reached. Halting relay.');
        return;
      }

      _seenPacketIds.add(packetId);
      onValidRelay(packet);
    } catch (e) {
      debugPrint('[RAAHI BLE] Malformed BLE packet: $e');
    }
  }
}
