# aerobeat-web-video

## Responsibility

AeroBeat-owned browser video and camera media lifecycle facade for the web port.

This package owns browser-native live camera, injected `MediaStream`, loaded video, replay video, surface attachment, reconnect, visibility, lease-participation, CORS/readability reporting, and deterministic teardown behavior. It lists camera inputs, requests camera permission, tracks stream ownership, exposes immutable status/surface snapshots, and rejects late async work from obsolete lifecycle generations.

It does not own cross-instance lease arbitration, CV inference, pose-frame production, gameplay pause policy, input routing, PlayCanvas drawing, UI components, or product assembly wiring.

The built-in implementation uses browser media APIs behind an AeroBeat-owned boundary. Future vendor/player backends should adapt behind this facade instead of leaking vendor-native media object graphs to CV, input, renderer, UI, or assembly code.

## Public API Surface

- `src/source-descriptors.js` exports live-camera, loaded-video, and replay-video descriptors with stable source/mirror identity plus explicit `background-only` versus `sampled-media` readability and CORS metadata.
- `src/browser-video-facade.js` exports `createBrowserVideoMediaFacade()` and the `aero.video.media` service ID. The facade supports direct camera acquisition, host-owned or transferred stream injection, URL/blob attachment, lease and visibility pause hooks, source-change identities, truthful errors/capabilities, synchronous destroy, and reconnect.
- `src/index.js` is the only public package import surface for `@aerobeat/web-video`.

## Lifecycle and ownership

- Direct `getUserMedia` results are facade-owned. Replacing, releasing, or destroying them stops their tracks.
- Injected streams are host-owned by default and are never stopped by the facade. Explicit `ownership: "facade-owned"` transfers teardown responsibility.
- Every camera/play request captures operation and lifecycle generations. Abort, pause, visibility/lease pause, source replacement, or destroy makes a late result stale; late acquired tracks are stopped immediately.
- Cross-source and cross-element replacement detaches stale surfaces, revokes facade-owned object URLs, and releases only facade-owned streams; host-owned streams are merely forgotten.
- `destroy()` is synchronous and idempotent. It removes listeners, detaches the element, revokes owned object URLs, and clears retained references. `reconnect()` starts a fresh generation.
- Hidden-document and lease pause retain the camera; lease release relinquishes the stream by default. Assembly remains the only cross-instance arbiter.
- `calibrationSourceIdentity` and `sourceChangeId` reflect source ID, mirror state, and intrinsic aspect. Input invalidates calibration when this identity changes.
- Background-only media needs no pixel-read guarantee. Sampled media begins with unknown readability and requires a real CORS/readback probe to report `readable` or `blocked`.

## Adjacent Repos

- `aerobeat-web-cv` consumes media surfaces later to produce normalized pose frames.
- `aerobeat-web-input` owns gameplay-facing input events and replay/fake pose routing.
- `aerobeat-web-ui` owns calibration and media status components.
- `aerobeat-web-renderer` owns PlayCanvas gameplay drawing (`aero.renderer.playcanvas`).
- `aerobeat-web-assembly` wires concrete facade instances into the product shell.

## Source Boundary

Runtime code lives under `src/` and is exposed through `package.json` `exports`. Tests, demos, scenes, debug data, screenshots, traces, and Playwright harnesses live under `.testbed/`.

## Public Imports

This scaffold has no runtime package imports. Future code may import only declared public exports from other `@aerobeat/web-*` packages. Do not import sibling repo internals, private testbed files, unexported source paths, or vendor-native shapes across domain boundaries.

## JavaScript Posture

- Use JavaScript, native ES modules, `// @ts-check`, and JSDoc.
- Every exported value, public structure, service shape, event payload, and typedef needs JSDoc.
- Do not use `any`, star-shaped JSDoc escapes, or undocumented escape hatches.
- Unknown external values must be narrowed into documented shapes before use.

## Validation

Run these commands before handoff:

```bash
npm run check
npm test
npm run test:browser
```

The checks enforce strict JSDoc/no-escape posture, public import boundaries, component-only screen/scene composition, Playwright console-warning/error posture, deterministic fake-browser lifecycle coverage, and real Chromium smoke coverage for injected streams, ownership transfer, reconnect, blob cleanup, and readability snapshots. Playwright is a development-only dependency.

When a browser-visible package needs mobile or remote validation, add `npm run testbed:serve`. It must state the host, port, cache-busting/version display, QR/link helper, served roots, and HTTPS or secure-context path for Tailscale devices.

## Docs Handoff

Keep repo-local implementation notes and accepted decisions under `docs/`. Public contributor/user docs belong in `aerobeat-web-docs`; mirror cross-repo decisions there after they are accepted.
