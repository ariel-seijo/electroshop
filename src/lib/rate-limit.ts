const attempts = new Map<string, number[]>();

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "127.0.0.1";
}

interface RateLimitOptions {
  maxAttempts?: number;
  windowMs?: number;
}

interface RateLimitResult {
  allowed: boolean;
}

export function checkRateLimit(
  ip: string,
  key: string,
  { maxAttempts = 5, windowMs = 60_000 }: RateLimitOptions = {}
): RateLimitResult {
  const now = Date.now();
  const mapKey = `${ip}:${key}`;

  const timestamps = attempts.get(mapKey) || [];

  const valid = timestamps.filter((t) => now - t < windowMs);

  if (valid.length >= maxAttempts) {
    attempts.set(mapKey, valid);
    return { allowed: false };
  }

  valid.push(now);
  attempts.set(mapKey, valid);

  return { allowed: true };
}
