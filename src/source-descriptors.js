// @ts-check

/** @typedef {"live-camera" | "loaded-video" | "replay-video-feed"} AeroVideoSourceKind */
/** @typedef {"stretch" | "contain" | "cover"} AeroVideoFitMode */
/** @typedef {"background-only" | "sampled-media"} AeroVideoReadabilityRequirement */
/** @typedef {"anonymous" | "use-credentials" | undefined} AeroVideoCrossOriginMode */

/**
 * Shared descriptor fields for every video source.
 *
 * @typedef {object} AeroVideoSourceBase
 * @property {AeroVideoSourceKind} kind Source kind.
 * @property {string} sourceId Stable source identifier for diagnostics and calibration invalidation.
 * @property {AeroVideoFitMode} fitMode Presentation fit metadata.
 * @property {boolean} mirrored Whether consumers should mirror the surface.
 */

/**
 * @typedef {AeroVideoSourceBase & {
 *   kind: "live-camera",
 *   constraints: MediaStreamConstraints
 * }} LiveCameraSourceDescriptor
 */

/**
 * @typedef {AeroVideoSourceBase & {
 *   kind: "loaded-video",
 *   url: string,
 *   mediaType: string | undefined,
 *   loop: boolean,
 *   autoplay: boolean,
 *   muted: boolean,
 *   startTimeSeconds: number,
 *   readabilityRequirement: AeroVideoReadabilityRequirement,
 *   crossOrigin: AeroVideoCrossOriginMode,
 *   objectUrlOwned: boolean
 * }} LoadedVideoSourceDescriptor
 */

/**
 * @typedef {AeroVideoSourceBase & {
 *   kind: "replay-video-feed",
 *   url: string,
 *   frameRate: number | undefined,
 *   loop: boolean,
 *   autoplay: boolean,
 *   muted: boolean,
 *   startTimeSeconds: number,
 *   readabilityRequirement: "sampled-media",
 *   crossOrigin: AeroVideoCrossOriginMode,
 *   objectUrlOwned: boolean
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
 * @property {AeroVideoReadabilityRequirement | undefined} readabilityRequirement Whether the source is cosmetic-only or must remain sample-readable.
 * @property {AeroVideoCrossOriginMode} crossOrigin Browser media CORS mode.
 * @property {boolean | undefined} objectUrlOwned Whether the facade must revoke this object URL on release.
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
 * @property {AeroVideoCrossOriginMode} crossOrigin Browser media CORS mode.
 * @property {boolean | undefined} objectUrlOwned Whether the facade must revoke this object URL on release.
 */

/** @returns {MediaStreamConstraints} */
export function defaultLiveCameraConstraints() {
  return { audio: false, video: { facingMode: "user" } };
}

/**
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
 * @param {LoadedVideoSourceDescriptorOptions} options
 * @returns {LoadedVideoSourceDescriptor}
 */
export function createLoadedVideoSourceDescriptor(options) {
  const readabilityRequirement = options.readabilityRequirement ?? "background-only";
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
    startTimeSeconds: finiteNonNegative(options.startTimeSeconds),
    readabilityRequirement,
    crossOrigin: options.crossOrigin ?? (readabilityRequirement === "sampled-media" ? "anonymous" : undefined),
    objectUrlOwned: options.objectUrlOwned ?? false
  };
}

/**
 * @param {ReplayVideoFeedSourceDescriptorOptions} options
 * @returns {ReplayVideoFeedSourceDescriptor}
 */
export function createReplayVideoFeedSourceDescriptor(options) {
  return {
    kind: "replay-video-feed",
    sourceId: options.sourceId ?? "aero.video.replay-feed",
    url: options.url,
    frameRate: positiveFinite(options.frameRate),
    fitMode: options.fitMode ?? "contain",
    mirrored: options.mirrored ?? false,
    loop: options.loop ?? false,
    autoplay: options.autoplay ?? false,
    muted: options.muted ?? true,
    startTimeSeconds: finiteNonNegative(options.startTimeSeconds),
    readabilityRequirement: "sampled-media",
    crossOrigin: options.crossOrigin ?? "anonymous",
    objectUrlOwned: options.objectUrlOwned ?? false
  };
}

/** @param {number | undefined} value @returns {number} */
function finiteNonNegative(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
}

/** @param {number | undefined} value @returns {number | undefined} */
function positiveFinite(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
}
