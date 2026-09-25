// @ts-check

import {
  createLiveCameraSourceDescriptor,
  createLoadedVideoSourceDescriptor
} from "./source-descriptors.js";

/** @type {"aero.video.media"} */
export const aeroVideoMediaServiceId = "aero.video.media";

/** @typedef {"idle" | "loading" | "ready" | "playing" | "paused" | "ended" | "error" | "destroyed"} AeroVideoPlaybackState */
/** @typedef {"connected" | "destroyed"} AeroVideoLifecycleState */
/** @typedef {"inactive" | "active" | "paused" | "released"} AeroVideoLeaseState */
/** @typedef {"facade-owned" | "host-owned" | "none"} AeroMediaStreamOwnership */
/** @typedef {"not-required" | "unknown" | "readable" | "blocked"} AeroVideoReadabilityState */
/** @typedef {import("./source-descriptors.js").AeroVideoFitMode} AeroVideoFitMode */
/** @typedef {import("./source-descriptors.js").AeroVideoSourceKind} AeroVideoSourceKind */
/** @typedef {import("./source-descriptors.js").LiveCameraSourceDescriptor} LiveCameraSourceDescriptor */
/** @typedef {import("./source-descriptors.js").LoadedVideoSourceDescriptor} LoadedVideoSourceDescriptor */
/** @typedef {import("./source-descriptors.js").ReplayVideoFeedSourceDescriptor} ReplayVideoFeedSourceDescriptor */
/** @typedef {LoadedVideoSourceDescriptor | ReplayVideoFeedSourceDescriptor} BrowserLoadedVideoDescriptor */

/**
 * @typedef {object} AeroVideoErrorSnapshot
 * @property {string} code Stable AeroBeat error code.
 * @property {string} name Browser or adapter error name.
 * @property {string} message Human-readable diagnostic.
 */

/**
 * @typedef {object} AeroVideoCapabilities
 * @property {boolean} cameraRequest Camera requests are available.
 * @property {true} injectedStreams Host streams can be injected.
 * @property {true} loadedVideo Browser video sources are supported.
 * @property {true} visibilityPause Visibility pause hooks are supported.
 * @property {true} leaseLifecycle Lease lifecycle hooks are supported.
 * @property {true} corsReadabilityReporting Sample readability can be reported truthfully.
 * @property {boolean} objectUrls Blob object URLs can be created and revoked.
 */

/**
 * @typedef {object} AeroCameraRequestResult
 * @property {"granted" | "unsupported" | "blocked" | "stale"} status Permission result.
 * @property {LiveCameraSourceDescriptor} source Source descriptor used for the request.
 * @property {MediaStream | undefined} stream Retained stream only when permission is granted.
 * @property {string | undefined} errorName Browser error name when blocked.
 * @property {string} message Diagnostic message.
 * @property {number} generation Lifecycle generation that produced the result.
 */

/**
 * @typedef {object} AeroCameraDeviceDescriptor
 * @property {string} deviceId Browser media device ID.
 * @property {string} label Browser-provided or fallback display label.
 * @property {string | undefined} groupId Browser media device group ID.
 */

/**
 * @typedef {object} AeroVideoStatusSnapshot
 * @property {"aero.video.media"} serviceId Stable service ID.
 * @property {AeroVideoLifecycleState} lifecycleState Connection lifecycle.
 * @property {number} generation Lifecycle generation.
 * @property {AeroVideoLeaseState} leaseState Lease participation state.
 * @property {boolean} documentHidden Whether the owning document is hidden.
 * @property {boolean} inferencePaused Whether inference consumers must pause.
 * @property {boolean} gameplayPaused Whether gameplay consumers must pause.
 * @property {AeroMediaStreamOwnership} streamOwnership Current stream ownership.
 * @property {number} sourceChangeId Monotonic source/mirror/aspect identity generation.
 * @property {string | undefined} calibrationSourceIdentity Source identity used for calibration invalidation.
 * @property {AeroVideoReadabilityState} readabilityState Current sampled-media readability truth.
 * @property {string | undefined} readabilityReason Optional readability diagnostic.
 * @property {AeroVideoErrorSnapshot | undefined} lastError Last lifecycle error.
 * @property {AeroVideoCapabilities} capabilities Runtime capabilities.
 */

