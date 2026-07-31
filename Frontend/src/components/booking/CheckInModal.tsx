import React, { useState } from 'react';
import QRScanner, { CCCDData } from './QRScanner';
import { ConfirmBookingResponse } from '@/types/api';

interface CheckInModalProps {
  booking: ConfirmBookingResponse;
  onClose: () => void;
  onCheckIn: (bookingId: string, guests: GuestInput[]) => void;
}

export interface GuestInput {
  id?: string;
  fullName: string;
  identityCard: string; // CCCD number
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
}

export default function CheckInModal({ booking, onClose, onCheckIn }: CheckInModalProps) {
  const [guests, setGuests] = useState<GuestInput[]>([
    { fullName: booking.guestName, identityCard: '', phone: booking.guestPhone || '' } // Initial lead guest
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const [targetGuestIndex, setTargetGuestIndex] = useState<number | null>(null);

  const handleAddGuest = () => {
    setGuests([...guests, { fullName: '', identityCard: '' }]);
  };

  const handleRemoveGuest = (index: number) => {
    setGuests(guests.filter((_, i) => i !== index));
  };

  const handleGuestChange = (index: number, field: keyof GuestInput, value: string) => {
    const updated = [...guests];
    updated[index] = { ...updated[index], [field]: value };
    setGuests(updated);
  };

  const handleStartScan = (index: number) => {
    setTargetGuestIndex(index);
    setIsScanning(true);
  };

  const handleScanSuccess = (data: CCCDData) => {
    setIsScanning(false);
    if (targetGuestIndex !== null) {
      const updated = [...guests];
      
      // Parse DOB from DDMMYYYY to DD/MM/YYYY or leave it
      let dobFormatted = data.dateOfBirth;
      if (dobFormatted && dobFormatted.length === 8) {
        dobFormatted = `${dobFormatted.substring(0,2)}/${dobFormatted.substring(2,4)}/${dobFormatted.substring(4,8)}`;
      }

      updated[targetGuestIndex] = {
        ...updated[targetGuestIndex],
        fullName: data.fullName,
        identityCard: data.cccdNumber,
        gender: data.gender,
        dateOfBirth: dobFormatted,
        address: data.address
      };
      setGuests(updated);
      setTargetGuestIndex(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate empty fields
    const invalid = guests.some(g => !g.fullName.trim() || !g.identityCard.trim());
    if (invalid) {
      alert('Vui lòng điền đầy đủ Họ tên và CCCD cho tất cả khách lưu trú.');
      return;
    }
    onCheckIn(booking.bookingId, guests);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem'
    }}>
      <div style={{
        background: '#fff', borderRadius: '1rem', width: '100%', maxWidth: '700px',
        maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Nhận phòng (Check-in)</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#64748b' }}>&times;</button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {isScanning ? (
            <QRScanner 
              onScanSuccess={handleScanSuccess} 
              onClose={() => setIsScanning(false)} 
            />
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                <div style={{ fontWeight: 600, color: '#334155' }}>Mã đặt: <span style={{ color: '#0f172a' }}>{booking.bookingId}</span></div>
                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Phòng: {booking.accommodationCode || booking.categoryName}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Thông tin khách lưu trú</h3>
                <button 
                  type="button" 
                  onClick={handleAddGuest}
                  style={{
                    background: '#e0f2fe', color: '#0284c7', border: 'none', 
                    padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer',
                    fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>add</span>
                  Thêm khách
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {guests.map((guest, index) => (
                  <div key={index} style={{ border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1rem', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#334155' }}>Khách {index + 1}</div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          type="button"
                          onClick={() => handleStartScan(index)}
                          style={{
                            background: '#dcfce7', color: '#166534', border: 'none', 
                            padding: '0.25rem 0.75rem', borderRadius: '0.25rem', cursor: 'pointer',
                            fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem'
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>qr_code_scanner</span>
                          Quét CCCD
                        </button>
                        {guests.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => handleRemoveGuest(index)}
                            style={{
                              background: '#fee2e2', color: '#dc2626', border: 'none', 
                              padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer'
                            }}
                            title="Xóa"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.25rem' }}>Họ và tên *</label>
                        <input 
                          type="text" 
                          required
                          value={guest.fullName}
                          onChange={(e) => handleGuestChange(index, 'fullName', e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.25rem' }}>Số CCCD / Passport *</label>
                        <input 
                          type="text" 
                          required
                          value={guest.identityCard}
                          onChange={(e) => handleGuestChange(index, 'identityCard', e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontFamily: 'monospace' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.25rem' }}>Số điện thoại</label>
                        <input 
                          type="tel" 
                          value={guest.phone || ''}
                          onChange={(e) => handleGuestChange(index, 'phone', e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontFamily: 'monospace' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#475569', marginBottom: '0.25rem' }}>Ngày sinh (Tùy chọn)</label>
                        <input 
                          type="text" 
                          placeholder="DD/MM/YYYY"
                          value={guest.dateOfBirth || ''}
                          onChange={(e) => handleGuestChange(index, 'dateOfBirth', e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.25rem' }}>
                <button 
                  type="button" 
                  onClick={onClose}
                  style={{
                    padding: '0.65rem 1.25rem', background: '#fff', border: '1px solid #cbd5e1',
                    borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, color: '#475569'
                  }}
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  style={{
                    padding: '0.65rem 1.5rem', background: '#0b57d0', border: 'none', color: '#fff',
                    borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600
                  }}
                >
                  Xác nhận Check-in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
