import { describe, it, expect, beforeEach } from 'vitest';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

// Inline the functions under test so this suite has zero import side-effects
// (no Fastify, no DB, no env bootstrap).
const SECRET = 'test-secret-key';

function encodeOAuthState(dealerId: string, secret: string): string {
  const nonce = randomBytes(16).toString('hex');
  const ts = Date.now().toString();
  const payload = `${dealerId}|${nonce}|${ts}`;
  const sig = createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}|${sig}`, 'utf8').toString('base64url');
}

function decodeOAuthState(state: string, secret: string): string | null {
  try {
    const raw = Buffer.from(state, 'base64url').toString('utf8');
    const parts = raw.split('|');
    if (parts.length !== 4) return null;
    const [dealerId, nonce, ts, sig] = parts as [string, string, string, string];
    const payload = `${dealerId}|${nonce}|${ts}`;
    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    const sigBuf = Buffer.from(sig, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;
    if (Date.now() - parseInt(ts) > 10 * 60 * 1000) return null;
    if (!dealerId || dealerId.length > 200) return null;
    return dealerId;
  } catch {
    return null;
  }
}

describe('HMAC OAuth state', () => {
  const dealerId = 'dealer-uuid-1234';

  it('round-trips a valid dealer ID', () => {
    const state = encodeOAuthState(dealerId, SECRET);
    expect(decodeOAuthState(state, SECRET)).toBe(dealerId);
  });

  it('rejects a tampered signature', () => {
    const state = encodeOAuthState(dealerId, SECRET);
    const tampered = state.slice(0, -4) + 'xxxx';
    expect(decodeOAuthState(tampered, SECRET)).toBeNull();
  });

  it('rejects a state signed with a different secret', () => {
    const state = encodeOAuthState(dealerId, SECRET);
    expect(decodeOAuthState(state, 'wrong-secret')).toBeNull();
  });

  it('rejects plain base64 dealer_id (old format)', () => {
    const oldStyle = Buffer.from(dealerId, 'utf8').toString('base64url');
    expect(decodeOAuthState(oldStyle, SECRET)).toBeNull();
  });

  it('rejects state with expired timestamp', () => {
    // Build a state with a timestamp 11 minutes ago
    const nonce = randomBytes(16).toString('hex');
    const ts = (Date.now() - 11 * 60 * 1000).toString();
    const payload = `${dealerId}|${nonce}|${ts}`;
    const sig = createHmac('sha256', SECRET).update(payload).digest('hex');
    const expired = Buffer.from(`${payload}|${sig}`, 'utf8').toString('base64url');
    expect(decodeOAuthState(expired, SECRET)).toBeNull();
  });
});