/**
 * @typedef {object} AeroVideoSurfaceDescriptor
 * @property {"aero.video.media"} serviceId Stable service ID.
 * @property {AeroVideoSourceKind | undefined} sourceKind Current source kind.
 * @property {string | undefined} sourceId Current source identifier.
 * @property {AeroVideoPlaybackState} playbackState Current playback state.
 * @property {AeroVideoFitMode} fitMode Presentation fit metadata.
 * @property {boolean} mirrored Whether consumers should mirror the surface.
 * @property {boolean} hasElement Whether a video element is attached.
 * @property {boolean} hasRetainedStream Whether a stream is retained.
 * @property {AeroMediaStreamOwnership} streamOwnership Current stream ownership.
 * @property {number | undefined} intrinsicWidth Current video intrinsic width.
 * @property {number | undefined} intrinsicHeight Current video intrinsic height.
 * @property {number | undefined} sourceAspectRatio Current intrinsic aspect ratio.
 * @property {number | undefined} durationSeconds Current media duration.
 * @property {number} currentTimeSeconds Current playback position.
 * @property {number} sourceChangeId Monotonic source/mirror/aspect identity generation.
 * @property {string | undefined} calibrationSourceIdentity Source identity used for calibration invalidation.
 * @property {AeroVideoReadabilityState} readabilityState Current sampled-media readability truth.
 * @property {AeroVideoLifecycleState} lifecycleState Connection lifecycle.
 * @property {AeroVideoLeaseState} leaseState Lease participation state.
 * @property {boolean} documentHidden Whether the owning document is hidden.
 */

/**
 * @typedef {object} AeroVisibilityDocument
 * @property {string | undefined} visibilityState Visibility state.
 * @property {(type: string, listener: () => void) => void} addEventListener Adds a listener.
 * @property {(type: string, listener: () => void) => void} removeEventListener Removes a listener.
 */

/**
 * @typedef {object} AeroObjectUrlApi
 * @property {(value: Blob) => string} createObjectURL Creates an object URL.
 * @property {(url: string) => void} revokeObjectURL Revokes an object URL.
 */

/**
 * @typedef {object} BrowserVideoMediaFacadeOptions
 * @property {MediaDevices | undefined} mediaDevices Optional media-devices adapter.
 * @property {AeroVisibilityDocument | undefined} document Optional visibility adapter.
 * @property {AeroObjectUrlApi | undefined} objectUrlApi Optional object-URL adapter.
 */

/**
 * @typedef {object} CameraRequestOptions
 * @property {AbortSignal | undefined} signal Consumer cancellation signal.
 */

/**
 * @typedef {object} InjectCameraStreamOptions
 * @property {LiveCameraSourceDescriptor | undefined} source Source metadata.
 * @property {"host-owned" | "facade-owned" | undefined} ownership Stream ownership. Host-owned is the safe default.
 */

/**
 * @typedef {object} AttachStreamOptions
 * @property {LiveCameraSourceDescriptor | undefined} source Source metadata.
 * @property {"host-owned" | "facade-owned" | undefined} ownership Ownership when the supplied stream is not already retained.
 */

/**
 * @typedef {object} BlobVideoSourceOptions
 * @property {string | undefined} sourceId Source identifier.
 * @property {string | undefined} mediaType MIME hint.
 * @property {AeroVideoFitMode | undefined} fitMode Fit mode.
 * @property {boolean | undefined} mirrored Mirror metadata.
 * @property {boolean | undefined} loop Loop playback.
 * @property {boolean | undefined} autoplay Autoplay playback.
 * @property {boolean | undefined} muted Mute playback.
 * @property {number | undefined} startTimeSeconds Start time.
 * @property {"background-only" | "sampled-media" | undefined} readabilityRequirement Readability requirement.
 */

