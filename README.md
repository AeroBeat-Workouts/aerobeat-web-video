# aerobeat-web-video

## Responsibility

AeroBeat-owned browser video and camera media lifecycle facade for the web port.

This package owns browser-native live camera, loaded video, and replay video feed source descriptors plus the facade that requests camera permission, retains granted streams, attaches media to `HTMLVideoElement` surfaces, reports playback/surface metadata, and tears streams down.

It does not own MoveNet inference, pose-frame production, gameplay input routing, WebGL2 drawing, UI components, or product assembly wiring.

The built-in implementation uses browser media APIs behind an AeroBeat-owned boundary. Future vendor/player backends should adapt behind this facade instead of leaking vendor-native media object graphs to CV, input, renderer, UI, or assembly code.

## Public API Surface

- `src/source-descriptors.js` exports documented live camera, loaded video, and replay video feed descriptors.
- `src/browser-video-facade.js` exports `createBrowserVideoMediaFacade()` and the `aero.video.media` service ID.
- `src/index.js` exports the public package surface for `@aerobeat/web-video`.

## Adjacent Repos

- `aerobeat-web-cv` consumes media surfaces later to produce normalized pose frames.
- `aerobeat-web-input` owns gameplay-facing input events and replay/fake pose routing.
- `aerobeat-web-ui` owns calibration and media status components.
- `aerobeat-web-renderer` owns WebGL2 gameplay drawing.
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

The current checks are no-dependency scaffold validators for strict JSDoc/no-escape posture, public import boundaries, component-only screen/scene composition, Playwright console-warning/error posture, and media facade smoke behavior.

When a browser-visible package needs mobile or remote validation, add `npm run testbed:serve`. It must state the host, port, cache-busting/version display, QR/link helper, served roots, and HTTPS or secure-context path for Tailscale devices.

## Docs Handoff

Keep repo-local implementation notes and accepted decisions under `docs/`. Public contributor/user docs belong in `aerobeat-web-docs`; mirror cross-repo decisions there after they are accepted.
