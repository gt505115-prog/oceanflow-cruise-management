import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Ship, Calendar, X, Pencil, Trash2 } from 'lucide-react';
import { cruiseToursApi } from '../api/cruiseApi';
import apiClient from '../api/client';
import EndpointStatusBanner from '../components/Common/EndpointStatusBanner';
import { PageHeader, LoadingState, ErrorState, EmptyState, StatusBadge } from '../components/Common/PageStates';

const statusMap = { planned: 'Đang lập kế hoạch', active: 'Đang khai thác', completed: 'Đã hoàn thành', cancelled: 'Đã hủy' };
const fmt = (v) => (v ? new Date(v).toLocaleDateString('vi-VN') : 'Chưa có');

export default function CruiseToursPage() {
  const [tours, setTours] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', ship: '', start_date: '', end_date: '', status: 'planned' });
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [success, setSuccess] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    const res = await cruiseToursApi.getAll();
    setTours(res.data || []); setIsLive(res.isLiveBackend);
    if (res.error) setError(res.error);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => tours.filter((t) => {
    const q = query.trim().toLowerCase();
    const matchQ = !q || [t.name, t.ship, t.status].join(' ').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' || String(t.status).toLowerCase() === statusFilter.toLowerCase();
    return matchQ && matchStatus;
  }), [tours, query, statusFilter]);

  const startEdit = (tour) => { setEditing(tour); setForm({ name: tour.name || '', ship: tour.ship || '', start_date: tour.start_date || '', end_date: tour.end_date || '', status: tour.status || 'planned' }); setOpen(true); setError(''); setSuccess(''); };

  const remove = async (tour) => {
    const warning = 'CẢNH BÁO: Xóa chuyến du thuyền "' + tour.name + '"? Nếu chuyến chưa có Booking, hệ thống có thể đồng thời xóa lịch trình, ngày, điểm dừng và excursion liên quan. Hành động này không thể hoàn tác.';
    if (!window.confirm(warning)) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      const result = await cruiseToursApi.delete(tour.id);
      if (!result.success) {
        if (result.error?.toLowerCase().includes('booking')) throw new Error('Không thể xóa chuyến vì đã có Booking liên kết.');
        throw new Error(result.error || 'Không thể xóa chuyến du thuyền');
      }
      await load(); setSuccess('Đã xóa chuyến du thuyền.');
    } catch (err) { setError(err.response?.data?.error || err.message || 'Không thể xóa chuyến du thuyền'); }
    finally { setSaving(false); }
  };
  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = editing ? await cruiseToursApi.update(editing.id, form) : await cruiseToursApi.create(form);
      await load(); setSuccess(editing ? 'Đã cập nhật chuyến du thuyền.' : 'Đã tạo chuyến du thuyền.');
      setOpen(false);
      setForm({ name: '', ship: '', start_date: '', end_date: '', status: 'planned' });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Không thể tạo chuyến du thuyền');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {success && <div className="pw-form-status ok">{success}</div>}
      <PageHeader
        kicker="HÀNH TRÌNH"
        title="Chuyến du thuyền"
        description="Mỗi chuyến du thuyền là một hành trình vận hành độc lập. Từ đây, hệ thống liên kết lịch trình, cảng, hành khách và dịch vụ."
        actions={<button className="of-primary" onClick={() => setOpen(true)}><Plus size={16} /> Tạo chuyến mới</button>}
      />
      <div className="of-flow">
        <span>1. Chuyến du thuyền</span><span>2. Lịch trình theo ngày</span><span>3. Cảng / điểm dừng</span><span>4. Hành khách & Booking</span>
      </div>
      <EndpointStatusBanner isLiveBackend={isLive} resourceName="Chuyến du thuyền" />
      <div className="of-card of-card-pad" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <label className="of-search" style={{ flex: 1, minWidth: 220 }}><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên chuyến, tàu, trạng thái..." /></label>
        <select className="of-form" style={{ minWidth: 180 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">Tất cả trạng thái</option>
          <option value="planned">Đang lập kế hoạch</option>
          <option value="active">Đang khai thác</option>
          <option value="completed">Đã hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>
      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState title="Chưa có chuyến du thuyền" description="Tạo chuyến đầu tiên để bắt đầu xây dựng lịch trình, cảng và danh sách hành khách." action={<button className="of-primary" onClick={() => setOpen(true)}><Plus size={16} /> Tạo chuyến mới</button>} />
      )}
      {!loading && filtered.length > 0 && (
        <div className="of-card" style={{ overflow: 'hidden' }}>
          <table className="of-table">
            <thead><tr><th>Chuyến</th><th>Tàu</th><th>Thời gian</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td><strong>{t.name}</strong><div className="of-muted">ID #{t.id}</div></td>
                  <td><span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Ship size={14} />{t.ship || 'Chưa xác định'}</span></td>
                  <td><span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Calendar size={14} />{fmt(t.start_date)} — {fmt(t.end_date)}</span></td>
                  <td><StatusBadge value={t.status} map={statusMap} /></td><td><button className="of-secondary" onClick={() => startEdit(t)} disabled={saving}><Pencil size={14} /> Sửa</button></td><td><button className="of-secondary" onClick={() => remove(t)} disabled={saving} style={{color: "#b42318"}}><Trash2 size={14} /> Xóa</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {open && (
        <div className="of-modal" onClick={() => setOpen(false)}>
          <div className="of-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="of-modal-head"><h2>{editing ? 'Chỉnh sửa chuyến du thuyền' : 'Tạo chuyến du thuyền'}</h2><button className="of-modal-close" onClick={() => setOpen(false)}><X size={16} /></button></div>
            <form className="of-form" onSubmit={submit}>
              <label>Tên chuyến *<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ví dụ: Hải trình Hạ Long 5 ngày" required /></label>
              <label>Tàu<input value={form.ship} onChange={(e) => setForm({ ...form, ship: e.target.value })} placeholder="Ví dụ: OceanFlow Grand Voyager" /></label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label>Ngày bắt đầu<input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></label>
                <label>Ngày kết thúc<input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></label>
              </div>
              <label>Trạng thái<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="planned">Đang lập kế hoạch</option><option value="active">Đang khai thác</option><option value="completed">Đã hoàn thành</option><option value="cancelled">Đã hủy</option></select></label>
              <div className="of-actions"><button type="button" className="of-secondary" onClick={() => setOpen(false)}>Hủy</button><button type="submit" className="of-primary" disabled={saving}>{saving ? 'Đang lưu...' : editing ? 'Lưu thay đổi' : 'Lưu chuyến'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
