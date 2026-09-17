import React, {useState} from 'react';
import Sidebar, {navSections} from './Sidebar';
import TopNavbar from './TopNavbar';
import AuthModal from '../Auth/AuthModal';
import './AdminDashboard.css';
export default function AppLayout({activeSection,onSelectSection,children}) {
 const [collapsed,setCollapsed]=useState(false); const [auth,setAuth]=useState(false);
 const meta=navSections.find(x=>x.id===activeSection)||{label:'Tổng quan'};
 return <div className={`of-shell ${collapsed?'collapsed':''}`}><Sidebar activeSection={activeSection} onSelectSection={onSelectSection} isCollapsed={collapsed} onToggleCollapse={()=>setCollapsed(!collapsed)}/><div className="of-main"><TopNavbar activeSectionTitle={meta.label} onToggleSidebar={()=>setCollapsed(!collapsed)} onOpenAuthModal={()=>setAuth(true)} onReplayOpening={()=>{}}/><main className="of-content">{children}</main></div><AuthModal isOpen={auth} onClose={()=>setAuth(false)} onAuthSuccess={()=>{}}/></div>
}
