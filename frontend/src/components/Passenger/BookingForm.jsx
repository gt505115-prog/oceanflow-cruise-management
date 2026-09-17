import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import apiClient from '../../api/client';
import './PassengerBooking.css';

export default function BookingForm({ tour, passenger, onBack, onSuccess }) {
  const [cabinId, setCabinId] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' }); const [createdBooking, setCreatedBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (!passenger?.id) { setStatus({ type: 'error', message: 'Chưa xác định được hành khách hiện tại.' }); return; }
    if (!tour?.id) { setStatus({ type: 'error', message: 'Vui lòng chọn chuyến đi.' }); return; }
    const payload = { passenger_id: Number(passenger.id), cruise_tour_id: Number(tour.id) };
    if (cabinId.trim()) payload.cabin_id = Number(cabinId);
    if (cabinId.trim() && !Number.isInteger(payload.cabin_id)) { setStatus({ type: 'error', message: 'Số cabin phải là một mã số hợp lệ.' }); return; }
    setSubmitting(true); setStatus({ type: '', message: '' }); setCreatedBooking(null);
    try {
      const response = await apiClient.post('/api/v1/bookings', payload);
      setStatus({ type: 'success', message: 'Đặt chuyến thành công.' }); setCreatedBooking(response.data);
      onSuccess(response.data);
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.error || error.message || 'Không thể tạo booking.' });
    } finally { setSubmitting(false); }
  };
  return <section className="pw-booking-view"><button className="pw-text-button" onClick={onBack}><ArrowLeft size={16} /> Quay lại chi tiết</button><div className="pw-booking-card"><span className="pw-eyebrow">XÁC NHẬN HÀNH TRÌNH</span><h1>Đặt chuyến</h1><p className="pw-muted-text">{tour?.name} · {tour?.ship || 'Tên tàu đang cập nhật'}</p><form className="pw-booking-form" onSubmit={submit}><label>Mã booking<input value={createdBooking?.reference || 'Sẽ được hệ thống tự động cấp'} readOnly /></label><label>Mã cabin (không bắt buộc)<input value={cabinId} onChange={(event) => setCabinId(event.target.value)} placeholder="Nhập cabin nếu đã có" inputMode="numeric" /></label><div className="pw-booking-passenger"><small>HÀNH KHÁCH</small><strong>{passenger ? `${passenger.first_name} ${passenger.last_name}` : 'Chưa xác định'}</strong><span>ID hành khách: {passenger?.id || 'Chưa có'}</span></div>{status.message && <div className={`pw-form-status ${status.type}`}>{status.type === 'success' && <CheckCircle2 size={17} />}{status.message}</div>}<button type="submit" className="pw-button pw-button-primary" disabled={submitting}>{submitting ? <><Loader2 className="pw-spin" size={17} /> Đang gửi...</> : 'Xác nhận đặt chuyến'}</button></form></div></section>;
}