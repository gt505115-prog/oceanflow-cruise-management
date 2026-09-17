import React from 'react';
import { ArrowUpRight, CalendarDays, Clock3, Ship } from 'lucide-react';

const date = (value) => value ? new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Đang cập nhật';
const duration = (start, end) => {
  if (!start || !end) return 'Thời lượng đang cập nhật';
  const days = Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000) + 1);
  return `${days} ngày trên biển`;
};
const statusText = { planned: 'Đang lên kế hoạch', active: 'Đang khai thác', completed: 'Đã hoàn thành', cancelled: 'Đã hủy', scheduled: 'Đã lên lịch' };

export default function CruiseTourCard({ tour, onSelect, onBook }) {
  const tone = tour.status === 'cancelled' ? 'error' : tour.status === 'completed' ? 'success' : 'planned';
  const canBook = !['cancelled', 'completed'].includes(String(tour.status || '').toLowerCase());
  return (
    <article className="pw-tour-card">
      <div className="pw-tour-art"><Ship size={34} /><span>{tour.ship || 'OCEANFLOW VESSEL'}</span></div>
      <div className="pw-tour-content">
        <div className="pw-tour-top"><span className={`pw-status ${tone}`}>{statusText[tour.status] || tour.status || 'Đang cập nhật'}</span><span className="pw-tour-code">OF-{tour.id}</span></div>
        <h3>{tour.name}</h3>
        <div className="pw-tour-meta"><span><CalendarDays size={15} /> {date(tour.start_date)}</span><span><Clock3 size={15} /> {duration(tour.start_date, tour.end_date)}</span></div>
        <p><Ship size={15} /> {tour.ship || 'Tên tàu đang cập nhật'} · Điểm đến đang cập nhật</p>
        <div className="pw-tour-actions"><button className="pw-text-button" onClick={() => onSelect(tour)}>Xem chi tiết <ArrowUpRight size={16} /></button>{canBook && onBook && <button className="pw-button pw-button-primary pw-button-small" onClick={() => onBook(tour)}>Đặt chuyến</button>}</div>
      </div>
    </article>
  );
}