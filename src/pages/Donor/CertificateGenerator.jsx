import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import {
  FaCertificate,
  FaDownload,
  FaShare,
  FaQrcode,
  FaCircleCheck,
  FaAward,
  FaCalendar,
  FaLocationDot,
  FaDroplet,
  FaCircleInfo,
  FaHeart,
  FaStar,
} from "react-icons/fa6";

const FONT = "'Inter','Segoe UI',system-ui,sans-serif";
const RED = "#C41230";
const GREEN = "#16A34A";
const BLUE = "#2563EB";
const GOLD = "#F59E0B";
const NAVY = "#0F172A";
const NAVY2 = "#1E293B";
const SLATE = "#334155";
const SLATE_L = "#64748B";
const BORDER = "#E2E8F0";
const SMOKE = "#F8FAFC";
const WHITE = "#FFFFFF";

const CertificateGenerator = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadCertificates();
    }
  }, [user]);

  const loadCertificates = async () => {
    try {
      const response = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/donor/${user.id}/certificates`);
      if (response.ok) {
        const data = await response.json();
        setCertificates(data);
      } else {
        // Try alternative endpoint
        const altResponse = await fetch(`https://hospital-resource-and-blood-bank.onrender.com/api/certificates?clerkId=${user.id}`);
        if (altResponse.ok) {
          const data = await altResponse.json();
          setCertificates(data);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading certificates:", error);
      setLoading(false);
    }
  };

  const handleDownload = (certificate) => {
    // Generate professional PDF certificate
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Background gradient effect
    pdf.setFillColor(255, 248, 240);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Decorative border
    pdf.setDrawColor(196, 18, 48);
    pdf.setLineWidth(2);
    pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
    pdf.setLineWidth(1);
    pdf.setDrawColor(245, 158, 11);
    pdf.rect(12, 12, pageWidth - 24, pageHeight - 24);

    // Header background
    pdf.setFillColor(196, 18, 48);
    pdf.rect(15, 15, pageWidth - 30, 45, 'F');

    // Header text
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CERTIFICATE OF APPRECIATION', pageWidth / 2, 30, { align: 'center' });

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Blood Donation Hero', pageWidth / 2, 42, { align: 'center' });

    // Award icon placeholder
    pdf.setFillColor(245, 158, 11);
    pdf.circle(pageWidth / 2, 70, 15, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.text('★', pageWidth / 2, 75, { align: 'center' });

    // Certificate content
    pdf.setTextColor(51, 51, 51);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('This is to proudly certify that', pageWidth / 2, 100, { align: 'center' });

    // Donor name
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(196, 18, 48);
    const donorName = certificate.donorName || `${user?.firstName} ${user?.lastName}`;
    pdf.text(donorName.toUpperCase(), pageWidth / 2, 115, { align: 'center' });

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(51, 51, 51);
    pdf.text('has generously donated blood and helped save lives', pageWidth / 2, 130, { align: 'center' });

    // Donation details
    pdf.setFillColor(245, 158, 11);
    pdf.roundedRect(pageWidth / 2 - 60, 140, 120, 40, 3, 3, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Donation Date', pageWidth / 2, 150, { align: 'center' });
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(new Date(certificate.donationDate).toLocaleDateString(), pageWidth / 2, 162, { align: 'center' });

    // Blood group badge
    pdf.setFillColor(196, 18, 48);
    pdf.roundedRect(pageWidth / 2 - 25, 190, 50, 25, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(certificate.bloodGroup, pageWidth / 2, 207, { align: 'center' });

    // Heart decoration
    pdf.setFillColor(196, 18, 48);
    pdf.setFontSize(30);
    pdf.text('❤', pageWidth / 2 - 40, 205);
    pdf.text('❤', pageWidth / 2 + 40, 205);

    // Thank you message
    pdf.setTextColor(51, 51, 51);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Your generous donation can save up to 3 lives.', pageWidth / 2, 230, { align: 'center' });
    pdf.text('Thank you for being a hero!', pageWidth / 2, 240, { align: 'center' });

    // Footer
    pdf.setDrawColor(196, 18, 48);
    pdf.setLineWidth(0.5);
    pdf.line(20, pageHeight - 40, pageWidth - 20, pageHeight - 40);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(102, 102, 102);
    pdf.text(`Certificate Number: ${certificate.certificateNumber}`, 25, pageHeight - 30);
    pdf.text(`Issued: ${new Date(certificate.issuedDate).toLocaleDateString()}`, pageWidth - 25, pageHeight - 30, { align: 'right' });
    pdf.text(`${certificate.bloodBankName || 'Blood Bank'}`, pageWidth / 2, pageHeight - 30, { align: 'center' });

    // Save PDF
    pdf.save(`blood-donation-certificate-${certificate.certificateNumber}.pdf`);
  };

  const handleShare = (certificate) => {
    if (navigator.share) {
      navigator.share({
        title: "My Blood Donation Certificate",
        text: `I'm proud to share my blood donation certificate! I donated blood on ${new Date(certificate.donationDate).toLocaleDateString()}. Join me in saving lives!`,
        url: window.location.href,
      });
    } else {
      alert("Sharing is not supported on this browser");
    }
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: SMOKE,
        fontFamily: FONT,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48,
            height: 48,
            border: "3px solid #E2E8F0",
            borderTopColor: RED,
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px",
          }} />
          <p style={{ color: SLATE_L, fontSize: "0.9rem" }}>Loading certificates...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: SMOKE, fontFamily: FONT, padding: "24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: 40 }}
        >
          <div style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: `${GOLD}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            color: GOLD,
            fontSize: "2.5rem",
          }}>
            <FaCertificate />
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: NAVY2, marginBottom: 8 }}>
            Donation Certificates
          </h1>
          <p style={{ fontSize: "1rem", color: SLATE_L }}>
            View, download, and share your blood donation certificates
          </p>
        </motion.div>

        {certificates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: WHITE,
              borderRadius: 16,
              border: `1px solid ${BORDER}`,
              padding: "60px 20px",
              textAlign: "center",
              color: SLATE_L,
            }}
          >
            <FaCertificate style={{ fontSize: "2.5rem", marginBottom: 20, color: GOLD }} />
            <p style={{ fontSize: "1rem" }}>No certificates yet</p>
            <p style={{ fontSize: "0.9rem", marginTop: 8 }}>
              Complete your first blood donation to earn your certificate
            </p>
          </motion.div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 24 }}>
            {certificates.map((certificate, index) => (
              <motion.div
                key={certificate._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  background: WHITE,
                  borderRadius: 16,
                  border: `1px solid ${BORDER}`,
                  overflow: "hidden",
                  transition: "all 0.3s",
                }}
                whileHover={{ transform: "translateY(-4px)", boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
              >
                {/* Certificate Preview */}
                <div style={{
                  background: `linear-gradient(135deg, ${RED} 0%, ${GOLD} 50%, ${RED} 100%)`,
                  padding: "32px",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  {/* Celebration decorations */}
                  <div style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    fontSize: "1.5rem",
                    color: "rgba(255,255,255,0.3)"
                  }}>🎉</div>
                  <div style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    fontSize: "1.5rem",
                    color: "rgba(255,255,255,0.3)"
                  }}>🎊</div>
                  <div style={{
                    position: "absolute",
                    bottom: 10,
                    left: 20,
                    fontSize: "1.2rem",
                    color: "rgba(255,255,255,0.3)"
                  }}>⭐</div>
                  <div style={{
                    position: "absolute",
                    bottom: 10,
                    right: 20,
                    fontSize: "1.2rem",
                    color: "rgba(255,255,255,0.3)"
                  }}>⭐</div>
                  <div style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    color: WHITE,
                    fontSize: "1.5rem",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
                  }}>
                    <FaAward />
                  </div>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: WHITE, margin: "0 0 8px 0", textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                    Certificate of Appreciation
                  </h3>
                  <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.95)", margin: 0 }}>
                    Blood Donation Hero ❤️
                  </p>
                </div>

                {/* Certificate Details */}
                <div style={{ padding: "24px" }}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: "0.85rem", color: SLATE_L, marginBottom: 4 }}>Donor Name</div>
                    <div style={{ fontSize: "1rem", fontWeight: 600, color: NAVY2 }}>
                      {certificate.donorName || `${user?.firstName} ${user?.lastName}`}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: "0.85rem", color: SLATE_L, marginBottom: 4 }}>Donation Date</div>
                      <div style={{ fontSize: "0.95rem", color: NAVY2, display: "flex", alignItems: "center", gap: 6 }}>
                        <FaCalendar style={{ color: RED, fontSize: "0.8rem" }} />
                        {new Date(certificate.donationDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.85rem", color: SLATE_L, marginBottom: 4 }}>Blood Group</div>
                      <div style={{
                        padding: "4px 10px",
                        borderRadius: 6,
                        background: `${RED}15`,
                        color: RED,
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        width: "fit-content",
                      }}>
                        {certificate.bloodGroup}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: "0.85rem", color: SLATE_L, marginBottom: 4 }}>Certificate Number</div>
                    <div style={{ fontSize: "0.95rem", color: NAVY2, fontFamily: "monospace" }}>
                      {certificate.certificateNumber}
                    </div>
                  </div>

                  <div style={{
                    padding: "12px",
                    background: `linear-gradient(135deg, ${GREEN}15 0%, ${GREEN}25 100%)`,
                    borderRadius: 8,
                    border: `1px solid ${GREEN}40`,
                    marginBottom: 20,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <FaCircleCheck style={{ color: GREEN }} />
                      <span style={{ fontSize: "0.9rem", color: NAVY2, fontWeight: 600 }}>
                        Verified Certificate
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      onClick={() => handleDownload(certificate)}
                      style={{
                        flex: 1,
                        padding: "12px 16px",
                        background: BLUE,
                        color: WHITE,
                        border: "none",
                        borderRadius: 8,
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = "#1D4ED8"}
                      onMouseOut={(e) => e.currentTarget.style.background = BLUE}
                    >
                      <FaDownload />
                      Download
                    </button>
                    <button
                      onClick={() => handleShare(certificate)}
                      style={{
                        flex: 1,
                        padding: "12px 16px",
                        background: SMOKE,
                        color: NAVY2,
                        border: `1px solid ${BORDER}`,
                        borderRadius: 8,
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = BORDER}
                      onMouseOut={(e) => e.currentTarget.style.background = SMOKE}
                    >
                      <FaLocationDot />
                      Share
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 40,
            padding: "24px",
            background: `${BLUE}10`,
            borderRadius: 12,
            border: `1px solid ${BLUE}30`,
          }}
        >
          <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: NAVY2, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <FaCircleInfo style={{ color: BLUE }} />
            About Donation Certificates
          </h4>
          <ul style={{ color: SLATE, fontSize: "0.95rem", lineHeight: 1.8, paddingLeft: 20 }}>
            <li>Certificates are automatically issued after each successful blood donation</li>
            <li>Each certificate has a unique verification number for authenticity</li>
            <li>You can download certificates as PDF files for your records</li>
            <li>Share your certificate on social media to inspire others to donate</li>
            <li>Certificates can be used for tax benefits in some countries</li>
          </ul>
        </motion.div>

        {/* Certificate Preview Modal */}
        {showPreview && selectedCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowPreview(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.8)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: WHITE,
                borderRadius: 16,
                maxWidth: 600,
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "40px",
                textAlign: "center",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
            >
              {/* Certificate Header */}
              <div style={{
                background: `linear-gradient(135deg, ${RED} 0%, ${GOLD} 50%, ${RED} 100%)`,
                padding: "40px",
                borderRadius: 12,
                marginBottom: 32,
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Celebration decorations */}
                <div style={{
                  position: "absolute",
                  top: 15,
                  left: 15,
                  fontSize: "2rem",
                  color: "rgba(255,255,255,0.3)"
                }}>🎉</div>
                <div style={{
                  position: "absolute",
                  top: 15,
                  right: 15,
                  fontSize: "2rem",
                  color: "rgba(255,255,255,0.3)"
                }}>🎊</div>
                <div style={{
                  position: "absolute",
                  bottom: 15,
                  left: 25,
                  fontSize: "1.5rem",
                  color: "rgba(255,255,255,0.3)"
                }}>⭐</div>
                <div style={{
                  position: "absolute",
                  bottom: 15,
                  right: 25,
                  fontSize: "1.5rem",
                  color: "rgba(255,255,255,0.3)"
                }}>⭐</div>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  color: WHITE,
                  fontSize: "2.5rem",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
                }}>
                  <FaAward />
                </div>
                <h2 style={{ fontSize: "2rem", fontWeight: 800, color: WHITE, margin: "0 0 8px 0", textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                  Certificate of Appreciation
                </h2>
                <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.95)", margin: 0 }}>
                  Blood Donation Hero ❤️
                </p>
              </div>

              {/* Certificate Body */}
              <div style={{ marginBottom: 32 }}>
                <p style={{ fontSize: "1.1rem", color: SLATE, lineHeight: 1.8, marginBottom: 24 }}>
                  This is to certify that
                </p>
                <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: NAVY2, marginBottom: 24 }}>
                  {selectedCertificate.donorName || `${user?.firstName} ${user?.lastName}`}
                </h3>
                <p style={{ fontSize: "1.1rem", color: SLATE, lineHeight: 1.8, marginBottom: 32 }}>
                  has successfully donated blood on
                </p>
                <div style={{
                  padding: "16px 24px",
                  background: `${RED}10`,
                  borderRadius: 8,
                  border: `1px solid ${RED}30`,
                  display: "inline-block",
                  marginBottom: 32,
                }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: RED }}>
                    {new Date(selectedCertificate.donationDate).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
                  <div>
                    <div style={{ fontSize: "0.9rem", color: SLATE_L, marginBottom: 4 }}>Blood Group</div>
                    <div style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      background: `${RED}15`,
                      color: RED,
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      display: "inline-block",
                    }}>
                      {selectedCertificate.bloodGroup}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.9rem", color: SLATE_L, marginBottom: 4 }}>Amount</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 600, color: NAVY2 }}>
                      450ml
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: "1rem", color: SLATE, lineHeight: 1.8, marginBottom: 32 }}>
                  This generous donation can save up to 3 lives. Thank you for being a hero and making a difference in our community! 🎉
                </p>
              </div>

              {/* Certificate Footer */}
              <div style={{
                borderTop: `2px solid ${BORDER}`,
                paddingTop: 24,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "0.85rem", color: SLATE_L, marginBottom: 4 }}>Certificate Number</div>
                  <div style={{ fontSize: "1rem", fontWeight: 600, color: NAVY2, fontFamily: "monospace" }}>
                    {selectedCertificate.certificateNumber}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.85rem", color: SLATE_L, marginBottom: 4 }}>Issued Date</div>
                  <div style={{ fontSize: "1rem", fontWeight: 600, color: NAVY2 }}>
                    {new Date(selectedCertificate.issuedDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* QR Code Placeholder */}
              <div style={{
                marginTop: 32,
                padding: "20px",
                background: SMOKE,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
              }}>
                <FaQrcode style={{ fontSize: "2rem", color: SLATE_L }} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: NAVY2 }}>Scan to Verify</div>
                  <div style={{ fontSize: "0.85rem", color: SLATE_L }}>
                    QR code for certificate verification
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
                <button
                  onClick={() => handleDownload(selectedCertificate)}
                  style={{
                    flex: 1,
                    padding: "14px 24px",
                    background: BLUE,
                    color: WHITE,
                    border: "none",
                    borderRadius: 8,
                    fontSize: "1rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <FaDownload />
                  Download PDF
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  style={{
                    padding: "14px 24px",
                    background: SMOKE,
                    color: NAVY2,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 8,
                    fontSize: "1rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CertificateGenerator;
