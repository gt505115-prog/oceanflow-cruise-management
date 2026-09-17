import React from 'react';
import { AlertTriangle, Inbox, Loader2, RefreshCw } from 'lucide-react';

export function PageHeader({ kicker, title, description, actions }) {
  return (
    <section className="of-page-header of-card">
      <div className="of-page-header-content">
        <div className="of-page-header-copy">
          <div className="of-section-title">{kicker}</div>
          <h1 className="of-h1" style={{ margin: '8px 0' }}>{title}</h1>
          <p className="of-muted" style={{ maxWidth: 760 }}>{description}</p>
        </div>
        {actions && <div className="of-page-header-actions">{actions}</div>}
      </div>
      <div className="of-page-header-art" aria-hidden="true" />
    </section>
  );
}

export function LoadingState({ text = 'Đang tải dữ liệu từ hệ thống...' }) {
  return (
    <div className="of-card of-card-pad" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <Loader2 size={18} className="spinner-icon" />
      <span className="of-muted">{text}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="of-alert">
      <AlertTriangle size={17} />
      <span style={{ flex: 1 }}>{message || 'Không thể tải dữ liệu. Vui lòng thử lại.'}</span>
      {onRetry && <button className="of-primary" onClick={onRetry}><RefreshCw size={15} /> Thử lại</button>}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="of-card of-empty">
      <Inbox size={28} style={{ color: '#0ea5e9', marginBottom: 8 }} />
      <b>{title}</b>
      <p className="of-muted" style={{ margin: '0 auto 12px', maxWidth: 520 }}>{description}</p>
      {action}
    </div>
  );
}

export function StatusBadge({ value, map }) {
  const label = (map && map[String(value || '').toLowerCase()]) || value || 'Chưa xác định';
  const tone = /hủy|lỗi|thất bại/i.test(label) ? 'error' : /hoàn thành|đã lên|đang khai|đã thanh|đã đối|thành công|live/i.test(label) ? 'ok' : /lập kế hoạch|trễ|cảnh báo|thiếu|chưa/i.test(label) ? 'warn' : '';
  return <span className={`of-badge ${tone}`}>{label}</span>;
}
