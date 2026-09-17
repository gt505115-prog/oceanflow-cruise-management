import React from 'react';
import { Anchor, BookmarkCheck, CalendarDays, Menu, Ship, UserRound, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PassengerHeader({ currentPage, isOpen, onToggle }) {
  const navigate = useNavigate();
  const hasPassengerSession = Boolean(localStorage.getItem('oceanflow_passenger_token'));
  const links = [
    ['cruises', '/cruises', 'Khám phá chuyến đi', Anchor],
    ['itinerary', '/itinerary', 'Lịch trình', CalendarDays],
    ['services', '/services', 'Dịch vụ', Ship],
    ['activities', '/activities', 'Hoạt động trên tàu', CalendarDays],
    ['registrations', '/my-bookings', 'Booking của tôi', BookmarkCheck],
  ];
  const go = (path) => { navigate(path); if (isOpen) onToggle(); };

  return (
    <header className="pw-header">
      <button className="pw-brand" onClick={() => go('/')} aria-label="Về trang chủ OceanFlow">
        <span className="pw-brand-mark"><Ship size={19} /></span>
        <span>OCEAN<span>FLOW</span></span>
      </button>
      <nav className={`pw-nav ${isOpen ? 'is-open' : ''}`} aria-label="Điều hướng hành khách">
        {links.map(([id, path, label, Icon]) => (
          <button className={currentPage === id ? 'is-active' : ''} key={id} onClick={() => go(path)}>
            <Icon size={16} /> {label}
          </button>
        ))}
        <button className={currentPage === 'profile' ? 'is-active' : ''} onClick={() => go('/profile')}>
          <UserRound size={16} /> Hồ sơ
        </button>
        {!hasPassengerSession && <button onClick={() => go('/login')}><UserRound size={16} /> Đăng nhập / Đăng ký</button>}
      </nav>
      <button className="pw-menu-button" onClick={onToggle} aria-label="Mở menu">
        {isOpen ? <X size={21} /> : <Menu size={21} />}
      </button>
    </header>
  );
}