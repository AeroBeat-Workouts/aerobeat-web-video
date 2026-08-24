// @ts-check

import { createLiveCameraSourceDescriptor } from "./source-descriptors.js";

/**
 * AeroBeat-owned video/media lifecycle service ID.
 *
 * @type {"aero.video.media"}
 */
export const aeroVideoMediaServiceId = "aero.video.media";

/**
 * Browser media lifecycle states reported by the facade.
 *
 * @typedef {"idle" | "loading" | "ready" | "playing" | "paused" | "ended" | "error"} AeroVideoPlaybackState
 */

/**
 * @typedef {import("./source-descriptors.js").AeroVideoFitMode} AeroVideoFitMode
 * @typedef {import("./source-descriptors.js").AeroVideoSourceKind} AeroVideoSourceKind
 * @typedef {import("./source-descriptors.js").LiveCameraSourceDescriptor} LiveCameraSourceDescriptor
 * @typedef {import("./source-descriptors.js").LoadedVideoSourceDescriptor} LoadedVideoSourceDescriptor
 * @typedef {import("./source-descriptors.js").ReplayVideoFeedSourceDescriptor} ReplayVideoFeedSourceDescriptor
 */

/**
 * @typedef {LoadedVideoSourceDescriptor | ReplayVideoFeedSourceDescriptor} BrowserLoadedVideoDescriptor
 */

/**
 * Camera permission/request result returned through the AeroBeat facade.
 *
 * @typedef {object} AeroCameraRequestResult
 * @property {"granted" | "unsupported" | "blocked"} status Permission result.
 * @property {LiveCameraSourceDescriptor} source Source descriptor used for the request.
 * @property {MediaStream | undefined} stream Retained stream when permission is granted.
 * @property {string | undefined} errorName Browser error name when blocked.
 * @property {string} message Browser-facing diagnostic message.
 */

/**
 * Public camera input descriptor normalized from `MediaDeviceInfo`.
 *
 * @typedef {object} AeroCameraDeviceDescriptor
 * @property {string} deviceId Browser media device ID.
 * @property {string} label Browser-provided or fallback display label.
 * @property {string | undefined} groupId Browser media device group ID.
 */

/**
 * A snapshot of media surface state for downstream CV, UI, or assembly code.
 *
 * @typedef {object} AeroVideoSurfaceDescriptor
 * @property {"aero.video.media"} serviceId Stable service ID.
 * @property {AeroVideoSourceKind | undefined} sourceKind Current source kind.
 * @property {string | undefined} sourceId Current source identifier.
 * @property {AeroVideoPlaybackState} playbackState Current playback state.
 * @property {AeroVideoFitMode} fitMode Presentation fit metadata.
 * @property {boolean} mirrored Whether consumers should mirror the surface.
 * @property {boolean} hasElement Whether a video element is currently attached.
 * @property {boolean} hasRetainedStream Whether the facade currently retains a camera stream.
 * @property {number | undefined} intrinsicWidth Current video intrinsic width when known.
 * @property {number | undefined} intrinsicHeight Current video intrinsic height when known.
 * @property {number | undefined} durationSeconds Current media duration when known.
 * @property {number} currentTimeSeconds Current playback position.
 */

/**
 * @typedef {object} BrowserVideoMediaFacadeOptions
 * @property {MediaDevices | undefined} mediaDevices Optional media-devices adapter for tests or future backends.
 */

/**
 * @typedef {object} AttachStreamOptions
 * @property {LiveCameraSourceDescriptor | undefined} source Live source metadata to bind with the stream.
 */

