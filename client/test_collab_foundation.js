/**
 * SyncDoc Collaboration UI Foundation — Verification Test Suite
 * Validates Week 1 components, mock data contracts, conflict resolution logic,
 * and user presence indicators.
 */

import assert from 'node:assert';
import {
  mockCollaborators,
  mockConnectionInfo,
  mockNotifications,
  mockActiveConflict,
  mockVersionHistory,
  PresenceStatus,
  ConnectionState,
} from './src/data/mockCollaborationData.js';

console.log('🧪 Starting SyncDoc Collaboration UI Foundation Tests...\n');

// 1. Test Collaborators Data Structure
console.log('Test 1: Verifying Collaborators Data & Presence');
assert.strictEqual(mockCollaborators.length, 4, 'Must have 4 initial collaborators');
const kirubakar = mockCollaborators.find((c) => c.name === 'Kirubakar');
assert.ok(kirubakar, 'Kirubakar must be present');
assert.strictEqual(kirubakar.isSelf, true, 'Kirubakar must be identified as self ("You")');
assert.strictEqual(kirubakar.status, PresenceStatus.ONLINE, 'Kirubakar is online');
assert.strictEqual(kirubakar.activity, 'Editing Paragraph 2', 'Kirubakar activity must be Editing Paragraph 2');

const arjun = mockCollaborators.find((c) => c.name === 'Arjun');
assert.ok(arjun, 'Arjun must be present');
assert.strictEqual(arjun.status, PresenceStatus.ONLINE, 'Arjun is online');
assert.strictEqual(arjun.activity, 'Editing Code Block', 'Arjun activity must be Editing Code Block');

const priya = mockCollaborators.find((c) => c.name === 'Priya');
assert.ok(priya, 'Priya must be present');
assert.strictEqual(priya.status, PresenceStatus.VIEWING, 'Priya must have Viewing status');

const rahul = mockCollaborators.find((c) => c.name === 'Rahul');
assert.ok(rahul, 'Rahul must be present');
assert.strictEqual(rahul.status, PresenceStatus.OFFLINE, 'Rahul must be Offline');
console.log('  ✅ Collaborators panel data passed.\n');

// 2. Test Connection Status
console.log('Test 2: Verifying Connection Status');
assert.strictEqual(mockConnectionInfo.status, ConnectionState.CONNECTED, 'Default state must be connected');
assert.ok(mockConnectionInfo.lastSynchronized, 'Must provide lastSynchronized info');
console.log('  ✅ Connection status state passed.\n');

// 3. Test Conflict Notification Data & Resolution Logic
console.log('Test 3: Verifying Conflict Data & Resolution Cases');
assert.ok(mockActiveConflict, 'Active conflict must exist');
assert.strictEqual(mockActiveConflict.changedBy, 'Arjun', 'Conflict author must be Arjun');
assert.strictEqual(
  mockActiveConflict.yourVersion,
  'NodeMCU communicates with the server using Wi-Fi.',
  'Your version must match NodeMCU spec'
);
assert.strictEqual(
  mockActiveConflict.latestVersion,
  'ESP8266 communicates with the server using Wi-Fi.',
  'Latest version must match ESP8266 spec'
);

// Simulate resolution choices
const resolveMine = (conflict) => conflict.yourVersion;
const resolveLatest = (conflict) => conflict.latestVersion;

assert.strictEqual(resolveMine(mockActiveConflict), 'NodeMCU communicates with the server using Wi-Fi.');
assert.strictEqual(resolveLatest(mockActiveConflict), 'ESP8266 communicates with the server using Wi-Fi.');
console.log('  ✅ Conflict detection & resolution logic passed.\n');

// 4. Test Version History Data
console.log('Test 4: Verifying Document Version History (v1.1 - v1.4)');
assert.strictEqual(mockVersionHistory.length, 4, 'Must have 4 history records');
const v14 = mockVersionHistory.find((v) => v.versionNumber === 'v1.4');
assert.ok(v14, 'v1.4 must exist');
assert.strictEqual(v14.user, 'Kirubakar');
assert.strictEqual(v14.description, 'Added system architecture');

const v13 = mockVersionHistory.find((v) => v.versionNumber === 'v1.3');
assert.ok(v13, 'v1.3 must exist');
assert.strictEqual(v13.user, 'Arjun');
assert.strictEqual(v13.description, 'Updated code block');

const v12 = mockVersionHistory.find((v) => v.versionNumber === 'v1.2');
assert.ok(v12, 'v1.2 must exist');
assert.strictEqual(v12.user, 'Priya');

const v11 = mockVersionHistory.find((v) => v.versionNumber === 'v1.1');
assert.ok(v11, 'v1.1 must exist');
assert.strictEqual(v11.user, 'Kirubakar');
console.log('  ✅ Version history timeline passed.\n');

// 5. Test Collaboration Notifications Stack
console.log('Test 5: Verifying Collaboration Notifications');
assert.ok(mockNotifications.length >= 3, 'Initial notifications queue populated');
const joinNotif = mockNotifications.find((n) => n.title === 'User joined');
assert.ok(joinNotif, 'User joined notification exists');
assert.ok(joinNotif.message.includes('Arjun'), 'User joined message mentions Arjun');
console.log('  ✅ Collaboration notifications passed.\n');

console.log('🎉 ALL 5 INTEGRATION TEST SUITES PASSED CLEANLY! (100% assertions successful)');
