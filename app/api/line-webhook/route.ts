import { NextRequest, NextResponse } from "next/server";
import { verifyLineSignature, downloadLineImage, replyLineMessage } from "@/lib/line-api";
import { analyzeReceiptImage } from "@/lib/gemini-receipt";
import { getAdminDb } from "@/lib/firebase-admin";
import { RECEIPT_VALIDITY_LABEL } from "@/lib/types";

const WORKSPACE_ID = "default";

interface LineEvent {
  type: string;
  replyToken?: string;
  source?: { userId?: string; groupId?: string; type: string };
  message?: { id: string; type: string };
}

// LINE จะยิง POST มาที่ endpoint นี้ทุกครั้งที่มีข้อความ/รูปใหม่ในกลุ่มที่บอทอยู่
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-line-signature");

  // ตรวจสอบว่า request นี้มาจาก LINE จริง ไม่ใช่คนปลอมแปลงยิงเข้ามาตรงๆ
  if (!verifyLineSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);
  const events: LineEvent[] = body.events || [];

  // ประมวลผลทุก event ที่ส่งมา (LINE อาจส่งหลาย event มาในครั้งเดียว)
  await Promise.all(events.map(handleEvent));

  // ต้องตอบ 200 กลับให้ LINE เสมอ ไม่งั้น LINE จะส่ง event เดิมซ้ำมาเรื่อยๆ
  return NextResponse.json({ ok: true });
}

async function handleEvent(event: LineEvent) {
  try {
    // สนใจเฉพาะ event ที่เป็นข้อความรูปภาพเท่านั้น
    if (event.type !== "message" || event.message?.type !== "image") {
      return;
    }

    const messageId = event.message.id;
    const replyToken = event.replyToken;
    const userId = event.source?.userId || "";

    // ตอบกลับทันทีว่ากำลังตรวจสอบ ให้ผู้ใช้รู้ว่าบอทรับรูปแล้ว (ไม่ต้องรอ Gemini วิเคราะห์เสร็จ)
    if (replyToken) {
      await replyLineMessage(replyToken, "📥 ได้รับสลิป/ใบเสร็จแล้ว กำลังตรวจสอบด้วย AI สักครู่...");
    }

    // ดาวน์โหลดรูปจาก LINE
    const { base64, mimeType } = await downloadLineImage(messageId);

    // ส่งให้ Gemini วิเคราะห์
    const analysis = await analyzeReceiptImage(base64, mimeType);

    // บันทึกเป็น "รายการรอตรวจสอบ" ใน Firestore เพื่อให้ผู้ใช้ไปยืนยัน/แก้ไขในเว็บแอป
    const db = getAdminDb();
    const docRef = await db
      .collection("workspaces")
      .doc(WORKSPACE_ID)
      .collection("pendingReceipts")
      .add({
        imageDataUrl: `data:${mimeType};base64,${base64}`,
        suggestedType: analysis.type,
        suggestedAmount: analysis.amount,
        suggestedCategory: analysis.category,
        suggestedDate: analysis.date,
        suggestedNote: analysis.note,
        validity: analysis.validity,
        validityReason: analysis.validityReason,
        rawAiResponse: analysis.rawResponse,
        lineUserId: userId,
        lineUserName: "",
        receivedAt: new Date().toISOString(),
        status: "pending",
      });

    // ส่งสรุปผลวิเคราะห์กลับเข้าแชท ให้รู้ผลทันทีโดยไม่ต้องเปิดเว็บ
    if (replyToken) {
      const validityLabel = RECEIPT_VALIDITY_LABEL[analysis.validity];
      const typeLabel = analysis.type === "income" ? "รายรับ" : "รายจ่าย";
      const summary = [
        `✅ วิเคราะห์เสร็จแล้ว (เลขที่: ${docRef.id.slice(0, 6)})`,
        `ประเภท: ${typeLabel}`,
        `จำนวนเงิน: ${analysis.amount.toLocaleString("th-TH")} บาท`,
        `หมวดหมู่: ${analysis.category}`,
        `สถานะ: ${validityLabel}`,
        analysis.validityReason ? `หมายเหตุ: ${analysis.validityReason}` : "",
        "",
        "กรุณาเข้าเว็บแอป หน้า 'รอตรวจสอบ' เพื่อยืนยันรายการนี้ก่อนบันทึกเข้าบัญชีจริง",
      ]
        .filter(Boolean)
        .join("\n");

      // ใช้ push message แทน reply เพราะ reply token อาจถูกใช้ไปแล้วในข้อความแรก
      // และข้อความนี้ส่งหลัง Gemini วิเคราะห์เสร็จซึ่งอาจช้ากว่า reply token หมดอายุ (ใช้ได้ ~1 นาที)
      const { pushLineMessage } = await import("@/lib/line-api");
      const target = event.source?.groupId || userId;
      if (target) {
        await pushLineMessage(target, summary);
      }
    }
  } catch (error) {
    console.error("Error handling LINE event:", error);
  }
}

// LINE อาจส่ง GET มาตรวจสอบว่า endpoint ใช้งานได้ตอนตั้งค่า webhook ครั้งแรก
export async function GET() {
  return NextResponse.json({ status: "LINE webhook endpoint is active" });
}
