import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (data: CCCDData) => void;
  onClose: () => void;
}

export interface CCCDData {
  cccdNumber: string;
  oldCmnd: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  issueDate: string;
}

export default function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // We only want to start the scanner once
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true
      },
      /* verbose= */ false
    );

    html5QrcodeScanner.render((decodedText) => {
      // Parse CCCD format
      // Format usually: 079099123456|123456789|NGUYEN VAN A|01011999|Nam|Dia chi|01012022
      try {
        const parts = decodedText.split('|');
        if (parts.length >= 6) {
          const data: CCCDData = {
            cccdNumber: parts[0] || '',
            oldCmnd: parts[1] || '',
            fullName: parts[2] || '',
            dateOfBirth: parts[3] || '',
            gender: parts[4] || '',
            address: parts[5] || '',
            issueDate: parts[6] || '',
          };
          html5QrcodeScanner.clear().catch(console.error);
          onScanSuccess(data);
        } else {
          setError('Mã QR không đúng định dạng CCCD Việt Nam');
        }
      } catch (err) {
        setError('Lỗi phân tích mã QR CCCD');
      }
    }, (err) => {
      // parse error, ignore as it scans continuously
    });

    return () => {
      html5QrcodeScanner.clear().catch(console.error);
    };
  }, [onScanSuccess]);

  return (
    <div style={{ padding: '1rem', background: '#fff', borderRadius: '0.5rem' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Quét mã QR trên Căn cước công dân</h3>
      {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
      <div id="qr-reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}></div>
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <button 
          onClick={onClose}
          style={{
            padding: '0.5rem 1rem',
            background: '#e2e8f0',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Hủy / Đóng quét
        </button>
      </div>
    </div>
  );
}