/**
 * @typedef {object} BrowserVideoMediaFacade
 * @property {"aero.video.media"} serviceId Stable service ID.
 * @property {readonly AeroVideoSourceKind[]} supportedSources Supported video source kinds.
 * @property {() => MediaStream | undefined} getRetainedCameraStream Reads the retained camera stream.
 * @property {() => Promise<readonly AeroCameraDeviceDescriptor[]>} listCameraDevices Lists available videoinput devices when the browser exposes them.
 * @property {(source?: LiveCameraSourceDescriptor) => Promise<AeroCameraRequestResult>} requestCamera Requests camera permission and retains the granted stream.
 * @property {(videoElement: HTMLVideoElement, stream?: MediaStream, options?: AttachStreamOptions) => AeroVideoSurfaceDescriptor} attachCameraStream Attaches the retained or supplied stream to a video element.
 * @property {(videoElement: HTMLVideoElement, source: BrowserLoadedVideoDescriptor) => AeroVideoSurfaceDescriptor} attachVideoSource Attaches a browser-loaded video or replay source to a video element.
 * @property {(videoElement: HTMLVideoElement) => Promise<AeroVideoSurfaceDescriptor>} play Starts playback for an attached element.
 * @property {(videoElement: HTMLVideoElement) => AeroVideoSurfaceDescriptor} pause Pauses playback for an attached element.
 * @property {(videoElement: HTMLVideoElement, timeSeconds: number) => AeroVideoSurfaceDescriptor} seek Sets playback position.
 * @property {(videoElement?: HTMLVideoElement) => AeroVideoSurfaceDescriptor} describeSurface Describes current facade and element state.
 * @property {() => void} teardownCameraStream Stops and releases retained camera tracks.
 * @property {(videoElement: HTMLVideoElement) => AeroVideoSurfaceDescriptor} clearVideoElement Clears stream/source ownership from an element.
 */

/**
 * Creates the browser-native media facade. Future vendor/player backends should
 * adapt behind this AeroBeat-owned boundary instead of leaking native objects.
 *
 * @param {BrowserVideoMediaFacadeOptions} [options]
 * @returns {BrowserVideoMediaFacade}
 */
