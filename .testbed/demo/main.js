// @ts-check

import {
  aeroVideoMediaServiceId,
  createLiveCameraSourceDescriptor,
  createLoadedVideoSourceDescriptor,
  createReplayVideoFeedSourceDescriptor
} from "../../src/index.js";

/** @type {HTMLElement | null} */
const app = document.querySelector("#app");

if (app instanceof HTMLElement) {
  const descriptors = [
    createLiveCameraSourceDescriptor(),
    createLoadedVideoSourceDescriptor({ url: "/fixtures/example-video.mp4" }),
    createReplayVideoFeedSourceDescriptor({ url: "/fixtures/example-replay.webm", frameRate: 30 })
  ];
  app.textContent = JSON.stringify({
    serviceId: aeroVideoMediaServiceId,
    sourceKinds: descriptors.map((descriptor) => descriptor.kind)
  });
}
