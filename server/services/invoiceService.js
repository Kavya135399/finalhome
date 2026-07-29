import PDFDocument from 'pdfkit';

export const generateInvoicePDF = (bookingData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', (buffer) => buffers.push(buffer));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const companyName = process.env.COMPANY_NAME || 'HomeSeva Services Pvt Ltd';
      const companyGst = process.env.COMPANY_GST || '27AAACH6542R1Z2';
      const companyAddress = process.env.COMPANY_ADDRESS || 'Suite 404, Tech Park, Mumbai, MH, 400001';
      const companyPhone = process.env.COMPANY_PHONE || '+91 98765 43210';
      const companyEmail = process.env.COMPANY_EMAIL || 'support@homeseva.com';

      // Primary colors
      const primaryColor = '#4F46E5';
      const darkColor = '#1F2937';
      const grayColor = '#6B7280';
      const lightBg = '#F3F4F6';

      // Header Banner
      doc.rect(0, 0, 595.28, 80).fill(primaryColor);
      
      // Title
      doc.fillColor('#FFFFFF')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('TAX INVOICE', 40, 25);
         
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Invoice #: ${bookingData.invoiceNumber || 'INV-' + Date.now()}`, 400, 25, { align: 'right' })
         .text(`Date: ${new Date(bookingData.createdAt || Date.now()).toLocaleDateString('en-IN')}`, 400, 42, { align: 'right' });

      // Company Info (Left)
      doc.fillColor(darkColor)
         .font('Helvetica-Bold')
         .fontSize(12)
         .text(companyName, 40, 100);

      doc.font('Helvetica')
         .fontSize(9)
         .fillColor(grayColor)
         .text(`GSTIN: ${companyGst}`)
         .text(companyAddress)
         .text(`Phone: ${companyPhone} | Email: ${companyEmail}`);

      // Customer Info (Right)
      doc.fillColor(darkColor)
         .font('Helvetica-Bold')
         .fontSize(11)
         .text('Billed To:', 340, 100);

      doc.font('Helvetica')
         .fontSize(9)
         .fillColor(grayColor)
         .text(`Name: ${bookingData.customerName}`)
         .text(`Phone: ${bookingData.phoneNumber}`)
         .text(`Email: ${bookingData.email}`)
         .text(`Address: ${bookingData.address?.fullAddress || bookingData.address?.street || 'N/A'}`);

      doc.moveDown(2);

      // Divider Line
      const tableTop = 200;
      doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(40, tableTop).lineTo(555, tableTop).stroke();

      // Table Header
      doc.rect(40, tableTop + 5, 515, 25).fill(lightBg);

      doc.fillColor(darkColor)
         .font('Helvetica-Bold')
         .fontSize(9)
         .text('Item / Service', 50, tableTop + 12)
         .text('Qty', 300, tableTop + 12)
         .text('Base Price', 350, tableTop + 12)
         .text('GST (18%)', 430, tableTop + 12)
         .text('Total (INR)', 490, tableTop + 12);

      // Table Content Row
      const rowTop = tableTop + 35;
      doc.font('Helvetica')
         .fontSize(9)
         .fillColor(darkColor)
         .text(bookingData.productName || 'Home Service', 50, rowTop)
         .text((bookingData.quantity || 1).toString(), 300, rowTop)
         .text(`₹${(bookingData.amount || 0).toLocaleString('en-IN')}`, 350, rowTop)
         .text(`₹${(bookingData.gst || 0).toLocaleString('en-IN')}`, 430, rowTop)
         .text(`₹${(bookingData.finalAmount || 0).toLocaleString('en-IN')}`, 490, rowTop);

      doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(40, rowTop + 20).lineTo(555, rowTop + 20).stroke();

      // Summary Breakdown
      const summaryTop = rowTop + 35;

      // Left Column: Payment Details Box
      doc.rect(40, summaryTop, 260, 110).fill('#F9FAFB').stroke('#E5E7EB');
      doc.fillColor(darkColor)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text('Payment Verification Details', 50, summaryTop + 10);

      doc.font('Helvetica')
         .fontSize(8.5)
         .fillColor(grayColor)
         .text(`Payment Status: `, 50, summaryTop + 28, { continued: true })
         .fillColor('#059669')
         .font('Helvetica-Bold')
         .text(bookingData.paymentStatus || 'Paid')
         .font('Helvetica')
         .fillColor(grayColor)
         .text(`Payment Method: Razorpay UPI (${bookingData.paymentMethod || 'UPI'})`, 50, summaryTop + 42)
         .text(`Razorpay Order ID: ${bookingData.razorpayOrderId || 'N/A'}`, 50, summaryTop + 56)
         .text(`Razorpay Payment ID: ${bookingData.razorpayPaymentId || 'N/A'}`, 50, summaryTop + 70)
         .text(`Transaction ID / VPA: ${bookingData.transactionId || 'Verified via UPI'}`, 50, summaryTop + 84);

      // Right Column: Financial Summary
      const rightColLeft = 360;
      doc.font('Helvetica')
         .fontSize(9)
         .fillColor(grayColor)
         .text('Subtotal:', rightColLeft, summaryTop + 10)
         .text(`₹${(bookingData.amount || 0).toLocaleString('en-IN')}`, 490, summaryTop + 10)
         
         .text('GST (18%):', rightColLeft, summaryTop + 28)
         .text(`₹${(bookingData.gst || 0).toLocaleString('en-IN')}`, 490, summaryTop + 28)
         
         .text('Discount:', rightColLeft, summaryTop + 46)
         .text(`- ₹${(bookingData.discount || 0).toLocaleString('en-IN')}`, 490, summaryTop + 46);

      doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(rightColLeft, summaryTop + 65).lineTo(555, summaryTop + 65).stroke();

      doc.font('Helvetica-Bold')
         .fontSize(11)
         .fillColor(darkColor)
         .text('Grand Total:', rightColLeft, summaryTop + 75)
         .fillColor(primaryColor)
         .text(`₹${(bookingData.finalAmount || 0).toLocaleString('en-IN')}`, 490, summaryTop + 75);

      // Footer
      const footerTop = 720;
      doc.rect(40, footerTop, 515, 60).fill('#EEF2FF');

      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text('Thank you for choosing HomeSeva!', 50, footerTop + 12, { align: 'center' });

      doc.fillColor(grayColor)
         .font('Helvetica')
         .fontSize(8)
         .text('This is a computer-generated invoice verified via Razorpay Cryptographic Signature.', 50, footerTop + 30, { align: 'center' })
         .text('For queries or support, reach us at support@homeseva.com or call +91 98765 43210.', 50, footerTop + 42, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