/**
 * @typedef {object} LeaseReleaseOptions
 * @property {boolean | undefined} releaseStream Whether to release the retained stream. Defaults true.
 */

/**
 * @typedef {object} BrowserVideoMediaFacade
 * @property {"aero.video.media"} serviceId Stable service ID.
 * @property {readonly AeroVideoSourceKind[]} supportedSources Supported kinds.
 * @property {() => MediaStream | undefined} getRetainedCameraStream Reads the retained stream.
 * @property {() => Promise<readonly AeroCameraDeviceDescriptor[]>} listCameraDevices Lists cameras.
 * @property {(source?: LiveCameraSourceDescriptor, options?: CameraRequestOptions) => Promise<AeroCameraRequestResult>} requestCamera Requests an owned camera stream.
 * @property {(stream: MediaStream, options?: InjectCameraStreamOptions) => AeroVideoSurfaceDescriptor} injectCameraStream Retains a host or transferred stream without attaching a surface.
 * @property {(videoElement: HTMLVideoElement, stream?: MediaStream, options?: AttachStreamOptions) => AeroVideoSurfaceDescriptor} attachCameraStream Attaches a stream.
 * @property {(videoElement: HTMLVideoElement, source: BrowserLoadedVideoDescriptor) => AeroVideoSurfaceDescriptor} attachVideoSource Attaches a URL source.
 * @property {(videoElement: HTMLVideoElement, blob: Blob, options?: BlobVideoSourceOptions) => AeroVideoSurfaceDescriptor} attachVideoBlob Creates and owns an object URL source.
 * @property {(videoElement: HTMLVideoElement) => Promise<AeroVideoSurfaceDescriptor>} play Starts playback.
 * @property {(videoElement?: HTMLVideoElement) => AeroVideoSurfaceDescriptor} pause Pauses playback.
 * @property {(videoElement: HTMLVideoElement, timeSeconds: number) => AeroVideoSurfaceDescriptor} seek Seeks playback.
 * @property {(readable: boolean, reason?: string) => AeroVideoStatusSnapshot} reportSourceReadability Records sampled-media CORS/readback truth.
 * @property {(hidden: boolean) => AeroVideoStatusSnapshot} setDocumentHidden Applies visibility pause hooks while retaining camera.
 * @property {() => AeroVideoStatusSnapshot} activateLease Activates this instance's lease.
 * @property {() => AeroVideoStatusSnapshot} pauseForLease Pauses consumers while retaining resources.
 * @property {(options?: LeaseReleaseOptions) => AeroVideoStatusSnapshot} releaseLease Releases lease participation.
 * @property {(videoElement?: HTMLVideoElement) => AeroVideoSurfaceDescriptor} describeSurface Describes surface state.
 * @property {() => AeroVideoStatusSnapshot} describeStatus Describes lifecycle/capability state.
 * @property {() => void} teardownCameraStream Releases the retained stream and stops only facade-owned tracks.
 * @property {(videoElement?: HTMLVideoElement) => AeroVideoSurfaceDescriptor} clearVideoElement Detaches and cleans a surface.
 * @property {() => AeroVideoStatusSnapshot} destroy Destroys synchronously and idempotently.
 * @property {() => AeroVideoStatusSnapshot} reconnect Starts a fresh lifecycle generation after destroy.
 */

/**
 * @param {BrowserVideoMediaFacadeOptions} [options]
 * @returns {BrowserVideoMediaFacade}
 */
