import jsPDF from "jspdf";

function generatePDF(graphCanvasId, summaryData) {
  const doc = new jsPDF();
  let yOffset = 10;

  // Add graph to the PDF
  const canvas = document.getElementById(graphCanvasId);
  const graphImage = canvas.toDataURL("image/png");
  doc.addImage(graphImage, "PNG", 10, yOffset, 180, 100); // Adjust dimensions as needed
  yOffset += 110; // Move below the graph

  // Add Summary Title
  doc.setFontSize(16);
  doc.text("Summary", 10, yOffset);
  yOffset += 10;

  // Format and add summary data
  doc.setFontSize(12);
  Object.entries(summaryData).forEach(([key, value]) => {
    doc.text(`${key}:`, 10, yOffset);
    yOffset += 7;

    if (typeof value === "object") {
      Object.entries(value).forEach(([subKey, subValue]) => {
        doc.text(`  - ${subKey}: ${subValue}`, 15, yOffset);
        yOffset += 7;
      });
    } else {
      doc.text(`  - ${value}`, 15, yOffset);
      yOffset += 7;
    }
  });

  // Add new page if content exceeds the page height
  if (yOffset > 270) {
    doc.addPage();
    yOffset = 10;
  }

  // Save the PDF
  doc.save("Graph_and_Summary.pdf");
}

module.exports = { generatePDF };
