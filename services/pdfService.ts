import { jsPDF } from "jspdf";
import { SlideData, PresentationSettings } from "../types";
import { compressImage } from "./utils";

export const generatePDF = async (
  slides: SlideData[],
  settings: PresentationSettings,
  filename: string = "presentation.pdf"
) => {
  // Initialize PDF with 16:9 aspect ratio (10in x 5.625in)
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "in",
    format: [10, 5.625]
  });

  for (let i = 0; i < slides.length; i++) {
    const slideData = slides[i];
    if (i > 0) doc.addPage();

    // Use compressed image (JPEG) to avoid large string issues
    const imageDataUrl = await compressImage(slideData.file);
    
    // Since compressImage returns a JPEG data URL, we hardcode the format to 'JPEG'
    const format = 'JPEG';

    const content = slideData.content;
    const titleText = content?.title || `Slide ${i + 1}`;
    const points = content?.points || [];
    const hasPoints = points.length > 0;

    // --- Layout Logic ---

    if (settings.layout === 'fullscreen') {
        // 1. Full Screen Image
        try {
            doc.addImage(imageDataUrl, format, 0, 0, 10, 5.625);
        } catch (e) {
            console.error("Error adding image to PDF", e);
            doc.text("Image Error", 5, 2.8, { align: "center" });
        }

        const hasText = (settings.includeTitle || (settings.includePoints && hasPoints));
        
        if (hasText) {
            doc.setFillColor(0, 0, 0);
            
            try {
                // @ts-ignore - GState might not be fully typed in all jspdf versions
                doc.setGState(new doc.GState({ opacity: 0.7 }));
            } catch (e) {
                // Ignore if GState not supported
            }
            
            doc.rect(0, 3.65, 10, 1.975, 'F'); // y ~65%, h ~35%

            try {
                // @ts-ignore
                doc.setGState(new doc.GState({ opacity: 1.0 }));
            } catch (e) {}

            doc.setTextColor(255, 255, 255);

            if (settings.includeTitle) {
                doc.setFontSize(24);
                doc.setFont("helvetica", "bold");
                doc.text(titleText, 5, 4.1, { align: "center", maxWidth: 9 });
            }

            if (settings.includePoints && hasPoints) {
                doc.setFontSize(14);
                doc.setFont("helvetica", "normal");
                let yPos = settings.includeTitle ? 4.6 : 4.1;
                
                points.forEach((point) => {
                    const bullet = "• " + point;
                    const lines = doc.splitTextToSize(bullet, 9);
                    doc.text(lines, 5, yPos, { align: "center" });
                    yPos += (lines.length * 0.25);
                });
            }
        }

    } else if (settings.layout === 'left') {
        // Image Left, Text Right
        
        try {
            doc.addImage(imageDataUrl, format, 0.5, 0.5625, 4.5, 4.5, undefined, 'CONTAIN');
        } catch (e) {
             console.error("Error adding image", e);
        }

        const textX = 5.5;
        doc.setTextColor(15, 23, 42); // slate-900

        if (settings.includeTitle) {
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            const titleLines = doc.splitTextToSize(titleText, 4);
            doc.text(titleLines, textX, 1);
        }

        if (settings.includePoints && hasPoints) {
            doc.setFontSize(16);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(51, 65, 85); // slate-700
            
            let yPos = settings.includeTitle ? 2.2 : 1;
            
            points.forEach((point) => {
                const bullet = "• " + point;
                const lines = doc.splitTextToSize(bullet, 4);
                doc.text(lines, textX, yPos);
                yPos += (lines.length * 0.35); // Line spacing
            });
        }

    } else if (settings.layout === 'right') {
        // Image Right, Text Left
        
        try {
            doc.addImage(imageDataUrl, format, 5.5, 0.5625, 4.5, 4.5, undefined, 'CONTAIN');
        } catch (e) {
             console.error("Error adding image", e);
        }

        const textX = 0.5;
        doc.setTextColor(15, 23, 42);

        if (settings.includeTitle) {
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            const titleLines = doc.splitTextToSize(titleText, 4.5);
            doc.text(titleLines, textX, 1);
        }

        if (settings.includePoints && hasPoints) {
            doc.setFontSize(16);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(51, 65, 85);
            
            let yPos = settings.includeTitle ? 2.2 : 1;
            
            points.forEach((point) => {
                const bullet = "• " + point;
                const lines = doc.splitTextToSize(bullet, 4.5);
                doc.text(lines, textX, yPos);
                yPos += (lines.length * 0.35);
            });
        }
    }
  }

  doc.save(filename);
};