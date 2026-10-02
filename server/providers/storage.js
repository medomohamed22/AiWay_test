// The adapter owns bucket operations; feature handlers own authorization and paths.
export const IMAGE_BUCKET = "generated-images";
export function imageStorage(client) {
  const bucket = client.storage.from(IMAGE_BUCKET);
  return {
    upload: (path, bytes, options) => bucket.upload(path, bytes, options),
    remove: (paths) => bucket.remove(paths),
    createSignedUrl: (path, seconds, options) =>
      bucket.createSignedUrl(path, seconds, options),
  };
}
