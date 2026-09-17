import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, CalendarDays, CheckCircle2, Clock, RefreshCw, Ship, Users } from 'lucide-react';
import apiClient from '../api/client';
import { activitiesApi, cruiseToursApi } from '../api/cruiseApi';
import EndpointStatusBanner from '../components/Common/EndpointStatusBanner';
import heroImg from '../assets/oceanflow-hero.svg';

const formatNumber = (value) => Number(value || 0).toLocaleString('vi-VN');
const formatDate = (value) => value
  ? new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  : 'Chưa có';
const getStatusText = (value) => ({
  planned: 'Đang lập kế hoạch', active: 'Đang khai thác', completed: 'Đã hoàn thành',
  cancelled: 'Đã hủy', scheduled: 'Đã lên lịch', delayed: 'Bị trễ',
}[String(value || '').toLowerCase()] || value || 'Chưa xác định');

function Metric({ icon: Icon, label, value, note, onClick, accent = '' }) {
  return <button className="of-kpi-card" onClick={onClick} style={{ textAlign: 'left', cursor: onClick ? 'pointer' : 'default' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><small>{label}</small><span style={{ color: accent || '#0ea5e9' }}><Icon size={20} /></span></div>
    <b>{formatNumber(value)}</b><div className="of-muted" style={{ marginTop: 5 }}>{note}</div>
  </button>;
}

export default function DashboardPage({ onNavigate }) {
  const [data, setData] = useState({ summary: null, tours: [], schedules: [], ports: [], activities: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = async () => { 
    setLoading(true); setError('');
    const results = await Promise.allSettled([
      apiClient.get('/api/v1/operations/summary'), cruiseToursApi.getAll(), activitiesApi.getAll(),
      apiClient.get('/api/v1/activity-schedules'), apiClient.get('/api/v1/cruise-stops'),
    ]);
    const [summary, tours, activities, schedules, stops] = results;
    setData({
      summary: summary.status === 'fulfilled' ? summary.value.data : null,
      tours: tours.status === 'fulfilled' ? tours.value.data : [],
      activities: activities.status === 'fulfilled' ? activities.value.data : [],
      schedules: schedules.status === 'fulfilled' ? schedules.value.data : [],
      ports: stops.status === 'fulfilled' ? stops.value.data : [],
    });
    if (results.some((result) => result.status === 'rejected')) setError('Một số dữ liệu chưa tải được. Các khu vực còn lại vẫn hiển thị bình thường.');
    setLoading(false);
  };
  const getCruiseProgress = (tour) => {
    if (!tour?.start_date || !tour?.end_date) return 0;
    const start = new Date(tour.start_date).getTime();
    const end = new Date(tour.end_date).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
    return Math.round(Math.min(100, Math.max(0, ((Date.now() - start) / (end - start)) * 100)));
  };
  useEffect(() => { load(); }, []);
  const summary = data.summary || {};
  const currentTour = data.tours.find((tour) => tour.status === 'active') || data.tours[0];
  const upcomingActivities = data.schedules.slice().sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)).slice(0, 5);
  const flow = ['Chuyến du thuyền', 'Lịch trình', 'Cảng', 'Hoạt động', 'Dịch vụ', 'Hành khách', 'Booking', 'Đối soát'];

  if (loading) return <div className="of-card of-card-pad"><div className="of-section-title">TỔNG QUAN VẬN HÀNH</div><h1 className="of-h1">Đang tải dữ liệu từ hệ thống...</h1><p className="of-muted">OceanFlow đang lấy thông tin thực tế từ backend. Vui lòng chờ trong giây lát.</p></div>;
  return <div style={{ display: 'grid', gap: 16 }}>
        <section className="of-dashboard-hero">
      <img src={heroImg} alt="Du thuyền OceanFlow trên biển lúc hoàng hôn" />
      <div className="of-dashboard-hero-overlay" />
      <div className="of-dashboard-hero-copy">
        <span className="of-dashboard-hero-kicker">OCEANFLOW OPERATIONS</span>
        <h2>Điều phối hành trình<br />trải nghiệm trên biển.</h2>
        <p>{currentTour?.name || 'Trung tâm vận hành du thuyền'}</p>
      </div>
      <div className="of-dashboard-hero-live"><span className="of-live-dot" /> Dữ liệu vận hành trực tuyến</div>
      <div className="of-dashboard-hero-stats"><span><b>{formatNumber(summary.tours)}</b> chuyến</span><span><b>{formatNumber(summary.passengers)}</b> hành khách</span><span><b>{formatNumber(summary.schedules)}</b> lịch hoạt động</span></div>
    </section><div className="of-admin-heading"><div><h1>Tổng quan vận hành</h1><p>Điều phối hành trình, hành khách và dịch vụ OceanFlow.</p></div><button className="of-primary" onClick={load}><RefreshCw size={16} /> Làm mới dữ liệu</button></div>
    <div className="of-admin-stepper">{flow.map((item, index) => <React.Fragment key={item}><span>{item}</span>{index < flow.length - 1 && <ArrowRight size={13} />}</React.Fragment>)}</div>
    {error && <div className="of-alert"><AlertTriangle size={17} /><span>{error}</span></div>}
    <EndpointStatusBanner isLiveBackend={!!data.summary} resourceName="Số liệu tổng quan" />
    <div className="of-kpi">
      <Metric icon={Ship} label="Chuyến du thuyền" value={summary.tours} note="Bản ghi đã lưu" onClick={() => onNavigate('tours')} />
      <Metric icon={Users} label="Hành khách" value={summary.passengers} note={`${formatNumber(summary.bookings)} booking đang ghi nhận`} onClick={() => onNavigate('passengers')} accent="#7c3aed" />
      <Metric icon={CalendarDays} label="Lịch hoạt động" value={summary.schedules} note={`${formatNumber(summary.registrations)} lượt đăng ký`} onClick={() => onNavigate('activities')} accent="#059669" />
      <Metric icon={CheckCircle2} label="Check-in hoạt động" value={summary.checkins} note="Lượt check-in hợp lệ" onClick={() => onNavigate('activities')} accent="#16a34a" />
    </div>
    <section className="of-admin-cruise-panel"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}><div><div className="of-section-title">BỐI CẢNH HÀNH TRÌNH</div><h2 style={{ margin: '5px 0 0', fontSize: 19 }}>Chuyến đang theo dõi</h2></div><button className="of-link" onClick={() => onNavigate('tours')}>Xem chuyến du thuyền <ArrowRight size={15} /></button></div>
      {currentTour ? <div className="of-admin-tracked"><div><strong>{currentTour.name}</strong><div className="of-muted"><Ship size={14} style={{ verticalAlign: 'middle' }} /> {currentTour.ship || 'Chưa xác định tàu'} · {formatDate(currentTour.start_date)} — {formatDate(currentTour.end_date)}</div></div><span className="of-admin-status">{getStatusText(currentTour.status)}</span><div className="of-admin-route"><div><small>TIẾN ĐỘ HÀNH TRÌNH</small><strong>{getCruiseProgress(currentTour)}%</strong></div><div className="of-admin-progress"><span style={{ width: `${getCruiseProgress(currentTour)}%` }} /></div><div className="of-admin-route-label"><span>Điểm khởi hành đang cập nhật</span><ArrowRight size={14} /><span>Điểm đến đang cập nhật</span></div></div></div> : <div className="of-empty"><b>Chưa có chuyến du thuyền</b>Hãy tạo chuyến đầu tiên để bắt đầu lập lịch trình.</div>}
    </section>
    <div className="of-admin-split"><section className="of-card of-card-pad"><div className="of-admin-section-title">LỊCH HOẠT ĐỘNG GẦN NHẤT</div><h2 style={{ margin: '5px 0 14px', fontSize: 19 }}>Dòng thời gian vận hành</h2>
      {upcomingActivities.length ? <div className="of-timeline">{upcomingActivities.map((activity) => <div className="of-tl-item" key={activity.id}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><strong>{activity.activity_name || 'Hoạt động trên tàu'}</strong><span className="of-badge">{formatNumber(activity.registered_count)} / {formatNumber(activity.capacity)}</span></div><div className="of-muted"><Clock size={13} style={{ verticalAlign: 'middle' }} /> {formatDate(activity.starts_at)} · {activity.location || 'Chưa xác định địa điểm'}</div></div>)}</div> : <div className="of-empty"><b>Chưa có lịch hoạt động</b>Dữ liệu lịch trình sẽ xuất hiện tại đây.</div>}
    </section><section className="of-card of-card-pad"><div className="of-section-title">TÌNH TRẠNG DỊCH VỤ</div><h2 style={{ margin: '5px 0 14px', fontSize: 19 }}>Theo dõi nhanh</h2><div style={{ display: 'grid', gap: 10 }}>
      <Quick label="Tour tham quan bờ" value={summary.excursions} onClick={() => onNavigate('excursions')} /><Quick label="Đơn dịch vụ" value={summary.service_orders} onClick={() => onNavigate('services')} /><Quick label="Giao dịch POS" value={summary.pos_transactions} onClick={() => onNavigate('purchases')} /><Quick label="Số dư onboard" value={`${summary.outstanding_balance || '0'} USD`} onClick={() => onNavigate('expenses')} />
    </div><div className="of-muted" style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>Các chỉ số chỉ hiển thị khi backend có bản ghi tương ứng.</div></section></div>
  </div>;
}

function Quick({ label, value, onClick }) { return <button className="of-quick" onClick={onClick} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 12px', border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff', textAlign: 'left' }}><span style={{ fontSize: 13, color: '#cbd5e1' }}>{label}</span><strong style={{ color: '#f8fafc' }}>{typeof value === 'number' ? formatNumber(value) : value}</strong></button>; }