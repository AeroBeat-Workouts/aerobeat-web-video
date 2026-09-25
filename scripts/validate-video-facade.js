// @ts-check

import assert from "node:assert/strict";
import {
  aeroVideoMediaServiceId,
  createBrowserVideoMediaFacade,
  createLiveCameraSourceDescriptor,
  createLoadedVideoSourceDescriptor,
  createReplayVideoFeedSourceDescriptor
} from "../src/index.js";

/** @typedef {object} FakeTrack
 * @property {boolean} stopped
 * @property {number} stopCalls
 * @property {() => void} stop
 */
/** @typedef {object} FakeStream
 * @property {string} id
 * @property {() => FakeTrack[]} getTracks
 */
/** @typedef {object} FakeVideoElement
 * @property {FakeStream | null} srcObject
 * @property {string} src
 * @property {string | null} crossOrigin
 * @property {boolean} muted
 * @property {boolean} playsInline
 * @property {boolean} loop
 * @property {boolean} autoplay
 * @property {number} currentTime
 * @property {number} duration
 * @property {number} videoWidth
 * @property {number} videoHeight
 * @property {number} playCalls
 * @property {number} pauseCalls
 * @property {number} loadCalls
 * @property {() => Promise<void>} play
 * @property {() => void} pause
 * @property {(name: string) => void} removeAttribute
 * @property {() => void} load
 * @property {(type: string, listener: () => void) => void} addEventListener
 * @property {(type: string, listener: () => void) => void} removeEventListener
 * @property {(type: string) => void} dispatch
 * @property {() => number} listenerCount
 */

/** @returns {{track: FakeTrack, stream: FakeStream}} */
function createFakeStream() {
  /** @type {FakeTrack} */
  const track = { stopped: false, stopCalls: 0, stop() { this.stopped = true; this.stopCalls += 1; } };
  /** @type {FakeStream} */
  const stream = { id: `stream-${Math.random()}`, getTracks() { return [track]; } };
  return { track, stream };
}

/** @returns {FakeVideoElement} */
function createFakeVideoElement() {
  /** @type {Map<string, Set<() => void>>} */
  const listeners = new Map();
  return {
    srcObject: null,
    src: "",
    crossOrigin: null,
    muted: false,
    playsInline: false,
    loop: false,
    autoplay: false,
    currentTime: 0,
    duration: 12,
    videoWidth: 1280,
    videoHeight: 720,
    playCalls: 0,
    pauseCalls: 0,
    loadCalls: 0,
    async play() { this.playCalls += 1; this.dispatch("play"); },
    pause() { this.pauseCalls += 1; this.dispatch("pause"); },
    removeAttribute(name) { if (name === "src") this.src = ""; },
    load() { this.loadCalls += 1; },
    addEventListener(type, listener) {
      const group = listeners.get(type) ?? new Set();
      group.add(listener);
      listeners.set(type, group);
    },
    removeEventListener(type, listener) { listeners.get(type)?.delete(listener); },
    dispatch(type) { for (const listener of listeners.get(type) ?? []) listener(); },
    listenerCount() { return [...listeners.values()].reduce((total, group) => total + group.size, 0); }
  };
}

/** @returns {{document: import("../src/browser-video-facade.js").AeroVisibilityDocument, setHidden: (hidden: boolean) => void, count: () => number}} */
function createFakeDocument() {
  /** @type {Set<() => void>} */
  const listeners = new Set();
  const state = { visibilityState: "visible" };
  return {
    document: {
      get visibilityState() { return state.visibilityState; },
      addEventListener(type, listener) { if (type === "visibilitychange") listeners.add(listener); },
      removeEventListener(type, listener) { if (type === "visibilitychange") listeners.delete(listener); }
    },
    setHidden(hidden) {
      state.visibilityState = hidden ? "hidden" : "visible";
      for (const listener of listeners) listener();
    },
    count() { return listeners.size; }
  };
}

const liveSource = createLiveCameraSourceDescriptor({ sourceId: "camera-1" });
assert.equal(liveSource.kind, "live-camera");
assert.equal(liveSource.mirrored, true);
const background = createLoadedVideoSourceDescriptor({ url: "https://assets.example/background.mp4" });
assert.equal(background.readabilityRequirement, "background-only");
const sampled = createLoadedVideoSourceDescriptor({
  url: "https://assets.example/sample.mp4",
  sourceId: "sample",
  readabilityRequirement: "sampled-media",
  crossOrigin: "anonymous"
});
assert.equal(sampled.crossOrigin, "anonymous");
const replay = createReplayVideoFeedSourceDescriptor({ url: "/replay.webm", frameRate: 30 });
assert.equal(replay.readabilityRequirement, "sampled-media");
assert.equal(replay.crossOrigin, "anonymous");

