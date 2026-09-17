import React from 'react';
import { ArrowRight, CalendarDays, Compass, Ship } from 'lucide-react';

export default function PassengerHero({ passenger, tour, onExplore, onItinerary }) {
  return (
    <section className="pw-hero">
      <div className="pw-hero-copy">
        <span className="pw-eyebrow"><Compass size={15} /> HÀNH TRÌNH ĐÁNG NHỚ BẮT ĐẦU TỪ ĐÂY</span>
        <h1>{passenger ? `Xin chào, ${passenger.first_name}` : 'Chạm vào đại dương, bắt đầu hành trình'}</h1>
        <p>Khám phá những chuyến du thuyền được tuyển chọn, lịch trình trên tàu và trải nghiệm dành riêng cho bạn.</p>
        <div className="pw-hero-actions">
          <button className="pw-button pw-button-primary" onClick={onExplore}>Khám phá chuyến đi <ArrowRight size={17} /></button>
          <button className="pw-button pw-button-quiet" onClick={onItinerary}><CalendarDays size={17} /> Xem lịch trình</button>
        </div>
      </div>
      <div className="pw-hero-vessel" aria-hidden="true"><Ship size={106} strokeWidth={1.2} /><span>OCEANFLOW<br /><b>VOYAGES</b></span></div>
      {tour && <div className="pw-hero-note"><small>CHUYẾN ĐANG ĐƯỢC QUAN TÂM</small><strong>{tour.name}</strong><span>{tour.ship || 'Tàu đang cập nhật'}</span></div>}
    </section>
  );
}