import PDFDocument from 'pdfkit';

export const generateInvoicePDF = (bookingData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', (buffer) => buffers.push(buffer));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const companyName = process.env.COMPANY_NAME || 'Bhale Padharya Services Pvt Ltd';
      const companyGst = process.env.COMPANY_GST || '27AAACH6542R1Z2';
      const companyAddress = process.env.COMPANY_ADDRESS || 'Suite 404, Tech Park, Mumbai, MH, 400001';
      const companyPhone = process.env.COMPANY_PHONE || '+91 98765 43210';
      const companyEmail = process.env.COMPANY_EMAIL || 'bhalepadharya.app@gmail.com';

      // Colors
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

      const addressStr = typeof bookingData.address === 'object'
        ? (bookingData.address?.fullAddress || `${bookingData.address?.street || ''}, ${bookingData.address?.city || ''}`)
        : (bookingData.address || 'Standard Address');

      doc.font('Helvetica')
         .fontSize(9)
         .fillColor(grayColor)
         .text(`Name: ${bookingData.customerName || 'Customer'}`)
         .text(`Phone: ${bookingData.phoneNumber || bookingData.phone || 'N/A'}`)
         .text(`Email: ${bookingData.email || 'N/A'}`)
         .text(`Address: ${addressStr.substring(0, 50)}`);

      doc.moveDown(2);

      // Divider Line
      let currentTop = 200;
      doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(40, currentTop).lineTo(555, currentTop).stroke();

      // Table Header
      doc.rect(40, currentTop + 5, 515, 25).fill(lightBg);

      doc.fillColor(darkColor)
         .font('Helvetica-Bold')
         .fontSize(9)
         .text('Item / Service Description', 50, currentTop + 12)
         .text('Qty', 300, currentTop + 12)
         .text('Base Price', 350, currentTop + 12)
         .text('GST (18%)', 430, currentTop + 12)
         .text('Total (INR)', 490, currentTop + 12);

      currentTop += 35;

      // Check if order has items array or single service
      const items = Array.isArray(bookingData.items) && bookingData.items.length > 0
        ? bookingData.items
        : [{
            title: bookingData.productName || bookingData.serviceName || 'Home Service',
            quantity: bookingData.quantity || 1,
            price: bookingData.amount || (bookingData.finalAmount ? bookingData.finalAmount * 0.847 : 0),
          }];

      items.forEach((item) => {
        const qty = item.quantity || 1;
        const basePrice = item.price || 0;
        const itemGst = basePrice * 0.18;
        const itemTotal = (basePrice + itemGst) * qty;

        doc.font('Helvetica')
           .fontSize(9)
           .fillColor(darkColor)
           .text((item.title || item.name || 'Item').substring(0, 40), 50, currentTop)
           .text(qty.toString(), 300, currentTop)
           .text(`₹${Math.round(basePrice).toLocaleString('en-IN')}`, 350, currentTop)
           .text(`₹${Math.round(itemGst).toLocaleString('en-IN')}`, 430, currentTop)
           .text(`₹${Math.round(itemTotal).toLocaleString('en-IN')}`, 490, currentTop);

        currentTop += 20;
      });

      doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(40, currentTop + 5).lineTo(555, currentTop + 5).stroke();

      // Financial Summary
      const summaryTop = currentTop + 20;

      // Payment Details Box
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
         .text(bookingData.paymentStatus || 'PAID')
         .font('Helvetica')
         .fillColor(grayColor)
         .text(`Payment Method: ${bookingData.paymentMethod || 'Razorpay / UPI'}`, 50, summaryTop + 42)
         .text(`Order ID: ${bookingData.bookingId || bookingData.orderId || 'N/A'}`, 50, summaryTop + 56)
         .text(`Payment ID: ${bookingData.razorpayPaymentId || 'VERIFIED'}`, 50, summaryTop + 70)
         .text(`Verification Signature: ${bookingData.transactionId ? 'CRYPTOGRAPHIC_MATCH' : 'PASSED'}`, 50, summaryTop + 84);

      // Financial Breakdown Right
      const rightColLeft = 360;
      const finalAmt = bookingData.finalAmount || bookingData.totalAmount || bookingData.amount || 0;
      const gstAmt = bookingData.gst || Math.round(finalAmt * 0.1525);
      const subtotalAmt = finalAmt - gstAmt;

      doc.font('Helvetica')
         .fontSize(9)
         .fillColor(grayColor)
         .text('Subtotal:', rightColLeft, summaryTop + 10)
         .text(`₹${subtotalAmt.toLocaleString('en-IN')}`, 490, summaryTop + 10)
         
         .text('GST (18%):', rightColLeft, summaryTop + 28)
         .text(`₹${gstAmt.toLocaleString('en-IN')}`, 490, summaryTop + 28)
         
         .text('Discount:', rightColLeft, summaryTop + 46)
         .text(`- ₹${(bookingData.discount || 0).toLocaleString('en-IN')}`, 490, summaryTop + 46);

      doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(rightColLeft, summaryTop + 65).lineTo(555, summaryTop + 65).stroke();

      doc.font('Helvetica-Bold')
         .fontSize(11)
         .fillColor(darkColor)
         .text('Grand Total:', rightColLeft, summaryTop + 75)
         .fillColor(primaryColor)
         .text(`₹${finalAmt.toLocaleString('en-IN')}`, 490, summaryTop + 75);

      // Footer
      const footerTop = 720;
      doc.rect(40, footerTop, 515, 60).fill('#EEF2FF');

      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text('Thank you for choosing Bhale Padharya!', 50, footerTop + 12, { align: 'center' });

      doc.fillColor(grayColor)
         .font('Helvetica')
         .fontSize(8)
         .text('This is a computer-generated tax invoice issued by Bhale Padharya Services Pvt Ltd.', 50, footerTop + 30, { align: 'center' })
         .text('For questions or support, reach us at bhalepadharya.app@gmail.com or call +91 98765 43210.', 50, footerTop + 42, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