const owned = createFakeStream();
const host = createFakeStream();
const visibility = createFakeDocument();
const facade = createBrowserVideoMediaFacade({
  document: visibility.document,
  mediaDevices: {
    async enumerateDevices() {
      return [
        { kind: "audioinput", deviceId: "mic", label: "Mic", groupId: "audio" },
        { kind: "videoinput", deviceId: "camera-1", label: "Front", groupId: "front" },
        { kind: "videoinput", deviceId: "camera-2", label: "", groupId: "" }
      ];
    },
    async getUserMedia(constraints) {
      assert.deepEqual(constraints, liveSource.constraints);
      return /** @type {MediaStream} */ (/** @type {unknown} */ (owned.stream));
    }
  }
});
assert.equal(facade.serviceId, aeroVideoMediaServiceId);
assert.equal(facade.describeStatus().capabilities.injectedStreams, true);
assert.equal(facade.describeStatus().inferencePaused, true);
assert.deepEqual(await facade.listCameraDevices(), [
  { deviceId: "camera-1", label: "Front", groupId: "front" },
  { deviceId: "camera-2", label: "Camera 2", groupId: undefined }
]);
facade.activateLease();
assert.equal(facade.describeStatus().inferencePaused, false);
const request = await facade.requestCamera(liveSource);
assert.equal(request.status, "granted");
assert.equal(facade.describeStatus().streamOwnership, "facade-owned");

const element = createFakeVideoElement();
const firstSurface = facade.attachCameraStream(
  /** @type {HTMLVideoElement} */ (/** @type {unknown} */ (element))
);
assert.equal(firstSurface.hasRetainedStream, true);
assert.equal(firstSurface.sourceAspectRatio, 1280 / 720);
assert.equal(element.srcObject, owned.stream);
assert.equal(element.listenerCount(), 5);
const firstIdentity = firstSurface.calibrationSourceIdentity;

element.videoWidth = 640;
element.videoHeight = 640;
element.dispatch("loadedmetadata");
const changedAspect = facade.describeSurface();
assert.notEqual(changedAspect.calibrationSourceIdentity, firstIdentity);
assert.ok(changedAspect.sourceChangeId > firstSurface.sourceChangeId);

// A transient 0×0 surface (intrinsic dimensions not yet loaded, e.g. mid
// stream renegotiation) must NOT invalidate the last known identity: the
// change counter and signature stay put, and returning to the same real
// dimensions is not a new change.
element.videoWidth = 0;
element.videoHeight = 0;
const zeroSurface = facade.describeSurface();
assert.equal(zeroSurface.sourceChangeId, changedAspect.sourceChangeId, "0×0 transient must not advance sourceChangeId");
assert.equal(zeroSurface.calibrationSourceIdentity, changedAspect.calibrationSourceIdentity, "0×0 transient must not change the identity signature");
element.videoWidth = 640;
element.videoHeight = 640;
element.dispatch("loadedmetadata");
const restoredAspect = facade.describeSurface();
assert.equal(restoredAspect.sourceChangeId, changedAspect.sourceChangeId, "restoring the same dimensions must not advance sourceChangeId");
assert.equal(restoredAspect.calibrationSourceIdentity, changedAspect.calibrationSourceIdentity, "restoring the same dimensions must not change the identity signature");

visibility.setHidden(true);
assert.equal(facade.describeStatus().documentHidden, true);
assert.equal(facade.describeStatus().inferencePaused, true);
assert.equal(facade.getRetainedCameraStream(), owned.stream);
visibility.setHidden(false);
assert.equal(facade.describeStatus().documentHidden, false);

facade.pauseForLease();
assert.equal(facade.describeStatus().leaseState, "paused");
assert.equal(facade.getRetainedCameraStream(), owned.stream);
facade.activateLease();
facade.injectCameraStream(
  /** @type {MediaStream} */ (/** @type {unknown} */ (host.stream)),
  { source: createLiveCameraSourceDescriptor({ sourceId: "host-camera", mirrored: false }) }
);
assert.equal(owned.track.stopped, true, "replacing an owned stream must stop it");
assert.equal(facade.describeStatus().streamOwnership, "host-owned");
facade.attachCameraStream(/** @type {HTMLVideoElement} */ (/** @type {unknown} */ (element)));
facade.destroy();
assert.equal(host.track.stopped, false, "destroy must not stop a host-owned stream");
assert.equal(element.srcObject, null);
assert.equal(element.listenerCount(), 0);
assert.equal(visibility.count(), 0);
assert.equal(facade.destroy().lifecycleState, "destroyed", "destroy is idempotent");
assert.equal(facade.injectCameraStream(
  /** @type {MediaStream} */ (/** @type {unknown} */ (host.stream))
).lifecycleState, "destroyed");
assert.equal(facade.getRetainedCameraStream(), undefined, "destroyed instances cannot be resurrected by injection");
assert.equal((await facade.requestCamera()).status, "stale");
assert.equal(facade.activateLease().leaseState, "released");
assert.equal(facade.reconnect().lifecycleState, "connected");
assert.equal(visibility.count(), 1);

