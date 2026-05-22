export function optimizeCloudinaryUrl(url: string): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  return url.replace(
    /\/image\/upload(\/[^/]*)*\/v/,
    "/image/upload/f_auto,q_auto/v"
  );
}
