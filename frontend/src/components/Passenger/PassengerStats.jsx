import React from 'react';
import { CalendarDays, Compass, Sparkles } from 'lucide-react';

export default function PassengerStats({ days, activities, excursions }) {
  const stats = [
    [CalendarDays, days, 'ngày hành trình', 'Lịch trình được cập nhật theo chuyến'],
    [Sparkles, activities, 'hoạt động trên tàu', 'Những trải nghiệm đang chờ bạn'],
    [Compass, excursions, 'trải nghiệm trên bờ', 'Khám phá điểm dừng theo cách riêng'],
  ];
  return <div className="pw-stats">{stats.map(([Icon, value, label, note]) => <div className="pw-stat" key={label}><Icon size={20} /><strong>{value}</strong><span>{label}</span><small>{note}</small></div>)}</div>;
}