const transferred = createFakeStream();
facade.injectCameraStream(
  /** @type {MediaStream} */ (/** @type {unknown} */ (transferred.stream)),
  { ownership: "facade-owned" }
);
facade.releaseLease();
assert.equal(transferred.track.stopped, true, "transferred ownership must stop on lease release");

// A late getUserMedia resolution cannot resurrect a destroyed generation.
const late = createFakeStream();
/** @type {(stream: MediaStream) => void} */
let resolveLate = () => {};
const lateFacade = createBrowserVideoMediaFacade({
  mediaDevices: {
    async enumerateDevices() { return []; },
    getUserMedia() {
      return new Promise((resolve) => { resolveLate = resolve; });
    }
  }
});
const lateRequest = lateFacade.requestCamera();
lateFacade.destroy();
resolveLate(/** @type {MediaStream} */ (/** @type {unknown} */ (late.stream)));
const lateResult = await lateRequest;
assert.equal(lateResult.status, "stale");
assert.equal(late.track.stopped, true);
assert.equal(lateFacade.getRetainedCameraStream(), undefined);

// A late play resolution cannot resurrect a destroyed generation.
const latePlayFacade = createBrowserVideoMediaFacade();
const latePlayElement = createFakeVideoElement();
/** @type {() => void} */ let resolvePlay = () => {};
latePlayElement.play = () => new Promise((resolve) => { resolvePlay = resolve; });
latePlayFacade.attachVideoSource(
  /** @type {HTMLVideoElement} */ (/** @type {unknown} */ (latePlayElement)),
  background
);
const pendingPlay = latePlayFacade.play(
  /** @type {HTMLVideoElement} */ (/** @type {unknown} */ (latePlayElement))
);
latePlayFacade.destroy();
resolvePlay();
assert.equal((await pendingPlay).lifecycleState, "destroyed");
assert.equal(latePlayFacade.describeSurface().playbackState, "destroyed");

// Abort before a camera request prevents the browser request.
let abortRequestCount = 0;
const abortedFacade = createBrowserVideoMediaFacade({
  mediaDevices: {
    async enumerateDevices() { return []; },
    async getUserMedia() { abortRequestCount += 1; return /** @type {MediaStream} */ (/** @type {unknown} */ (createFakeStream().stream)); }
  }
});
const controller = new AbortController();
controller.abort();
assert.equal((await abortedFacade.requestCamera(undefined, { signal: controller.signal })).status, "stale");
assert.equal(abortRequestCount, 0);

// CORS/readability state distinguishes cosmetic and sampled sources.
const mediaElement = createFakeVideoElement();
const mediaFacade = createBrowserVideoMediaFacade();
mediaFacade.attachVideoSource(
  /** @type {HTMLVideoElement} */ (/** @type {unknown} */ (mediaElement)),
  background
);
assert.equal(mediaFacade.describeStatus().readabilityState, "not-required");
mediaFacade.attachVideoSource(
  /** @type {HTMLVideoElement} */ (/** @type {unknown} */ (mediaElement)),
  sampled
);
assert.equal(mediaElement.crossOrigin, "anonymous");
assert.equal(mediaFacade.describeStatus().readabilityState, "unknown");
mediaFacade.reportSourceReadability(false, "missing ACAO");
assert.equal(mediaFacade.describeStatus().readabilityState, "blocked");
assert.equal(mediaFacade.describeStatus().lastError?.code, "sampled_media_unreadable");

// Blob URLs are facade-owned and revoked on detach.
/** @type {string[]} */ const revoked = [];
const blobFacade = createBrowserVideoMediaFacade({
  objectUrlApi: {
    createObjectURL() { return "blob:aero-test"; },
    revokeObjectURL(url) { revoked.push(url); }
  }
});
const blobElement = createFakeVideoElement();
blobFacade.attachVideoBlob(
  /** @type {HTMLVideoElement} */ (/** @type {unknown} */ (blobElement)),
  new Blob(["test"], { type: "video/webm" }),
  { sourceId: "local-blob", readabilityRequirement: "sampled-media" }
);
assert.equal(blobElement.src, "blob:aero-test");
blobFacade.clearVideoElement();
assert.deepEqual(revoked, ["blob:aero-test"]);

