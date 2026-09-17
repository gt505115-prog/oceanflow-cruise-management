import React from 'react';
import { ArrowRight, CalendarDays, ConciergeBell, MapPinned } from 'lucide-react';

export default function FeaturedServices({ activities, excursions, services, onNavigate }) {
  const items = [
    [CalendarDays, 'Hoạt động trên tàu', `${activities} lịch trải nghiệm`, 'Tận hưởng những khoảnh khắc đáng nhớ trên hành trình.', 'activities'],
    [MapPinned, 'Tour tham quan bờ', `${excursions} trải nghiệm`, 'Mở rộng hành trình bằng những điểm đến đặc sắc.', 'excursions'],
    [ConciergeBell, 'Dịch vụ onboard', `${services} dịch vụ`, 'Chăm sóc hành trình với những tiện ích được chọn lọc.', 'services'],
  ];
  return <section className="pw-section"><div className="pw-section-heading"><div><span className="pw-eyebrow">TRẢI NGHIỆM OCEANFLOW</span><h2>Dịch vụ nổi bật</h2></div><button className="pw-text-button" onClick={() => onNavigate('services')}>Khám phá dịch vụ <ArrowRight size={16} /></button></div><div className="pw-service-grid">{items.map(([Icon, title, count, text, page]) => <button className="pw-service-item" key={title} onClick={() => onNavigate(page)}><span className="pw-service-icon"><Icon size={21} /></span><small>{count}</small><h3>{title}</h3><p>{text}</p><ArrowRight className="pw-service-arrow" size={17} /></button>)}</div></section>;
}