export function createBrowserVideoMediaFacade(options = {}) {
  const mediaDevices = options.mediaDevices ?? globalThis.navigator?.mediaDevices;
  /** @type {MediaStream | undefined} */
  let retainedCameraStream;
  /** @type {LiveCameraSourceDescriptor | BrowserLoadedVideoDescriptor | undefined} */
  let currentSource;
  /** @type {AeroVideoPlaybackState} */
  let playbackState = "idle";
  /** @type {HTMLVideoElement | undefined} */
  let attachedElement;

  return {
    serviceId: aeroVideoMediaServiceId,
    supportedSources: ["live-camera", "loaded-video", "replay-video-feed"],
    getRetainedCameraStream() {
      return retainedCameraStream;
    },
    async listCameraDevices() {
      if (!mediaDevices?.enumerateDevices) {
        return [];
      }
      const devices = await mediaDevices.enumerateDevices();
      return devices
        .filter((device) => device.kind === "videoinput" && device.deviceId)
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${index + 1}`,
          groupId: device.groupId || undefined
        }));
    },
    async requestCamera(source = createLiveCameraSourceDescriptor()) {
      if (!mediaDevices?.getUserMedia) {
        playbackState = "error";
        currentSource = source;
        return {
          status: "unsupported",
          source,
          stream: undefined,
          errorName: undefined,
          message: "Camera API unavailable in this browser context"
        };
      }

      try {
        const stream = await mediaDevices.getUserMedia(source.constraints);
        retainedCameraStream = stream;
        currentSource = source;
        playbackState = "ready";
        return {
          status: "granted",
          source,
          stream,
          errorName: undefined,
          message: "Camera permission granted"
        };
      } catch (error) {
        playbackState = "error";
        currentSource = source;
        return {
          status: "blocked",
          source,
          stream: undefined,
          errorName: readErrorField(error, "name") ?? "CameraRequestError",
          message: readErrorField(error, "message") ?? "Camera permission request failed"
        };
      }
    },
    attachCameraStream(videoElement, stream = retainedCameraStream, options = {}) {
      if (!stream) {
        playbackState = "error";
        currentSource = options.source ?? createLiveCameraSourceDescriptor();
        return describeVideoSurface(videoElement, currentSource, playbackState, retainedCameraStream);
      }

      retainedCameraStream = stream;
      currentSource = options.source ?? createLiveCameraSourceDescriptor();
      attachedElement = videoElement;
      videoElement.srcObject = stream;
      videoElement.muted = true;
      videoElement.playsInline = true;
      playbackState = "ready";
      return describeVideoSurface(videoElement, currentSource, playbackState, retainedCameraStream);
    },
    attachVideoSource(videoElement, source) {
      currentSource = source;
      attachedElement = videoElement;
      playbackState = "loading";
      videoElement.srcObject = null;
      videoElement.src = source.url;
      videoElement.loop = source.loop;
      videoElement.autoplay = source.autoplay;
      videoElement.muted = source.muted;
      videoElement.currentTime = source.startTimeSeconds;
      playbackState = "ready";
      return describeVideoSurface(videoElement, currentSource, playbackState, retainedCameraStream);
    },
    async play(videoElement) {
      attachedElement = videoElement;
      await videoElement.play();
      playbackState = "playing";
      return describeVideoSurface(videoElement, currentSource, playbackState, retainedCameraStream);
    },
    pause(videoElement) {
      attachedElement = videoElement;
      videoElement.pause();
      playbackState = "paused";
      return describeVideoSurface(videoElement, currentSource, playbackState, retainedCameraStream);
    },
    seek(videoElement, timeSeconds) {
      attachedElement = videoElement;
      videoElement.currentTime = timeSeconds;
      return describeVideoSurface(videoElement, currentSource, playbackState, retainedCameraStream);
    },
    describeSurface(videoElement = attachedElement) {
      return describeVideoSurface(videoElement, currentSource, playbackState, retainedCameraStream);
    },
    teardownCameraStream() {
      retainedCameraStream?.getTracks().forEach((track) => track.stop());
      retainedCameraStream = undefined;
      if (currentSource?.kind === "live-camera") {
        playbackState = "idle";
      }
    },
    clearVideoElement(videoElement) {
      if (videoElement.srcObject) {
        videoElement.srcObject = null;
      }
      videoElement.removeAttribute("src");
      videoElement.load();
      if (attachedElement === videoElement) {
        attachedElement = undefined;
      }
      playbackState = retainedCameraStream ? "ready" : "idle";
      return describeVideoSurface(undefined, currentSource, playbackState, retainedCameraStream);
    }
  };
}

/**
 * @param {HTMLVideoElement | undefined} videoElement
 * @param {LiveCameraSourceDescriptor | BrowserLoadedVideoDescriptor | undefined} source
 * @param {AeroVideoPlaybackState} playbackState
 * @param {MediaStream | undefined} retainedCameraStream
 * @returns {AeroVideoSurfaceDescriptor}
 */
function describeVideoSurface(videoElement, source, playbackState, retainedCameraStream) {
  return {
    serviceId: aeroVideoMediaServiceId,
    sourceKind: source?.kind,
    sourceId: source?.sourceId,
    playbackState,
    fitMode: source?.fitMode ?? "contain",
    mirrored: source?.mirrored ?? false,
    hasElement: Boolean(videoElement),
    hasRetainedStream: Boolean(retainedCameraStream),
    intrinsicWidth: positiveNumberOrUndefined(videoElement?.videoWidth),
    intrinsicHeight: positiveNumberOrUndefined(videoElement?.videoHeight),
    durationSeconds: finiteNumberOrUndefined(videoElement?.duration),
    currentTimeSeconds: finiteNumberOrZero(videoElement?.currentTime)
  };
}

/**
 * @param {number | undefined} value
 * @returns {number | undefined}
 */
function positiveNumberOrUndefined(value) {
  return typeof value === "number" && value > 0 ? value : undefined;
}

/**
 * @param {number | undefined} value
 * @returns {number | undefined}
 */
function finiteNumberOrUndefined(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/**
 * @param {number | undefined} value
 * @returns {number}
 */
function finiteNumberOrZero(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/**
 * @param {unknown} value
 * @param {"name" | "message"} field
 * @returns {string | undefined}
 */
function readErrorField(value, field) {
  if (value && typeof value === "object" && field in value) {
    const fieldValue = value[field];
    return typeof fieldValue === "string" ? fieldValue : undefined;
  }
  return undefined;
}