// Cross-kind replacement revokes facade-owned URLs and stops only facade-owned streams.
const replacementRevoked = [];
const replacementFacade = createBrowserVideoMediaFacade({
  objectUrlApi: {
    createObjectURL() { return "blob:replacement"; },
    revokeObjectURL(url) { replacementRevoked.push(url); }
  }
});
const replacementElement = createFakeVideoElement();
replacementFacade.attachVideoBlob(
  /** @type {HTMLVideoElement} */ (/** @type {unknown} */ (replacementElement)),
  new Blob(["replacement"]),
  { sourceId: "replacement-blob" }
);
const replacementCamera = createFakeStream();
replacementFacade.attachCameraStream(
  /** @type {HTMLVideoElement} */ (/** @type {unknown} */ (replacementElement)),
  /** @type {MediaStream} */ (/** @type {unknown} */ (replacementCamera.stream)),
  { ownership: "facade-owned", source: createLiveCameraSourceDescriptor({ sourceId: "replacement-camera" }) }
);
assert.deepEqual(replacementRevoked, ["blob:replacement"]);
assert.equal(replacementElement.src, "");
assert.equal(replacementElement.srcObject, replacementCamera.stream);
replacementFacade.injectCameraStream(
  /** @type {MediaStream} */ (/** @type {unknown} */ (replacementCamera.stream))
);
assert.equal(replacementCamera.track.stopCalls, 0, "re-injecting the retained stream must not stop it");
replacementFacade.attachVideoSource(
  /** @type {HTMLVideoElement} */ (/** @type {unknown} */ (replacementElement)),
  background
);
assert.equal(replacementCamera.track.stopCalls, 1, "leaving an owned camera must stop it exactly once");
assert.equal(replacementFacade.getRetainedCameraStream(), undefined);

const hostReplacementFacade = createBrowserVideoMediaFacade();
const hostReplacementElement = createFakeVideoElement();
const hostReplacement = createFakeStream();
hostReplacementFacade.attachCameraStream(
  /** @type {HTMLVideoElement} */ (/** @type {unknown} */ (hostReplacementElement)),
  /** @type {MediaStream} */ (/** @type {unknown} */ (hostReplacement.stream))
);
hostReplacementFacade.attachVideoSource(
  /** @type {HTMLVideoElement} */ (/** @type {unknown} */ (hostReplacementElement)),
  background
);
assert.equal(hostReplacement.track.stopCalls, 0, "leaving a host-owned camera must not stop it");
assert.equal(hostReplacementFacade.getRetainedCameraStream(), undefined);

// Rebinding to another element clears the old element and all of its listeners.
const rebindFacade = createBrowserVideoMediaFacade();
const rebindStream = createFakeStream();
const oldElement = createFakeVideoElement();
const newElement = createFakeVideoElement();
rebindFacade.injectCameraStream(/** @type {MediaStream} */ (/** @type {unknown} */ (rebindStream.stream)));
rebindFacade.attachCameraStream(/** @type {HTMLVideoElement} */ (/** @type {unknown} */ (oldElement)));
rebindFacade.attachCameraStream(/** @type {HTMLVideoElement} */ (/** @type {unknown} */ (newElement)));
assert.equal(oldElement.srcObject, null);
assert.equal(oldElement.listenerCount(), 0);
assert.equal(newElement.srcObject, rebindStream.stream);

// Explicit pause, visibility, lease, and source replacement all beat a late play completion.
/** @param {(facade: import("../src/browser-video-facade.js").BrowserVideoMediaFacade, element: FakeVideoElement) => void} cancel */
async function assertLatePlayCancelled(cancel) {
  const raceFacade = createBrowserVideoMediaFacade();
  const raceElement = createFakeVideoElement();
  /** @type {() => void} */ let resolveRacePlay = () => {};
  raceElement.play = () => new Promise((resolve) => { resolveRacePlay = resolve; });
  raceFacade.attachVideoSource(
    /** @type {HTMLVideoElement} */ (/** @type {unknown} */ (raceElement)),
    background
  );
  const racePlay = raceFacade.play(/** @type {HTMLVideoElement} */ (/** @type {unknown} */ (raceElement)));
  cancel(raceFacade, raceElement);
  resolveRacePlay();
  await racePlay;
  assert.notEqual(raceFacade.describeSurface().playbackState, "playing");
}
await assertLatePlayCancelled((raceFacade) => { raceFacade.pause(); });
await assertLatePlayCancelled((raceFacade) => { raceFacade.setDocumentHidden(true); });
await assertLatePlayCancelled((raceFacade) => { raceFacade.pauseForLease(); });
await assertLatePlayCancelled((raceFacade) => {
  raceFacade.attachVideoSource(
    /** @type {HTMLVideoElement} */ (/** @type {unknown} */ (createFakeVideoElement())),
    createLoadedVideoSourceDescriptor({ url: "https://assets.example/replacement.mp4", sourceId: "race-replacement" })
  );
});

console.log("Video lifecycle, ownership, visibility, lease, CORS, and teardown validation passed.");
