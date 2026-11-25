import { describe, expect, it } from 'vitest';
import { claude, email, googleMaps, googleSolar, paymongo, pvwatts, sms } from './index';

describe('integration fakes', () => {
  it('geocodes a non-empty address and rejects an empty one', async () => {
    const maps = new googleMaps.FakeGoogleMaps();
    expect(await maps.geocode('Bacoor, Cavite')).not.toBeNull();
    expect(await maps.geocode('   ')).toBeNull();
  });

  it('returns roof data with its imagery quality', async () => {
    const r = await new googleSolar.FakeSolarApi().findClosestBuilding(14.4, 120.9, 'BASE');
    expect(r?.imageryQuality).toBe('BASE');
    expect(r?.segments.length).toBeGreaterThan(0);
  });

  it('simulates twelve months of energy', async () => {
    const r = await new pvwatts.FakePvWatts().simulate({
      lat: 14.4,
      lng: 120.9,
      kwp: 5.4,
      tiltDegrees: 15,
      azimuthDegrees: 135,
      lossesPct: 14,
    });
    expect(r.monthlyKwh).toHaveLength(12);
  });

  it('only accepts a valid webhook signature', () => {
    const p = new paymongo.FakePayMongo();
    expect(p.verifyWebhook('{}', 'valid')).toBe(true);
    expect(p.verifyWebhook('{}', 'forged')).toBe(false);
  });

  it('reads a bill with per-field confidence and only the last 4 account digits', async () => {
    const r = await new claude.FakeClaude().readBill('', 'image/jpeg');
    expect(r.accountLast4).toHaveLength(4);
    expect(r.confidence.kwh).toBeGreaterThan(0);
  });

  it('records sent messages', async () => {
    const s = new sms.FakeSms();
    await s.send('+639171234567', 'Hello');
    const e = new email.FakeEmail();
    await e.send({ to: 'a@example.test', subject: 'Hi', html: '<p>Hi</p>', text: 'Hi' });
    expect(s.sent).toHaveLength(1);
    expect(e.sent).toHaveLength(1);
  });
});
