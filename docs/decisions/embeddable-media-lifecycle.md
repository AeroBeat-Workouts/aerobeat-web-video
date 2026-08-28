# Embeddable Media Lifecycle

**Status:** Accepted for the embeddable `aero-game` prototype

## Decision

Each connected game creates its own browser video facade. The facade owns browser video resources and lifecycle truth, while assembly owns cross-instance lease arbitration and CV/gameplay decide how pause flags affect their domains.

- `getUserMedia` streams are facade-owned and their tracks stop on replacement, lease release, or destroy.
- Injected streams are host-owned by default and are never stopped by detach or destroy. A host may explicitly transfer ownership.
- Every async camera or playback operation captures lifecycle and operation generations. Pause, visibility/lease pause, source replacement and destroy invalidate pending playback; late results are discarded, and a late facade-owned camera result is stopped immediately.
- Cross-source and cross-element replacement detaches stale elements, revokes facade-owned object URLs and releases only facade-owned streams. Host-owned injected tracks are never stopped.
- Destroy is synchronous and idempotent. Reconnect starts a fresh generation and never revives prior async work.
- Hidden-document and lease-pause hooks pause media consumers while retaining a camera stream. Lease release may relinquish the retained stream.
- Source ID, mirror state, and intrinsic aspect form the calibration source identity. Any change increments `sourceChangeId` so input can invalidate calibration.
- Loaded media declares `background-only` or `sampled-media`. Cosmetic sources do not require pixel readability; sampled sources begin `unknown` and must receive a truthful readability/CORS report before CV or WebGL sampling.
- Blob object URLs created by the facade are revoked on source replacement, detach, or destroy.

## Boundaries

The facade does not select the active game, run inference, pause gameplay clocks, score input, render UI, or decide product fallback policy. It reports immutable snapshots and exposes lease/visibility hooks for those owners.
