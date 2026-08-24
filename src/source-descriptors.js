// @ts-check

/**
 * Browser media source kinds owned by the AeroBeat video facade.
 *
 * @typedef {"live-camera" | "loaded-video" | "replay-video-feed"} AeroVideoSourceKind
 */

/**
 * How the media should fit its presentation surface.
 *
 * @typedef {"stretch" | "contain" | "cover"} AeroVideoFitMode
 */

/**
 * Shared descriptor fields for every video source.
 *
 * @typedef {object} AeroVideoSourceBase
 * @property {AeroVideoSourceKind} kind Source kind.
 * @property {string} sourceId Stable source identifier for diagnostics and downstream metadata.
 * @property {AeroVideoFitMode} fitMode Presentation fit metadata.
 * @property {boolean} mirrored Whether consumers should mirror the surface.
 */

/**
 * Live camera source request metadata.
 *
 * @typedef {AeroVideoSourceBase & {
 *   kind: "live-camera",
 *   constraints: MediaStreamConstraints
 * }} LiveCameraSourceDescriptor
 */

/**
 * Browser-loaded video file or URL metadata.
 *
 * @typedef {AeroVideoSourceBase & {
 *   kind: "loaded-video",
 *   url: string,
 *   mediaType: string | undefined,
 *   loop: boolean,
 *   autoplay: boolean,
 *   muted: boolean,
 *   startTimeSeconds: number
 * }} LoadedVideoSourceDescriptor
 */

/**
 * Replay video feed metadata. The replay source stays video lifecycle only;
 * pose truth, input routing, and inference belong to later CV/input seams.
 *
 * @typedef {AeroVideoSourceBase & {
 *   kind: "replay-video-feed",
 *   url: string,
 *   frameRate: number | undefined,
 *   loop: boolean,
 *   autoplay: boolean,
 *   muted: boolean,
 *   startTimeSeconds: number
 * }} ReplayVideoFeedSourceDescriptor
 */

/**
 * @typedef {object} LiveCameraSourceDescriptorOptions
 * @property {string | undefined} sourceId Stable source identifier.
 * @property {MediaStreamConstraints | undefined} constraints Browser camera constraints.
 * @property {AeroVideoFitMode | undefined} fitMode Presentation fit metadata.
 * @property {boolean | undefined} mirrored Whether consumers should mirror the surface.
 */

/**
 * @typedef {object} LoadedVideoSourceDescriptorOptions
 * @property {string} url Browser-loadable video URL.
 * @property {string | undefined} sourceId Stable source identifier.
 * @property {string | undefined} mediaType Optional MIME type hint.
 * @property {AeroVideoFitMode | undefined} fitMode Presentation fit metadata.
 * @property {boolean | undefined} mirrored Whether consumers should mirror the surface.
 * @property {boolean | undefined} loop Whether playback should loop.
 * @property {boolean | undefined} autoplay Whether playback should begin after loading.
 * @property {boolean | undefined} muted Whether the element should be muted.
 * @property {number | undefined} startTimeSeconds Initial playback position.
 */

/**
 * @typedef {object} ReplayVideoFeedSourceDescriptorOptions
 * @property {string} url Browser-loadable replay video URL.
 * @property {string | undefined} sourceId Stable source identifier.
 * @property {number | undefined} frameRate Optional replay frame-rate metadata.
 * @property {AeroVideoFitMode | undefined} fitMode Presentation fit metadata.
 * @property {boolean | undefined} mirrored Whether consumers should mirror the surface.
 * @property {boolean | undefined} loop Whether playback should loop.
 * @property {boolean | undefined} autoplay Whether playback should begin after loading.
 * @property {boolean | undefined} muted Whether the element should be muted.
 * @property {number | undefined} startTimeSeconds Initial playback position.
 */

/**
 * Creates default live-camera constraints for the product-facing camera path.
 *
 * @returns {MediaStreamConstraints}
 */
export function defaultLiveCameraConstraints() {
  return {
    audio: false,
    video: {
      facingMode: "user"
    }
  };
}

/**
 * Describes a live camera source before a browser permission request.
 *
 * @param {LiveCameraSourceDescriptorOptions} [options]
 * @returns {LiveCameraSourceDescriptor}
 */
export function createLiveCameraSourceDescriptor(options = {}) {
  return {
    kind: "live-camera",
    sourceId: options.sourceId ?? "aero.video.live-camera",
    constraints: options.constraints ?? defaultLiveCameraConstraints(),
    fitMode: options.fitMode ?? "contain",
    mirrored: options.mirrored ?? true
  };
}

/**
 * Describes a browser-loaded video source.
 *
 * @param {LoadedVideoSourceDescriptorOptions} options
 * @returns {LoadedVideoSourceDescriptor}
 */
export function createLoadedVideoSourceDescriptor(options) {
  return {
    kind: "loaded-video",
    sourceId: options.sourceId ?? "aero.video.loaded-video",
    url: options.url,
    mediaType: options.mediaType,
    fitMode: options.fitMode ?? "contain",
    mirrored: options.mirrored ?? false,
    loop: options.loop ?? false,
    autoplay: options.autoplay ?? false,
    muted: options.muted ?? false,
    startTimeSeconds: options.startTimeSeconds ?? 0
  };
}

/**
 * Describes a replay feed backed by a browser-loaded video.
 *
 * @param {ReplayVideoFeedSourceDescriptorOptions} options
 * @returns {ReplayVideoFeedSourceDescriptor}
 */
export function createReplayVideoFeedSourceDescriptor(options) {
  return {
    kind: "replay-video-feed",
    sourceId: options.sourceId ?? "aero.video.replay-feed",
    url: options.url,
    frameRate: options.frameRate,
    fitMode: options.fitMode ?? "contain",
    mirrored: options.mirrored ?? false,
    loop: options.loop ?? false,
    autoplay: options.autoplay ?? false,
    muted: options.muted ?? true,
    startTimeSeconds: options.startTimeSeconds ?? 0
  };
}
