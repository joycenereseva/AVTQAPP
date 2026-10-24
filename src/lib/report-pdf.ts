import type { jsPDF } from "jspdf";

export async function waitForReportImages(container: HTMLElement): Promise<void> {
  const imgs = [...container.querySelectorAll("img")];
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
          setTimeout(resolve, 4000);
        }),
    ),
  );
}

export function addCanvasToPdf(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  pdfW: number,
  pdfH: number,
  addNewPage: boolean,
): void {
  const imgW = pdfW;
  const imgH = (canvas.height / canvas.width) * imgW;
  if (addNewPage) pdf.addPage();
  const imgData = canvas.toDataURL("image/jpeg", 0.94);
  if (imgH <= pdfH) {
    pdf.addImage(imgData, "JPEG", 0, 0, imgW, imgH);
    return;
  }
  const pc = document.createElement("canvas");
  const ctx = pc.getContext("2d");
  if (!ctx) return;
  const scale = canvas.width / imgW;
  const pageHPx = Math.floor(pdfH * scale);
  let off = 0;
  let firstSlice = !addNewPage;
  while (off < canvas.height) {
    const sh = Math.min(pageHPx, canvas.height - off);
    pc.width = canvas.width;
    pc.height = sh;
    ctx.clearRect(0, 0, pc.width, pc.height);
    ctx.drawImage(canvas, 0, off, canvas.width, sh, 0, 0, canvas.width, sh);
    if (!firstSlice) pdf.addPage();
    firstSlice = false;
    pdf.addImage(pc.toDataURL("image/jpeg", 0.94), "JPEG", 0, 0, imgW, sh / scale);
    off += sh;
  }
}

export async function saveReportElementAsPdf(
  element: HTMLElement,
  fileName: string,
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  await waitForReportImages(element);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#e7eff2",
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: element.scrollWidth,
  });

  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4", compress: true });
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();
  addCanvasToPdf(pdf, canvas, pdfW, pdfH, false);
  pdf.save(fileName);
}
