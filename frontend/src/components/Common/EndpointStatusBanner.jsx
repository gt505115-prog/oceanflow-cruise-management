import React from 'react';
import { Database, CheckCircle2, WifiOff } from 'lucide-react';
export default function EndpointStatusBanner({ isLiveBackend, resourceName }) {
 return <div className={`of-api-banner ${isLiveBackend ? 'live' : 'local'}`}><span><Database size={16}/><b>{resourceName}</b></span>{isLiveBackend?<em><CheckCircle2 size={15}/>Dữ liệu trực tiếp</em>:<em><WifiOff size={15}/>Chưa kết nối dữ liệu</em>}</div>
}
