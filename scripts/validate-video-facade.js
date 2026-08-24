// @ts-check

import assert from "node:assert/strict";

import {
  aeroVideoMediaServiceId,
  createBrowserVideoMediaFacade,
  createLiveCameraSourceDescriptor,
  createLoadedVideoSourceDescriptor,
  createReplayVideoFeedSourceDescriptor
} from "../src/index.js";

/**
 * @typedef {object} FakeTrack
 * @property {boolean} stopped Whether stop was called.
 * @property {() => void} stop Stops the fake track.
 */

/**
 * @typedef {object} FakeStream
 * @property {() => FakeTrack[]} getTracks Reads fake media tracks.
 */

/**
 * @typedef {object} FakeVideoElement
 * @property {FakeStream | null} srcObject Attached stream.
 * @property {string} src Attached source URL.
 * @property {boolean} muted Muted state.
 * @property {boolean} playsInline Inline playback state.
 * @property {boolean} loop Loop state.
 * @property {boolean} autoplay Autoplay state.
 * @property {number} currentTime Current playback position.
 * @property {number} duration Duration.
 * @property {number} videoWidth Intrinsic width.
 * @property {number} videoHeight Intrinsic height.
 * @property {() => Promise<void>} play Starts fake playback.
 * @property {() => void} pause Pauses fake playback.
 * @property {(name: string) => void} removeAttribute Removes a fake attribute.
 * @property {() => void} load Reloads fake media.
 */

const liveSource = createLiveCameraSourceDescriptor({ sourceId: "camera-1" });
assert.equal(liveSource.kind, "live-camera");
assert.equal(liveSource.mirrored, true);

const loadedVideo = createLoadedVideoSourceDescriptor({
  url: "/fixtures/warmup.mp4",
  mediaType: "video/mp4",
  startTimeSeconds: 3
});
assert.equal(loadedVideo.kind, "loaded-video");
assert.equal(loadedVideo.startTimeSeconds, 3);

const replayFeed = createReplayVideoFeedSourceDescriptor({
  url: "/fixtures/replay.webm",
  frameRate: 30
});
assert.equal(replayFeed.kind, "replay-video-feed");
assert.equal(replayFeed.muted, true);

/** @type {FakeTrack} */
const fakeTrack = {
  stopped: false,
  stop() {
    this.stopped = true;
  }
};
/** @type {FakeStream} */
const fakeStream = {
  getTracks() {
    return [fakeTrack];
  }
};

const facade = createBrowserVideoMediaFacade({
  mediaDevices: {
    async getUserMedia(constraints) {
      assert.deepEqual(constraints, liveSource.constraints);
      return fakeStream;
    }
  }
});

const request = await facade.requestCamera(liveSource);
assert.equal(request.status, "granted");
assert.equal(request.stream, fakeStream);
assert.equal(facade.getRetainedCameraStream(), fakeStream);

/** @type {FakeVideoElement} */
const videoElement = {
  srcObject: null,
  src: "",
  muted: false,
  playsInline: false,
  loop: false,
  autoplay: false,
  currentTime: 0,
  duration: 12,
  videoWidth: 1280,
  videoHeight: 720,
  async play() {},
  pause() {},
  removeAttribute(name) {
    if (name === "src") {
      this.src = "";
    }
  },
  load() {}
};

const cameraSurface = facade.attachCameraStream(
  /** @type {HTMLVideoElement} */ (/** @type {unknown} */ (videoElement))
);
assert.equal(cameraSurface.serviceId, aeroVideoMediaServiceId);
assert.equal(cameraSurface.sourceKind, "live-camera");
assert.equal(cameraSurface.hasRetainedStream, true);
assert.equal(videoElement.srcObject, fakeStream);

const replaySurface = facade.attachVideoSource(
  /** @type {HTMLVideoElement} */ (/** @type {unknown} */ (videoElement)),
  replayFeed
);
assert.equal(replaySurface.sourceKind, "replay-video-feed");
assert.equal(replaySurface.currentTimeSeconds, 0);
assert.equal(videoElement.src, "/fixtures/replay.webm");

const playSurface = await facade.play(
  /** @type {HTMLVideoElement} */ (/** @type {unknown} */ (videoElement))
);
assert.equal(playSurface.playbackState, "playing");

const seekSurface = facade.seek(
  /** @type {HTMLVideoElement} */ (/** @type {unknown} */ (videoElement)),
  7
);
assert.equal(seekSurface.currentTimeSeconds, 7);

facade.teardownCameraStream();
assert.equal(fakeTrack.stopped, true);
assert.equal(facade.getRetainedCameraStream(), undefined);

console.log("Video facade validation passed.");
