import { readFileSync } from "fs";
import { xApiFetch } from "./x-http.mjs";

function mediaFetch(path, options = {}) {
  return xApiFetch(path, options, { label: "X media API" });
}

export async function uploadImageFile(filePath) {
  const buffer = readFileSync(filePath);
  return uploadImageBuffer(buffer, "image/png");
}

export async function uploadImageBuffer(buffer, mediaType = "image/png") {
  const init = await mediaFetch("/2/media/upload/initialize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      media_type: mediaType,
      total_bytes: buffer.length,
      media_category: "tweet_image",
    }),
  });

  const mediaId = init?.data?.id;
  if (!mediaId) {
    throw new Error(`Media initialize failed: ${JSON.stringify(init)}`);
  }

  await mediaFetch(`/2/media/upload/${mediaId}/append`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      segment_index: 0,
      media: buffer.toString("base64"),
    }),
  });

  const finalized = await mediaFetch(`/2/media/upload/${mediaId}/finalize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  const id = finalized?.data?.id ?? mediaId;
  return String(id);
}
