// @ts-check

import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { chromium } from "playwright";

const root = new URL("../", import.meta.url).pathname;
const server = createServer(async (request, response) => {
  try {
    const requestPath = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
    const relativePath = normalize(requestPath).replace(/^[/\\]+/u, "");
    const candidate = join(root, relativePath || ".testbed/demo/index.html");
    const metadata = await stat(candidate);
    const filePath = metadata.isDirectory() ? join(candidate, "index.html") : candidate;
    const content = await readFile(filePath);
    response.writeHead(200, { "content-type": contentType(filePath) });
    response.end(content);
  } catch {
    response.writeHead(404, { "content-type": "text/plain" });
    response.end("Not found");
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
assert.ok(address && typeof address === "object");
const origin = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
/** @type {string[]} */ const consoleProblems = [];
page.on("console", (message) => {
  if (message.type() === "warning" || message.type() === "error") consoleProblems.push(`${message.type()}: ${message.text()}`);
});
page.on("pageerror", (error) => consoleProblems.push(`pageerror: ${error.message}`));

try {
  await page.goto(`${origin}/.testbed/demo/index.html`, { waitUntil: "load" });
  const result = await page.evaluate(async () => {
    const module = await import("/src/index.js");
    const canvas = document.createElement("canvas");
    canvas.width = 8;
    canvas.height = 8;
    const hostStream = canvas.captureStream(1);
    const hostTrack = hostStream.getVideoTracks()[0];
    const facade = module.createBrowserVideoMediaFacade({ document });
    facade.activateLease();
    facade.injectCameraStream(hostStream, {
      source: module.createLiveCameraSourceDescriptor({ sourceId: "browser-host" })
    });
    const video = document.createElement("video");
    facade.attachCameraStream(video);
    const attached = facade.describeSurface();
    facade.destroy();
    const hostTrackAfterDestroy = hostTrack.readyState;
    const reconnect = facade.reconnect();

    const transferCanvas = document.createElement("canvas");
    transferCanvas.width = 8;
    transferCanvas.height = 8;
    const transferredStream = transferCanvas.captureStream(1);
    const transferredTrack = transferredStream.getVideoTracks()[0];
    facade.injectCameraStream(transferredStream, { ownership: "facade-owned" });
    facade.activateLease();
    facade.releaseLease();

    const blobVideo = document.createElement("video");
    facade.attachVideoBlob(blobVideo, new Blob(["not-a-real-video"], { type: "video/webm" }), {
      sourceId: "browser-blob",
      readabilityRequirement: "sampled-media"
    });
    const blobSurface = facade.describeSurface();
    facade.reportSourceReadability(false, "browser smoke probe");
    const readability = facade.describeStatus();
    facade.clearVideoElement();
    hostTrack.stop();
    return {
      attachedOwnership: attached.streamOwnership,
      attachedIdentity: attached.calibrationSourceIdentity,
      hostTrackAfterDestroy,
      reconnectState: reconnect.lifecycleState,
      transferredTrackAfterRelease: transferredTrack.readyState,
      blobSourceId: blobSurface.sourceId,
      blobReadabilityBeforeReport: blobSurface.readabilityState,
      readabilityAfterReport: readability.readabilityState,
      blobCleared: blobVideo.src === ""
    };
  });

  assert.equal(result.attachedOwnership, "host-owned");
  assert.match(result.attachedIdentity ?? "", /browser-host/u);
  assert.equal(result.hostTrackAfterDestroy, "live");
  assert.equal(result.reconnectState, "connected");
  assert.equal(result.transferredTrackAfterRelease, "ended");
  assert.equal(result.blobSourceId, "browser-blob");
  assert.equal(result.blobReadabilityBeforeReport, "unknown");
  assert.equal(result.readabilityAfterReport, "blocked");
  assert.equal(result.blobCleared, true);
  assert.deepEqual(consoleProblems, []);
  console.log("Browser injected-stream, ownership, reconnect, blob, and readability validation passed.");
} finally {
  await browser.close();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve(undefined)));
}

/** @param {string} filePath @returns {string} */
function contentType(filePath) {
  const extension = extname(filePath);
  if (extension === ".html") return "text/html; charset=utf-8";
  if (extension === ".js") return "text/javascript; charset=utf-8";
  if (extension === ".json") return "application/json; charset=utf-8";
  return "application/octet-stream";
}
