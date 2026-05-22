let _cachedRate = 1400;
let _version = 0;
let _loading: Promise<void> | null = null;

const arsFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

async function _fetchFromDb(): Promise<number> {
  const { prisma } = await import("@/lib/prisma");
  const settings = await prisma.siteSettings.upsert({
    where: { id: "site_settings" },
    update: {},
    create: { id: "site_settings", usdToArs: 1400 },
  });
  return settings.usdToArs;
}

function _isClient(): boolean {
  return typeof window !== "undefined";
}

async function _fetchFromApi(): Promise<number> {
  const res = await fetch("/api/settings/exchange-rate");
  if (!res.ok) throw new Error("Failed to fetch exchange rate");
  const data = await res.json();
  return data.usdToArs;
}

function _bootstrap(): void {
  if (_loading) return;
  const versionAtStart = _version;

  if (_isClient()) {
    const stored = sessionStorage.getItem("usdToArs");
    if (stored) {
      const parsed = Number(stored);
      if (!isNaN(parsed) && parsed > 0) {
        _cachedRate = parsed;
      }
    }
    _loading = _fetchFromApi()
      .then((rate) => {
        if (_version === versionAtStart) {
          _cachedRate = rate;
          sessionStorage.setItem("usdToArs", String(rate));
        }
      })
      .catch(() => {
        /* noop */
      });
  } else {
    _loading = _fetchFromDb()
      .then((rate) => {
        if (_version === versionAtStart) {
          _cachedRate = rate;
        }
      })
      .catch(() => {
        /* noop */
      });
  }
}

export async function refreshExchangeRate(): Promise<number> {
  const rate = _isClient() ? await _fetchFromApi() : await _fetchFromDb();
  _cachedRate = rate;
  _version++;
  if (_isClient()) {
    sessionStorage.setItem("usdToArs", String(rate));
  }
  return rate;
}

export function invalidateExchangeRate(newRate: number): void {
  _cachedRate = newRate;
  _version++;
  if (_isClient()) {
    sessionStorage.setItem("usdToArs", String(newRate));
  }
}

export async function getExchangeRateAsync(): Promise<number> {
  return refreshExchangeRate();
}

export function formatPrice(usdPrice: number): string {
  _bootstrap();
  return arsFormatter.format(usdPrice * _cachedRate);
}

export function formatArs(arsPrice: number): string {
  return arsFormatter.format(arsPrice);
}

export function usdToArs(usdPrice: number): number {
  _bootstrap();
  return usdPrice * _cachedRate;
}

export function arsToUsd(arsPrice: number): number {
  _bootstrap();
  return arsPrice / _cachedRate;
}
