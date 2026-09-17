import React from 'react';
import { LayoutDashboard, Ship, Route, Anchor, Users, CalendarDays, BookmarkCheck, ConciergeBell, MapPinned, CreditCard, WalletCards, BarChart3, Settings, ChevronRight, Menu } from 'lucide-react';

export const navSections = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard, category: 'Vận hành' },
  { id: 'tours', label: 'Chuyến du thuyền', icon: Ship, category: 'Hành trình' },
  { id: 'itineraries', label: 'Lịch trình', icon: Route, category: 'Hành trình' },
  { id: 'ports', label: 'Cảng và điểm dừng', icon: Anchor, category: 'Hành trình' },
  { id: 'passengers', label: 'Hành khách', icon: Users, category: 'Khách hàng' },
  { id: 'bookings', label: 'Booking', icon: BookmarkCheck, category: 'Khách hàng' },
  { id: 'activities', label: 'Hoạt động trên tàu', icon: CalendarDays, category: 'Dịch vụ' },
  { id: 'services', label: 'Dịch vụ trên tàu', icon: ConciergeBell, category: 'Dịch vụ' },
  { id: 'excursions', label: 'Tour tham quan bờ', icon: MapPinned, category: 'Dịch vụ' },
  { id: 'purchases', label: 'POS / Bán hàng', icon: CreditCard, category: 'Tài chính' },
  { id: 'expenses', label: 'Tài khoản onboard', icon: WalletCards, category: 'Tài chính' },
  { id: 'reports', label: 'Báo cáo & đối soát', icon: BarChart3, category: 'Tài chính' },
];
const groups = ['Vận hành','Hành trình','Khách hàng','Dịch vụ','Tài chính'];
export default function Sidebar({activeSection,onSelectSection,isCollapsed,onToggleCollapse}) {
 return <aside className={`of-sidebar ${isCollapsed?'collapsed':''}`}>
  <div className="of-brand" onClick={()=>onSelectSection('dashboard')}><span className="of-brand-mark"><Ship size={20}/></span><span className="of-brand-copy"><strong>OCEAN<span>FLOW</span></strong><small>Quản lý du thuyền</small></span></div>
  <button className="of-collapse" onClick={onToggleCollapse} aria-label="Thu gọn menu"><Menu size={17}/></button>
  <nav className="of-nav">{groups.map(group=><div className="of-nav-group" key={group}><div className="of-nav-label">{group}</div>{navSections.filter(x=>x.category===group).map(item=>{const Icon=item.icon; const active=activeSection===item.id; return <button key={item.id} className={`of-nav-item ${active?'active':''}`} onClick={()=>onSelectSection(item.id)} title={isCollapsed?item.label:''}><Icon size={18}/><span>{item.label}</span>{active&&<ChevronRight size={15}/>}</button>})}</div>)}</nav>
  <div className="of-sidebar-foot"><Settings size={16}/><span>Cài đặt hệ thống</span></div>
 </aside>
}
