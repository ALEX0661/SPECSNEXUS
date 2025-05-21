import React, { useState, useEffect, useRef } from 'react';
import '../styles/MembershipModal.css';
import { getQRCode, uploadReceiptFile, updateMembershipReceipt } from '../services/membershipService';

const MembershipModal = ({ membership, onClose, onReceiptUploaded }) => {
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState(null);
  const [activeTab, setActiveTab] = useState("paymaya");
  const [qrPreviewUrl, setQrPreviewUrl] = useState(null);
  const [qrError, setQrError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReceiptLoading, setIsReceiptLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const token = localStorage.getItem('accessToken');
  const fileInputRef = useRef(null);

  const paymentMethods = ["paymaya", "gcash"];

  const fetchQRCodeData = async () => {
    setIsLoading(true);
    setQrError(null);
    try {
      const data = await getQRCode(activeTab, token);
      if (data && data.qr_code_url) {
        setQrPreviewUrl(data.qr_code_url.trim());
      } else {
        setQrPreviewUrl(null);
        setQrError(`No QR code available for ${activeTab}.`);
      }
    } catch (error) {
      console.error("Failed to fetch QR code:", error);
      setQrPreviewUrl(null);
      setQrError(error.response?.data?.detail || `Failed to load QR code for ${activeTab}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (membership.payment_status?.toLowerCase() !== "paid") {
      fetchQRCodeData();
    }
  }, [activeTab, token, membership]);

  useEffect(() => {
    if (membership.receipt_path) {
      setIsReceiptLoading(true);
      const trimmedPath = membership.receipt_path.trim();
      try {
        new URL(trimmedPath);
        setReceiptPreviewUrl(trimmedPath);
        setQrError(null);
      } catch {
        setQrError("Invalid receipt image URL.");
        setReceiptPreviewUrl(null);
      } finally {
        setIsReceiptLoading(false);
      }
    } else {
      setReceiptPreviewUrl(null);
      setIsReceiptLoading(false);
    }
  }, [membership]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setQrError("Please select an image file.");
        setSelectedReceipt(null);
        setReceiptPreviewUrl(null);
        return;
      }
      setSelectedReceipt(file);
      setReceiptPreviewUrl(URL.createObjectURL(file));
      setQrError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReceipt) {
      setQrError("No receipt file selected.");
      return;
    }

    try {
      setIsUploading(true);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 300);

      const uploadResponse = await uploadReceiptFile(selectedReceipt, token);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      const updatePayload = {
        membership_id: membership.id,
        payment_type: activeTab.toLowerCase(),
        receipt_path: uploadResponse.file_path,
      };
      const updateResponse = await updateMembershipReceipt(updatePayload, token);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setSelectedReceipt(null);
        setReceiptPreviewUrl(null);
        onReceiptUploaded(updateResponse);
        alert("Receipt uploaded successfully!");
      }, 500);
      
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      console.error("Receipt upload error:", error);
      setQrError(`Failed to upload receipt: ${error.response?.data?.detail || 'Unknown error'}`);
    }
  };

  const switchToNext = () => {
    const currentIndex = paymentMethods.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % paymentMethods.length;
    setActiveTab(paymentMethods[nextIndex]);
  };

  const switchToPrevious = () => {
    const currentIndex = paymentMethods.indexOf(activeTab);
    const prevIndex = (currentIndex - 1 + paymentMethods.length) % paymentMethods.length;
    setActiveTab(paymentMethods[prevIndex]);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const getPaymentMethodLabel = (method) => {
    return method === "gcash" ? "G-Cash" : method === "paymaya" ? "PayMaya" : method.charAt(0).toUpperCase() + method.slice(1);
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }) : "N/A";
  };

  // Function to open receipt in a new tab
  const openReceiptImage = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === "modal-overlay" && onClose()}>
      <div className="modal-container">
        <div className="payment-header">
          <div className="payment-name">
            {membership.payment_status?.toLowerCase() === "paid" ? "Membership Details" : getPaymentMethodLabel(activeTab)}
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close">×</button>
        </div>
        
        {membership.payment_status?.toLowerCase() === "paid" ? (
          <div className="membership-details-section">
            <h3 className="details-title">Membership Details</h3>
            <div className="details-grid">
              <div className="detail-card">
                <span className="detail-label">Requirement:</span>
                <span className="detail-value">{membership.requirement || "N/A"}</span>
              </div>
              <div className="detail-card">
                <span className="detail-label">Amount:</span>
                <span className="detail-value">₱{membership.amount || "0"}</span>
              </div>
              <div className="detail-card">
                <span className="detail-label">Payment Method:</span>
                <span className="detail-value">{membership.payment_method ? getPaymentMethodLabel(membership.payment_method) : "N/A"}</span>
              </div>
              <div className="detail-card">
                <span className="detail-label">Payment Date:</span>
                <span className="detail-value">{formatDate(membership.payment_date)}</span>
              </div>
              <div className="detail-card">
                <span className="detail-label">Approval Date:</span>
                <span className="detail-value">{formatDate(membership.approval_date)}</span>
              </div>
            </div>
            {membership.receipt_path && (
              <div className="receipt-preview-container">
                <p className="receipt-label"><strong>Receipt:</strong></p>
                {isReceiptLoading ? (
                  <div className="receipt-loading">Loading receipt...</div>
                ) : receiptPreviewUrl ? (
                  <img 
                    src={receiptPreviewUrl} 
                    alt="Receipt Preview" 
                    className="receipt-preview" 
                    style={{ width: '100px', cursor: 'pointer' }} // Thumbnail size and clickable cursor
                    onClick={() => openReceiptImage(receiptPreviewUrl)} // Open in new tab
                    onError={() => {
                      setQrError("Failed to load receipt image. Please try again or contact support.");
                      setReceiptPreviewUrl(null);
                    }} 
                  />
                ) : (
                  <div className="receipt-placeholder">Receipt image not available. Contact support if this persists.</div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className={membership.payment_status?.toLowerCase() === "denied" ? "denial-section" : ""}>
            {membership.payment_status?.toLowerCase() === "denied" && (
              <div className="denial-details">
                <h3 className="details-title">Payment Denied</h3>
                <div className="details-grid">
                  <div className="detail-card">
                    <span className="detail-label">Requirement:</span>
                    <span className="detail-value">{membership.requirement || "N/A"}</span>
                  </div>
                  <div className="detail-card">
                    <span className="detail-label">Amount:</span>
                    <span className="detail-value">₱{membership.amount || "0"}</span>
                  </div>
                  <div className="detail-card">
                    <span className="detail-label">Denial Reason:</span>
                    <span className="detail-value denial-reason">{membership.denial_reason || "No reason provided"}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="qr-container">
              {isLoading ? (
                <div className="qr-loading">Loading QR code...</div>
              ) : qrError ? (
                <div className="qr-error">{qrError}</div>
              ) : qrPreviewUrl ? (
                <>
                  <div className="scan-badge">SCAN ME</div>
                  <img 
                    src={qrPreviewUrl} 
                    alt="QR Code" 
                    className="qr-image" 
                    onError={() => setQrError(`Failed to load QR code image for ${activeTab}.`)} 
                  />
                </>
              ) : (
                <div className="qr-placeholder">No QR Code available</div>
              )}
              
              {paymentMethods.length > 1 && (
                <div className="navigation-arrows">
                  <button 
                    className="nav-arrow left" 
                    onClick={switchToPrevious} 
                    aria-label="Previous" 
                    disabled={isLoading}
                  >
                    &lt;
                  </button>
                  <button 
                    className="nav-arrow right" 
                    onClick={switchToNext} 
                    aria-label="Next" 
                    disabled={isLoading}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </div>
            <div className="instruction-section">
              <h3>Instructions</h3>
              <ol className="instruction-steps">
                <li>Scan the QR code with your {getPaymentMethodLabel(activeTab)} app</li>
                <li>Complete the payment for {membership.requirement || "membership"}</li>
                <li>Take a screenshot of your receipt</li>
                <li>Upload the receipt below</li>
              </ol>
            </div>
            <div className="upload-section">
              <div className="upload-label">Upload Payment Receipt</div>
              <button 
                className="upload-button" 
                onClick={handleUploadClick} 
                disabled={isUploading || isLoading}
              >
                <span className="upload-icon">+</span>
                <span>{selectedReceipt ? 'CHANGE FILE' : 'UPLOAD'}</span>
              </button>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
                ref={fileInputRef} 
                disabled={isUploading || isLoading}
              />
            </div>
            {receiptPreviewUrl && (
              <div className="receipt-preview-container">
                <img 
                  src={receiptPreviewUrl} 
                  alt="Receipt Preview" 
                  className="receipt-preview" 
                  style={{ width: '100px', cursor: 'pointer' }} // Thumbnail size and clickable cursor
                  onClick={() => openReceiptImage(receiptPreviewUrl)} // Open in new tab
                  onError={() => {
                    setQrError("Failed to load receipt preview image.");
                    setReceiptPreviewUrl(null);
                  }} 
                />
                {isUploading ? (
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <div className="progress-text">
                      Uploading... {uploadProgress}%
                    </div>
                  </div>
                ) : (
                  <button 
                    className="submit-receipt-btn" 
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    Submit Receipt
                  </button>
                )}
              </div>
            )}
            {qrError && (
              <div className="error-message">
                {qrError}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipModal;