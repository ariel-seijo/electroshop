const MAX_NOTES_LENGTH = 500;
const MAX_CVC_LENGTH = 4;

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatCardNumber(value: string): string {
  const raw = digitsOnly(value).slice(0, 16);
  return raw.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function formatExpiry(value: string): string {
  const raw = digitsOnly(value).slice(0, 4);
  if (raw.length >= 3) {
    return `${raw.slice(0, 2)}/${raw.slice(2)}`;
  }
  return raw;
}

export function formatCvc(value: string): string {
  return digitsOnly(value).slice(0, MAX_CVC_LENGTH);
}

export function formatPhone(value: string): string {
  const hasPlus = value.startsWith("+");
  let raw = digitsOnly(value);

  if (raw.length === 0) return hasPlus ? "+" : "";

  if (hasPlus || raw.startsWith("54")) {
    if (raw.startsWith("54")) raw = raw.slice(2);
    if (raw.length > 0 && raw[0] === "9") {
      const rest = raw.slice(1);
      const area = rest.slice(0, 2);
      const num = rest.slice(2);
      let out = `+54 9`;
      if (area) out += ` ${area}`;
      if (num.length > 4) {
        out += ` ${num.slice(0, 4)}-${num.slice(4, 8)}`;
      } else if (num) {
        out += ` ${num}`;
      }
      return out.trim();
    }
    const area = raw.slice(0, 2);
    const num = raw.slice(2);
    let out = "+54";
    if (area) out += ` ${area}`;
    if (num.length > 4) {
      out += ` ${num.slice(0, 4)}-${num.slice(4, 8)}`;
    } else if (num) {
      out += ` ${num}`;
    }
    return out.trim();
  }

  const area = raw.slice(0, 2);
  const num = raw.slice(2);
  let out = "";
  if (area) out += area;
  if (num.length > 4) {
    out += ` ${num.slice(0, 4)}-${num.slice(4, 8)}`;
  } else if (num) {
    out += ` ${num}`;
  }
  return out.trim();
}

export function limitNotes(value: string): string {
  return value.slice(0, MAX_NOTES_LENGTH);
}

export function rawCardNumber(formatted: string): string {
  return digitsOnly(formatted);
}

export function rawExpiry(formatted: string): string {
  return digitsOnly(formatted);
}