export function createBrowserVideoMediaFacade(options = {}) {
  const mediaDevices = options.mediaDevices ?? globalThis.navigator?.mediaDevices;
  const visibilityDocument = options.document ?? asVisibilityDocument(globalThis.document);
  const objectUrlApi = options.objectUrlApi ?? asObjectUrlApi(globalThis.URL);
  /** @type {MediaStream | undefined} */ let retainedStream;
  /** @type {AeroMediaStreamOwnership} */ let streamOwnership = "none";
  /** @type {LiveCameraSourceDescriptor | BrowserLoadedVideoDescriptor | undefined} */ let currentSource;
  /** @type {HTMLVideoElement | undefined} */ let attachedElement;
  /** @type {AeroVideoPlaybackState} */ let playbackState = "idle";
  /** @type {AeroVideoLifecycleState} */ let lifecycleState = "connected";
  /** @type {AeroVideoLeaseState} */ let leaseState = "inactive";
  /** @type {AeroVideoReadabilityState} */ let readabilityState = "not-required";
  /** @type {string | undefined} */ let readabilityReason;
  /** @type {AeroVideoErrorSnapshot | undefined} */ let lastError;
  /** @type {string | undefined} */ let ownedObjectUrl;
  let documentHidden = visibilityDocument?.visibilityState === "hidden";
  let generation = 1;
  let operationId = 0;
  let sourceChangeId = 0;
  /** @type {string | undefined} */ let sourceSignature;
  /** @type {Array<() => void>} */ let elementCleanups = [];

  /** @type {AeroVideoCapabilities} */
  const capabilities = Object.freeze({
    cameraRequest: Boolean(mediaDevices?.getUserMedia),
    injectedStreams: true,
    loadedVideo: true,
    visibilityPause: true,
    leaseLifecycle: true,
    corsReadabilityReporting: true,
    objectUrls: Boolean(objectUrlApi)
  });

  const onVisibilityChange = () => {
    setDocumentHidden(visibilityDocument?.visibilityState === "hidden");
  };
  visibilityDocument?.addEventListener("visibilitychange", onVisibilityChange);

  function nextOperation() {
    operationId += 1;
    return operationId;
  }

  /** @param {number} expectedGeneration @param {number} expectedOperation */
  function isCurrent(expectedGeneration, expectedOperation) {
    return lifecycleState === "connected" && generation === expectedGeneration && operationId === expectedOperation;
  }

  /** @param {MediaStream | undefined} stream */
  function stopTracks(stream) {
    stream?.getTracks().forEach((track) => track.stop());
  }

  function releaseRetainedStream() {
    if (streamOwnership === "facade-owned") stopTracks(retainedStream);
    retainedStream = undefined;
    streamOwnership = "none";
  }

  function revokeOwnedObjectUrl() {
    if (ownedObjectUrl && objectUrlApi) objectUrlApi.revokeObjectURL(ownedObjectUrl);
    ownedObjectUrl = undefined;
  }

  function unbindElement() {
    for (const cleanup of elementCleanups) cleanup();
    elementCleanups = [];
  }

  /** @param {HTMLVideoElement} element */
  function detachElement(element) {
    element.pause();
    if (element.srcObject) element.srcObject = null;
    element.removeAttribute("src");
    element.load();
    if (element === attachedElement) {
      unbindElement();
      attachedElement = undefined;
      revokeOwnedObjectUrl();
    }
  }

  /** @param {HTMLVideoElement} element */
  function bindElement(element) {
    if (attachedElement && attachedElement !== element) detachElement(attachedElement);
    else unbindElement();
    attachedElement = element;
    const bindings = /** @type {const} */ ([
      ["loadedmetadata", () => refreshSourceIdentity(element)],
      ["play", () => { if (attachedElement === element) playbackState = "playing"; }],
      ["pause", () => { if (attachedElement === element && playbackState !== "destroyed") playbackState = "paused"; }],
      ["ended", () => { if (attachedElement === element) playbackState = "ended"; }],
      ["error", () => {
        if (attachedElement === element) {
          playbackState = "error";
          lastError = { code: "media_element_error", name: "MediaElementError", message: "The attached media element reported an error" };
        }
      }]
    ]);
    for (const [type, listener] of bindings) {
      element.addEventListener?.(type, listener);
      elementCleanups.push(() => element.removeEventListener?.(type, listener));
    }
    refreshSourceIdentity(element);
  }

  /** @param {HTMLVideoElement | undefined} element */
  function refreshSourceIdentity(element) {
    const width = positiveNumberOrUndefined(element?.videoWidth);
    const height = positiveNumberOrUndefined(element?.videoHeight);
    const aspect = width && height ? width / height : undefined;
    // A transient 0×0 surface (intrinsic dimensions not yet loaded, e.g. mid
    // stream renegotiation) must not invalidate the last known identity: keep
    // the prior signature and do not advance the change counter.
    if (aspect === undefined && sourceSignature !== undefined) return;
    const signature = currentSource
      ? `${currentSource.kind}|${currentSource.sourceId}|${currentSource.mirrored ? "mirrored" : "unmirrored"}|${aspect?.toFixed(6) ?? "aspect-unknown"}`
      : undefined;
    if (signature !== sourceSignature) {
      sourceSignature = signature;
      sourceChangeId += 1;
    }
  }

  /** @param {LiveCameraSourceDescriptor | BrowserLoadedVideoDescriptor} source */
  function setCurrentSource(source) {
    currentSource = source;
    readabilityReason = undefined;
    readabilityState = source.kind === "live-camera"
      ? "readable"
      : source.readabilityRequirement === "background-only" ? "not-required" : "unknown";
    refreshSourceIdentity(attachedElement);
  }

  /** @param {boolean} hidden */
  function setDocumentHidden(hidden) {
    documentHidden = hidden;
    if (hidden) {
      nextOperation();
      if (attachedElement) attachedElement.pause();
      if (playbackState === "playing" || playbackState === "loading") playbackState = "paused";
    }
    return describeStatus();
  }

  function describeStatus() {
    return Object.freeze({
      serviceId: aeroVideoMediaServiceId,
      lifecycleState,
      generation,
      leaseState,
      documentHidden,
      inferencePaused: documentHidden || leaseState !== "active" || lifecycleState === "destroyed",
      gameplayPaused: documentHidden || leaseState !== "active" || lifecycleState === "destroyed",
      streamOwnership,
      sourceChangeId,
      calibrationSourceIdentity: sourceSignature,
      readabilityState,
      readabilityReason,
      lastError: lastError ? Object.freeze({ ...lastError }) : undefined,
      capabilities
    });
  }

  /** @param {HTMLVideoElement | undefined} element */
  function describeSurface(element = attachedElement) {
    refreshSourceIdentity(element);
    const width = positiveNumberOrUndefined(element?.videoWidth);
    const height = positiveNumberOrUndefined(element?.videoHeight);
    return Object.freeze({
      serviceId: aeroVideoMediaServiceId,
      sourceKind: currentSource?.kind,
      sourceId: currentSource?.sourceId,
      playbackState,
      fitMode: currentSource?.fitMode ?? "contain",
      mirrored: currentSource?.mirrored ?? false,
      hasElement: Boolean(element),
      hasRetainedStream: Boolean(retainedStream),
      streamOwnership,
      intrinsicWidth: width,
      intrinsicHeight: height,
      sourceAspectRatio: width && height ? width / height : undefined,
      durationSeconds: finiteNumberOrUndefined(element?.duration),
      currentTimeSeconds: finiteNumberOrZero(element?.currentTime),
      sourceChangeId,
      calibrationSourceIdentity: sourceSignature,
      readabilityState,
      lifecycleState,
      leaseState,
      documentHidden
    });
  }

  /** @param {HTMLVideoElement | undefined} element */
  function clearVideoElement(element = attachedElement) {
    nextOperation();
    if (element) detachElement(element);
    else {
      unbindElement();
      attachedElement = undefined;
      revokeOwnedObjectUrl();
    }
    if (currentSource?.kind !== "live-camera") {
      currentSource = undefined;
      refreshSourceIdentity(undefined);
      readabilityState = "not-required";
      readabilityReason = undefined;
    }
    if (lifecycleState !== "destroyed") playbackState = retainedStream ? "ready" : "idle";
    return describeSurface();
  }

  function teardownCameraStream() {
    nextOperation();
    releaseRetainedStream();
    if (currentSource?.kind === "live-camera") {
      if (attachedElement) detachElement(attachedElement);
      currentSource = undefined;
      refreshSourceIdentity(undefined);
      if (lifecycleState !== "destroyed") playbackState = "idle";
    }
  }

  const facade = /** @type {BrowserVideoMediaFacade} */ ({
    serviceId: aeroVideoMediaServiceId,
    supportedSources: Object.freeze(["live-camera", "loaded-video", "replay-video-feed"]),
    getRetainedCameraStream() { return retainedStream; },
    async listCameraDevices() {
      if (!mediaDevices?.enumerateDevices || lifecycleState === "destroyed") return [];
      const devices = await mediaDevices.enumerateDevices();
      return devices
        .filter((device) => device.kind === "videoinput" && device.deviceId)
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${index + 1}`,
          groupId: device.groupId || undefined
        }));
    },
    async requestCamera(source = createLiveCameraSourceDescriptor(), requestOptions = {}) {
      if (lifecycleState === "destroyed") {
        return { status: "stale", source, stream: undefined, errorName: "InvalidStateError", message: "Reconnect before requesting a camera", generation };
      }
      const requestGeneration = generation;
      const requestOperation = nextOperation();
      const previousSourceKind = currentSource?.kind;
      lastError = undefined;
      playbackState = "loading";
      if (!mediaDevices?.getUserMedia) {
        playbackState = "error";
        lastError = { code: "camera_unsupported", name: "NotSupportedError", message: "Camera API unavailable in this browser context" };
        return { status: "unsupported", source, stream: undefined, errorName: undefined, message: lastError.message, generation: requestGeneration };
      }
      if (requestOptions.signal?.aborted) {
        playbackState = "idle";
        return { status: "stale", source, stream: undefined, errorName: "AbortError", message: "Camera request was cancelled", generation: requestGeneration };
      }
      try {
        const stream = await mediaDevices.getUserMedia(source.constraints);
        if (requestOptions.signal?.aborted || !isCurrent(requestGeneration, requestOperation)) {
          stopTracks(stream);
          return { status: "stale", source, stream: undefined, errorName: "AbortError", message: "Late camera result was discarded", generation: requestGeneration };
        }
        if (previousSourceKind !== undefined && previousSourceKind !== "live-camera" && attachedElement) detachElement(attachedElement);
        releaseRetainedStream();
        retainedStream = stream;
        streamOwnership = "facade-owned";
        setCurrentSource(source);
        if (previousSourceKind === "live-camera" && attachedElement) attachedElement.srcObject = stream;
        playbackState = "ready";
        return { status: "granted", source, stream, errorName: undefined, message: "Camera permission granted", generation: requestGeneration };
      } catch (error) {
        if (!isCurrent(requestGeneration, requestOperation)) {
          return { status: "stale", source, stream: undefined, errorName: "AbortError", message: "Late camera failure was discarded", generation: requestGeneration };
        }
        playbackState = "error";
        lastError = {
          code: "camera_request_failed",
          name: readErrorField(error, "name") ?? "CameraRequestError",
          message: readErrorField(error, "message") ?? "Camera permission request failed"
        };
        return { status: "blocked", source, stream: undefined, errorName: lastError.name, message: lastError.message, generation: requestGeneration };
      }
    },
    injectCameraStream(stream, injectOptions = {}) {
      if (lifecycleState === "destroyed") return describeSurface();
      nextOperation();
      const previousSourceKind = currentSource?.kind;
      if (previousSourceKind !== undefined && previousSourceKind !== "live-camera" && attachedElement) detachElement(attachedElement);
      const nextOwnership = injectOptions.ownership ?? (stream === retainedStream ? streamOwnership : "host-owned");
      if (stream !== retainedStream) releaseRetainedStream();
      retainedStream = stream;
      streamOwnership = nextOwnership;
      setCurrentSource(injectOptions.source ?? createLiveCameraSourceDescriptor());
      if (previousSourceKind === "live-camera" && attachedElement) attachedElement.srcObject = stream;
      lastError = undefined;
      playbackState = "ready";
      return describeSurface();
    },
    attachCameraStream(videoElement, stream = retainedStream, attachOptions = {}) {
      if (lifecycleState === "destroyed") return describeSurface();
      nextOperation();
      if (currentSource?.kind !== undefined && currentSource.kind !== "live-camera" && attachedElement) detachElement(attachedElement);
      if (!stream) {
        setCurrentSource(attachOptions.source ?? createLiveCameraSourceDescriptor());
        playbackState = "error";
        lastError = { code: "camera_stream_missing", name: "MediaStreamError", message: "No camera stream is available to attach" };
        return describeSurface(videoElement);
      }
      if (stream !== retainedStream) facade.injectCameraStream(stream, attachOptions);
      else if (attachOptions.source || currentSource?.kind !== "live-camera") {
        setCurrentSource(attachOptions.source ?? createLiveCameraSourceDescriptor());
      }
      bindElement(videoElement);
      videoElement.srcObject = stream;
      videoElement.muted = true;
      videoElement.playsInline = true;
      playbackState = "ready";
      return describeSurface(videoElement);
    },
    attachVideoSource(videoElement, source) {
      if (lifecycleState === "destroyed") return describeSurface();
      nextOperation();
      if (currentSource?.kind === "live-camera") teardownCameraStream();
      else clearVideoElement(attachedElement);
      setCurrentSource(source);
      bindElement(videoElement);
      playbackState = "loading";
      videoElement.srcObject = null;
      videoElement.crossOrigin = source.crossOrigin ?? null;
      videoElement.src = source.url;
      videoElement.loop = source.loop;
      videoElement.autoplay = source.autoplay;
      videoElement.muted = source.muted;
      videoElement.currentTime = source.startTimeSeconds;
      if (source.objectUrlOwned) ownedObjectUrl = source.url;
      playbackState = "ready";
      return describeSurface(videoElement);
    },
    attachVideoBlob(videoElement, blob, blobOptions = {}) {
      if (lifecycleState === "destroyed") return describeSurface();
      if (!objectUrlApi) {
        playbackState = "error";
        lastError = { code: "object_url_unsupported", name: "NotSupportedError", message: "Object URLs are unavailable in this browser context" };
        return describeSurface(videoElement);
      }
      const url = objectUrlApi.createObjectURL(blob);
      const source = createLoadedVideoSourceDescriptor({ ...blobOptions, url, mediaType: blobOptions.mediaType ?? (blob.type || undefined), objectUrlOwned: true });
      return facade.attachVideoSource(videoElement, source);
    },
    async play(videoElement) {
      if (lifecycleState === "destroyed") return describeSurface(videoElement);
      const playGeneration = generation;
      const playOperation = nextOperation();
      bindElement(videoElement);
      try {
        await videoElement.play();
        if (isCurrent(playGeneration, playOperation)) playbackState = "playing";
      } catch (error) {
        if (isCurrent(playGeneration, playOperation)) {
          playbackState = "error";
          lastError = { code: "media_play_failed", name: readErrorField(error, "name") ?? "PlaybackError", message: readErrorField(error, "message") ?? "Media playback failed" };
        }
      }
      return describeSurface(videoElement);
    },
    pause(videoElement = attachedElement) {
      nextOperation();
      videoElement?.pause();
      if (lifecycleState !== "destroyed") playbackState = "paused";
      return describeSurface(videoElement);
    },
    seek(videoElement, timeSeconds) {
      videoElement.currentTime = finiteNonNegative(timeSeconds);
      return describeSurface(videoElement);
    },
    reportSourceReadability(readable, reason) {
      if (lifecycleState === "destroyed") return describeStatus();
      readabilityState = readable ? "readable" : "blocked";
      readabilityReason = reason;
      if (!readable && currentSource && currentSource.kind !== "live-camera" && currentSource.readabilityRequirement === "sampled-media") {
        lastError = { code: "sampled_media_unreadable", name: "SecurityError", message: reason ?? "Sampled media is not readable; verify CORS headers" };
      }
      return describeStatus();
    },
    setDocumentHidden,
    activateLease() {
      if (lifecycleState === "connected") leaseState = "active";
      return describeStatus();
    },
    pauseForLease() {
      if (lifecycleState === "destroyed") return describeStatus();
      nextOperation();
      leaseState = "paused";
      if (attachedElement) {
        attachedElement.pause();
        playbackState = "paused";
      }
      return describeStatus();
    },
    releaseLease(releaseOptions = {}) {
      if (lifecycleState === "destroyed") return describeStatus();
      nextOperation();
      leaseState = "released";
      if (attachedElement) {
        attachedElement.pause();
        playbackState = "paused";
      }
      if (releaseOptions.releaseStream ?? true) teardownCameraStream();
      return describeStatus();
    },
    describeSurface,
    describeStatus,
    teardownCameraStream,
    clearVideoElement,
    destroy() {
      if (lifecycleState === "destroyed") return describeStatus();
      nextOperation();
      generation += 1;
      lifecycleState = "destroyed";
      leaseState = "released";
      visibilityDocument?.removeEventListener("visibilitychange", onVisibilityChange);
      clearVideoElement(attachedElement);
      releaseRetainedStream();
      currentSource = undefined;
      sourceSignature = undefined;
      playbackState = "destroyed";
      readabilityState = "not-required";
      readabilityReason = undefined;
      return describeStatus();
    },
    reconnect() {
      if (lifecycleState === "connected") return describeStatus();
      generation += 1;
      nextOperation();
      lifecycleState = "connected";
      leaseState = "inactive";
      playbackState = "idle";
      lastError = undefined;
      documentHidden = visibilityDocument?.visibilityState === "hidden";
      visibilityDocument?.addEventListener("visibilitychange", onVisibilityChange);
      return describeStatus();
    }
  });

  return facade;
}

/** @param {unknown} value @returns {AeroVisibilityDocument | undefined} */
function asVisibilityDocument(value) {
  if (value && typeof value === "object" && "addEventListener" in value && "removeEventListener" in value) {
    return /** @type {AeroVisibilityDocument} */ (value);
  }
  return undefined;
}

/** @param {unknown} value @returns {AeroObjectUrlApi | undefined} */
function asObjectUrlApi(value) {
  if (value && typeof value === "function" && "createObjectURL" in value && "revokeObjectURL" in value) {
    return /** @type {AeroObjectUrlApi} */ (value);
  }
  return undefined;
}

/** @param {number | undefined} value @returns {number | undefined} */
function positiveNumberOrUndefined(value) { return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined; }
/** @param {number | undefined} value @returns {number | undefined} */
function finiteNumberOrUndefined(value) { return typeof value === "number" && Number.isFinite(value) ? value : undefined; }
/** @param {number | undefined} value @returns {number} */
function finiteNumberOrZero(value) { return typeof value === "number" && Number.isFinite(value) ? value : 0; }
/** @param {number} value @returns {number} */
function finiteNonNegative(value) { return Number.isFinite(value) && value >= 0 ? value : 0; }
/** @param {unknown} value @param {"name" | "message"} field @returns {string | undefined} */
function readErrorField(value, field) {
  if (value && typeof value === "object" && field in value) {
    const fieldValue = value[field];
    return typeof fieldValue === "string" ? fieldValue : undefined;
  }
  return undefined;
}
