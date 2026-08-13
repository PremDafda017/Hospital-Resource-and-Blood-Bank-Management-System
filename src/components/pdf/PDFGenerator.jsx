import jsPDF from 'jspdf';

const FONT = "'Inter','Segoe UI',system-ui,sans-serif";
const RED = "#C41230";
const NAVY = "#0F172A";

export const generateInvoicePDF = (appointment, user) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Header
  doc.setFillColor(196, 18, 48);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth / 2, 25, { align: 'center' });
  
  // Company Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('HemoCare Hospital Services', 20, 55);
  doc.setFontSize(10);
  doc.text('Healthcare Excellence', 20, 62);
  doc.text('Phone: +91 1800-123-4567', 20, 69);
  doc.text('Email: support@hemocare.com', 20, 76);
  
  // Invoice Details
  doc.setFontSize(10);
  doc.text(`Invoice No: INV-${appointment.appointmentNumber || appointment.id}`, pageWidth - 20, 55, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 20, 62, { align: 'right' });
  doc.text(`Status: ${appointment.paymentStatus || 'Paid'}`, pageWidth - 20, 69, { align: 'right' });
  
  // Patient Information
  doc.setFillColor(240, 240, 240);
  doc.rect(20, 85, pageWidth - 40, 25, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Information', 25, 95);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${user?.fullName || appointment.patientName || 'Patient'}`, 25, 103);
  doc.text(`Email: ${user?.emailAddresses?.[0]?.emailAddress || appointment.patientEmail || ''}`, 25, 110);
  doc.text(`Phone: ${appointment.patientPhone || 'N/A'}`, 25, 117);
  
  // Appointment Details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Appointment Details', 20, 135);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Doctor: Dr. ${appointment.doctorName || appointment.doctor || 'N/A'}`, 20, 145);
  doc.text(`Hospital: ${appointment.hospitalName || appointment.hospital || 'N/A'}`, 20, 152);
  doc.text(`Department: ${appointment.department || appointment.speciality || 'General'}`, 20, 159);
  doc.text(`Date: ${appointment.appointmentDate || appointment.date || 'N/A'}`, 20, 166);
  doc.text(`Time: ${appointment.appointmentTime || appointment.time || 'N/A'}`, 20, 173);
  doc.text(`Appointment Type: ${appointment.type || 'Consultation'}`, 20, 180);
  
  // Payment Details Table
  doc.setFillColor(240, 240, 240);
  doc.rect(20, 190, pageWidth - 40, 10, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 25, 197);
  doc.text('Amount', pageWidth - 25, 197, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.text('Consultation Fee', 25, 210);
  doc.text('₹500', pageWidth - 25, 210, { align: 'right' });
  
  // Total
  doc.setDrawColor(196, 18, 48);
  doc.setLineWidth(0.5);
  doc.line(20, 220, pageWidth - 20, 220);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', pageWidth - 50, 230, { align: 'right' });
  doc.text('₹500', pageWidth - 25, 230, { align: 'right' });
  
  // Footer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for choosing HemoCare!', pageWidth / 2, pageHeight - 30, { align: 'center' });
  doc.text('This is a computer-generated invoice.', pageWidth / 2, pageHeight - 20, { align: 'center' });
  
  // Save the PDF
  doc.save(`invoice_${appointment.appointmentNumber || appointment.id}.pdf`);
};

export const generatePrescriptionPDF = (appointment, user) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Header
  doc.setFillColor(196, 18, 48);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('PRESCRIPTION', pageWidth / 2, 25, { align: 'center' });
  
  // Doctor & Hospital Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Dr. ${appointment.doctorName || appointment.doctor || 'Doctor'}`, 20, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(appointment.hospitalName || appointment.hospital || 'Hospital', 20, 62);
  doc.text(appointment.department || appointment.speciality || 'General Medicine', 20, 69);
  
  // Date
  doc.text(`Date: ${appointment.appointmentDate || appointment.date || new Date().toLocaleDateString()}`, pageWidth - 20, 55, { align: 'right' });
  doc.text(`Appointment ID: ${appointment.appointmentNumber || appointment.id}`, pageWidth - 20, 62, { align: 'right' });
  
  // Patient Information
  doc.setFillColor(240, 240, 240);
  doc.rect(20, 80, pageWidth - 40, 25, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Information', 25, 90);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${user?.fullName || appointment.patientName || 'Patient'}`, 25, 98);
  doc.text(`Age/Sex: Not specified`, 25, 105);
  
  // Prescription Content
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Rx', 20, 125);
  
  // Diagnosis
  if (appointment.prescription?.diagnosis) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Diagnosis:', 20, 138);
    
    doc.setFont('helvetica', 'normal');
    const diagnosisLines = doc.splitTextToSize(appointment.prescription.diagnosis, pageWidth - 40);
    doc.text(diagnosisLines, 20, 145);
  }
  
  // Medicines
  if (appointment.prescription?.medicines && appointment.prescription.medicines.length > 0) {
    let yPos = appointment.prescription?.diagnosis ? 160 : 145;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Medicines:', 20, yPos);
    yPos += 10;
    
    doc.setFont('helvetica', 'normal');
    appointment.prescription.medicines.forEach((med, index) => {
      doc.text(`${index + 1}. ${med.name}`, 25, yPos);
      yPos += 7;
      doc.text(`   Dosage: ${med.dosage}`, 25, yPos);
      yPos += 7;
      doc.text(`   Duration: ${med.duration}`, 25, yPos);
      yPos += 10;
    });
  }
  
  // Notes
  if (appointment.prescription?.notes) {
    const yPos = appointment.prescription?.medicines ? 200 : 170;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Additional Notes:', 20, yPos);
    
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(appointment.prescription.notes, pageWidth - 40);
    doc.text(notesLines, 20, yPos + 10);
  }
  
  // Follow-up
  if (appointment.followUpDate) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Follow-up Date: ${appointment.followUpDate}`, 20, pageHeight - 50);
  }
  
  // Footer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('This is a computer-generated prescription. Please consult a doctor for any concerns.', pageWidth / 2, pageHeight - 30, { align: 'center' });
  doc.text('Signature: ___________________', pageWidth - 20, pageHeight - 20, { align: 'right' });
  
  // Save the PDF
  doc.save(`prescription_${appointment.appointmentNumber || appointment.id}.pdf`);
};

export const generateBloodRequestPDF = (bloodRequest, user) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Header
  doc.setFillColor(196, 18, 48);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('BLOOD REQUEST RECEIPT', pageWidth / 2, 25, { align: 'center' });
  
  // Request Details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Request Details', 20, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Request ID: BR-${bloodRequest.id}`, 20, 65);
  doc.text(`Date: ${bloodRequest.date}`, 20, 72);
  doc.text(`Status: ${bloodRequest.status}`, 20, 79);
  
  // Blood Information
  doc.setFillColor(240, 240, 240);
  doc.rect(20, 90, pageWidth - 40, 30, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Blood Information', 25, 100);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Blood Group: ${bloodRequest.bloodGroup}`, 25, 110);
  doc.text(`Units Required: ${bloodRequest.units}`, 25, 117);
  doc.text(`Urgency: ${bloodRequest.urgency}`, 25, 124);
  
  // Hospital Information
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Hospital Information', 20, 140);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Hospital: ${bloodRequest.hospital}`, 20, 150);
  
  // Patient Information
  doc.setFillColor(240, 240, 240);
  doc.rect(20, 160, pageWidth - 40, 25, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Information', 25, 170);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${user?.fullName || 'Patient'}`, 25, 180);
  doc.text(`Email: ${user?.emailAddresses?.[0]?.emailAddress || ''}`, 25, 187);
  
  // Payment Information
  if (bloodRequest.paymentStatus) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Information', 20, 205);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Status: ${bloodRequest.paymentStatus}`, 20, 215);
    doc.text(`Amount Paid: ₹${bloodRequest.paymentAmount || '0'}`, 20, 222);
    
    if (bloodRequest.homeDelivery) {
      doc.text(`Delivery: Home Delivery`, 20, 229);
      doc.text(`Delivery Address: ${bloodRequest.deliveryAddress || 'N/A'}`, 20, 236);
    }
  }
  
  // Footer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for using HemoCare Blood Bank Services!', pageWidth / 2, pageHeight - 30, { align: 'center' });
  doc.text('This is a computer-generated receipt.', pageWidth / 2, pageHeight - 20, { align: 'center' });
  
  // Save the PDF
  doc.save(`blood_request_${bloodRequest.id}.pdf`);
};