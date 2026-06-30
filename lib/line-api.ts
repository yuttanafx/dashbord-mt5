import crypto from "crypto";

// ตรวจสอบว่า webhook request นี้มาจาก LINE จริง โดยเทียบ signature ที่เข้ารหัสด้วย Channel secret
// ป้องกันไม่ให้คนอื่นปลอมแปลง request มายิง endpoint นี้
export function verifyLineSignature(body: string, signature: string | null): boolean {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  if (!channelSecret || !signature) return false;

  const hash = crypto.createHmac("SHA256", channelSecret).update(body).digest("base64");
  return hash === signature;
}

// ดาวน์โหลดรูปภาพจาก LINE Content API ด้วย message ID มาเป็น base64
export async function downloadLineImage(
  messageId: string
): Promise<{ base64: string; mimeType: string }> {
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!accessToken) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not set");

  const res = await fetch(`https://api-data.line.me/v2/bot/message/${messageId}/content`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to download LINE image: ${res.status}`);
  }

  const mimeType = res.headers.get("content-type") || "image/jpeg";
  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  return { base64, mimeType };
}

// ตอบกลับข้อความทันทีในบทสนทนาเดิม (ใช้ reply token ที่ได้รับมาพร้อม event แต่ละครั้ง)
// reply token ใช้ได้ครั้งเดียวและหมดอายุเร็ว เหมาะกับการตอบรับทันที เช่น "กำลังตรวจสอบ..."
export async function replyLineMessage(replyToken: string, text: string): Promise<void> {
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!accessToken) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not set");

  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text }],
    }),
  });
}

// ส่งข้อความเข้าไปยังกลุ่ม/ผู้ใช้โดยตรง (ไม่ผูกกับ reply token) ใช้สำหรับส่งสรุปผลวิเคราะห์ภายหลัง
// หรือส่งสรุปยอดประจำวันที่ไม่ได้เกิดจาก event ทันที
export async function pushLineMessage(to: string, text: string): Promise<void> {
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!accessToken) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not set");

  await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      to,
      messages: [{ type: "text", text }],
    }),
  });
}
