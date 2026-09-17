import React from 'react';
import { Anchor, Mail, Ship } from 'lucide-react';

export default function PassengerFooter({ onNavigate }) {
  return <footer className="pw-footer"><div className="pw-footer-brand"><span className="pw-brand-mark"><Ship size={19} /></span><div><strong>OCEAN<span>FLOW</span></strong><p>Hành trình tinh tế, ký ức dài lâu.</p></div></div><div className="pw-footer-links"><button onClick={() => onNavigate('cruises')}><Anchor size={15} /> Khám phá chuyến đi</button><button onClick={() => onNavigate('feedback')}><Mail size={15} /> Hỗ trợ hành khách</button></div><small>© 2026 OceanFlow. Trải nghiệm du thuyền của bạn, theo cách riêng.</small></footer>;
}