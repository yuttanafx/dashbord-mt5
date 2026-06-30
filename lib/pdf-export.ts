"use client";

// สร้างไฟล์ PDF จาก DOM element แล้วดาวน์โหลดทันที
// ใช้แทน window.print() เพราะทำงานได้เสถียรกว่าบนมือถือ/in-app browser (เช่น LINE)
// เนื่องจาก window.print() พึ่งพา native print dialog ของระบบปฏิบัติการ
// ซึ่งมักถูกบล็อกหรือทำงานไม่ครบในเบราว์เซอร์มือถือบางตัว
export async function downloadElementAsPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  // เรนเดอร์ DOM เป็นภาพความละเอียดสูง (scale 2 เพื่อความคมชัด)
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.95);

  // ขนาดกระดาษ A4 ในหน่วยมิลลิเมตร
  const pdfWidth = 210;
  const pdfHeight = 297;

  const imgWidthMm = pdfWidth;
  const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  if (imgHeightMm <= pdfHeight) {
    // เนื้อหาพอดีหน้าเดียว
    pdf.addImage(imgData, "JPEG", 0, 0, imgWidthMm, imgHeightMm);
  } else {
    // เนื้อหายาวเกินหนึ่งหน้า A4 ให้ตัดแบ่งหน้าอัตโนมัติ
    let heightLeft = imgHeightMm;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, imgWidthMm, imgHeightMm);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeightMm;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidthMm, imgHeightMm);
      heightLeft -= pdfHeight;
    }
  }

  pdf.save(filename);
}
