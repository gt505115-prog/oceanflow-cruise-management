import React from 'react';
import { ArrowRight, CalendarDays, MapPin } from 'lucide-react';

const date = (value) => value ? new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : 'Chưa có ngày';

export default function ItineraryPreview({ days, stops, onViewAll }) {
  const preview = days.slice().sort((a, b) => a.day_number - b.day_number).slice(0, 3);
  return (
    <section className="pw-section pw-itinerary-section">
      <div className="pw-section-heading"><div><span className="pw-eyebrow">HÀNH TRÌNH TRÊN BIỂN</span><h2>Lịch trình của bạn</h2></div><button className="pw-text-button" onClick={onViewAll}>Xem toàn bộ <ArrowRight size={16} /></button></div>
      {preview.length ? <div className="pw-itinerary-list">{preview.map((day) => { const dayStops = stops.filter((stop) => stop.itinerary_day_id === day.id); return <div className="pw-itinerary-row" key={day.id}><div className="pw-day-number">{day.day_number}</div><div><strong>Ngày {day.day_number}</strong><span><CalendarDays size={14} /> {date(day.service_date)}</span></div><p>{dayStops.length ? <><MapPin size={15} /> {dayStops.map((stop) => `Điểm dừng #${stop.port_id}`).join(' · ')}</> : 'Ngày hành trình trên biển'}</p></div>; })}</div> : <div className="pw-empty">Lịch trình sẽ xuất hiện sau khi chuyến đi được công bố.</div>}
    </section>
  );
}