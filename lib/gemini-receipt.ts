import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ReceiptAnalysisResult {
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string; // ISO date YYYY-MM-DD
  note: string;
  validity: "valid" | "needs_backup" | "unclear";
  validityReason: string;
  rawResponse: string;
}

const ANALYSIS_PROMPT = `คุณเป็นผู้ช่วยนักบัญชีที่วิเคราะห์รูปภาพสลิปโอนเงินหรือใบเสร็จรับเงิน
กรุณาวิเคราะห์รูปภาพนี้และตอบกลับเป็น JSON เท่านั้น (ไม่ต้องมีข้อความอื่นนอกเหนือจาก JSON) ตามรูปแบบนี้:

{
  "type": "income หรือ expense (income ถ้าเป็นเงินเข้า/ได้รับ, expense ถ้าเป็นเงินออก/จ่าย)",
  "amount": ตัวเลขจำนวนเงิน (ไม่มีคอมม่า ไม่มีสัญลักษณ์สกุลเงิน),
  "category": "หมวดหมู่ที่เหมาะสม เช่น ขายสินค้า, ค่าบริการ, ต้นทุนสินค้า, ค่าเช่า, ค่าแรง/เงินเดือน, ค่าน้ำ-ไฟ-อินเทอร์เน็ต, ค่าขนส่ง, การตลาด, อื่นๆ",
  "date": "วันที่บนสลิปในรูปแบบ YYYY-MM-DD ถ้าไม่มีปีให้ใช้ปีปัจจุบัน",
  "note": "คำอธิบายสั้นๆ เช่น ชื่อร้าน/ผู้รับ-ผู้โอน",
  "validity": "valid หรือ needs_backup หรือ unclear",
  "validityReason": "อธิบายสั้นๆ ว่าทำไมถึงประเมินสถานะนี้"
}

เกณฑ์การประเมิน validity:
- "valid" = เป็นใบเสร็จ/ใบกำกับภาษีที่มีข้อมูลครบถ้วน (ชื่อร้าน, วันที่, ยอดเงิน, รายละเอียด) ใช้ยืนยันทางบัญชีได้ทันที
- "needs_backup" = เป็นสลิปโอนเงินธรรมดา (เช่น จากแอปธนาคาร) ที่มีแค่ยอดเงินกับเวลา ไม่มีรายละเอียดสินค้า/บริการ ควรขอใบเสร็จจากร้านเพิ่ม หรือออกใบเสร็จสำรองเอง
- "unclear" = รูปไม่ชัด อ่านไม่ออก หรือไม่แน่ใจว่าเป็นเอกสารการเงินหรือไม่

ถ้าไม่สามารถระบุค่าใดได้ ให้ใส่ amount เป็น 0 และอธิบายเหตุผลใน validityReason`;

export async function analyzeReceiptImage(
  imageBase64: string,
  mimeType: string
): Promise<ReceiptAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent([
    ANALYSIS_PROMPT,
    {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    },
  ]);

  const text = result.response.text();
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      type: parsed.type === "income" ? "income" : "expense",
      amount: typeof parsed.amount === "number" ? parsed.amount : 0,
      category: parsed.category || "อื่นๆ",
      date: parsed.date || new Date().toISOString().slice(0, 10),
      note: parsed.note || "",
      validity: ["valid", "needs_backup", "unclear"].includes(parsed.validity)
        ? parsed.validity
        : "unclear",
      validityReason: parsed.validityReason || "",
      rawResponse: text,
    };
  } catch {
    // ถ้า Gemini ตอบไม่เป็น JSON ที่ parse ได้ ให้ส่งกลับเป็นสถานะ unclear แทนการ throw error
    // เพื่อให้ webhook ยังตอบกลับ LINE ได้ปกติ และผู้ใช้ตรวจสอบเองในหน้ารอตรวจสอบ
    return {
      type: "expense",
      amount: 0,
      category: "อื่นๆ",
      date: new Date().toISOString().slice(0, 10),
      note: "",
      validity: "unclear",
      validityReason: "ไม่สามารถวิเคราะห์รูปภาพได้อัตโนมัติ กรุณาตรวจสอบและกรอกข้อมูลเอง",
      rawResponse: text,
    };
  }
}
