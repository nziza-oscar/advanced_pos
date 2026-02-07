import { NextRequest, NextResponse } from 'next/server';
import Barcode from '@/lib/database/models/Barcode';
import JsBarcode from 'jsbarcode';
import { createCanvas } from 'canvas';
import jsPDF from 'jspdf';

export async function POST(request: NextRequest) {
  try {
    const { barcodeIds, format = 'pdf' } = await request.json();
    
    if (!barcodeIds || !Array.isArray(barcodeIds) || barcodeIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please select barcodes to download' },
        { status: 400 }
      );
    }

    // Fetch selected barcodes with full data
    const barcodes = await Barcode.findAll({
      where: { id: barcodeIds },
      order: [['barcode_id', 'ASC']]
    });

    if (barcodes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No barcodes found' },
        { status: 404 }
      );
    }

    // Single barcode format: PNG
    if (barcodes.length === 1 && format === 'png') {
      const canvas = createCanvas(300, 150);
      const barcode = barcodes[0];
      
      JsBarcode(canvas, barcode.barcode, {
        format: "CODE128",
        width: 2,
        height: 100,
        displayValue: true,
        fontOptions: "bold",
        font: "Arial",
        textMargin: 10,
        fontSize: 20,
        background: "#ffffff",
        lineColor: "#000000",
        margin: 10
      });

      // Fix: cast Buffer to Uint8Array for Response
      const pngBuffer = new Uint8Array(canvas.toBuffer('image/png'));
      
      return new Response(pngBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="barcode-${barcode.barcode}.png"`
        }
      });
    }
    
    // Multiple barcodes format: PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const barcodeWidth = 60;
    const barcodeHeight = 30;
    const cols = 3;
    const rows = 8;
    const horizontalSpacing = (pageWidth - (margin * 2) - (barcodeWidth * cols)) / (cols - 1);
    const verticalSpacing = 15;

    let currentRow = 0;
    let currentCol = 0;

    for (let i = 0; i < barcodes.length; i++) {
      const barcode = barcodes[i];
      
      if (currentRow >= rows) {
        pdf.addPage();
        currentRow = 0;
        currentCol = 0;
      }

      const x = margin + (currentCol * (barcodeWidth + horizontalSpacing));
      const y = margin + (currentRow * (barcodeHeight + verticalSpacing));

      const canvas = createCanvas(300, 150);
      JsBarcode(canvas, barcode.barcode, {
        format: "CODE128",
        width: 2,
        height: 80,
        displayValue: true,
        fontSize: 16,
        background: "#ffffff",
        lineColor: "#000000",
        margin: 5
      });

      const imageData = canvas.toDataURL('image/png');
      pdf.addImage(imageData, 'PNG', x, y, barcodeWidth, barcodeHeight);

      // Full data labels
      pdf.setFontSize(10);
      pdf.text(barcode.barcode, x + (barcodeWidth / 2), y + barcodeHeight + 5, { align: 'center' });
      pdf.setFontSize(8);
      pdf.text(`ID: #${barcode.barcode_id}`, x + (barcodeWidth / 2), y + barcodeHeight + 10, { align: 'center' });

      currentCol++;
      if (currentCol >= cols) {
        currentCol = 0;
        currentRow++;
      }
    }

    // Fix: Access getNumberOfPages through internal or any cast
    const totalPages = (pdf as any).internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      pdf.setPage(p);
      pdf.setFontSize(8);
      pdf.text(
        `Page ${p} of ${totalPages} • Generated: ${new Date().toLocaleDateString()} • Total: ${barcodes.length} barcodes`,
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      );
    }

    // Fix: cast arraybuffer to Uint8Array for Response
    const pdfBuffer = new Uint8Array(pdf.output('arraybuffer'));
    
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="barcodes-batch-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    });

  } catch (error: any) {
    console.error('Barcode download error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate barcode images', details: error.message },
      { status: 500 }
    );
  }
}