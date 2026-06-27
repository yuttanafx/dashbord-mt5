export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function documentTotal(items: { quantity: number; unitPrice: number }[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("ไม่สามารถอ่านไฟล์ได้"));
    reader.readAsDataURL(file);
  });
}

// บีบอัดรูปภาพให้มีขนาดเล็กพอสำหรับเก็บใน Firestore (จำกัด 1MB ต่อ document)
// ลดความกว้าง/สูงสูงสุด และลดคุณภาพ JPEG จนกว่าจะได้ขนาดที่เหมาะสม
export async function compressImageToDataUrl(
  file: File,
  maxDimension = 1280,
  maxBytes = 600 * 1024 // เผื่อพื้นที่ให้ field อื่นๆ ของ document ด้วย
): Promise<string> {
  const dataUrl = await fileToDataUrl(file);

  const img = document.createElement("img");
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("ไม่สามารถอ่านไฟล์รูปภาพได้"));
    img.src = dataUrl;
  });

  let { width, height } = img;
  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("ไม่สามารถประมวลผลรูปภาพได้");
  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.85;
  let result = canvas.toDataURL("image/jpeg", quality);

  // ลดคุณภาพลงทีละขั้นจนกว่าจะได้ขนาดไม่เกิน maxBytes
  while (result.length * 0.75 > maxBytes && quality > 0.3) {
    quality -= 0.1;
    result = canvas.toDataURL("image/jpeg", quality);
  }

  return result;
}

// ช่วงวันที่ของเดือนที่กำหนด (year: ค.ศ., month: 0-11) คืนค่าเป็น ISO date string
export function monthRange(year: number, month: number): { start: string; end: string } {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0); // วันสุดท้ายของเดือน
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

export function isWithinRange(dateISO: string, start: string, end: string): boolean {
  return dateISO >= start && dateISO <= end;
}

export const THAI_MONTHS_FULL = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

export function toBuddhistYear(year: number): number {
  return year + 543;
}
