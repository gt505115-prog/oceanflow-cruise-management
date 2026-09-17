import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, Ship, Compass } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import heroImg from '../../assets/oceanflow-hero.svg';
import './PassengerAuth.css';

export default function PassengerLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdminLogin = searchParams.get('audience') === 'admin';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState({type: '', message: ''});
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setState({type: 'error', message: 'Vui lòng nhập tên đăng nhập và mật khẩu.'});
      return;
    }
    setLoading(true); setState({type: '', message: ''});
    const result = isAdminLogin
      ? await authApi.loginAdmin(cleanUsername, password)
      : await authApi.loginPassenger(cleanUsername, password);
    setLoading(false);
    if (!result.success) {
      setState({type: 'error', message: result.error || 'Đăng nhập không thành công.'});
      return;
    }
    const roles = result.data?.user?.roles || [];
    const hasAdminRole = roles.some((r) => String(r).toLowerCase() === 'admin');
    const hasPassengerRole = roles.some((r) => String(r).toLowerCase() === 'passenger');
    if (isAdminLogin && !hasAdminRole) {
      localStorage.removeItem('oceanflow_admin_token'); localStorage.removeItem('oceanflow_admin_user');
      setState({type: 'error', message: 'Tài khoản không có quyền quản trị.'});
      return;
    }
    if (!isAdminLogin && !hasPassengerRole) {
      localStorage.removeItem('oceanflow_passenger_token'); localStorage.removeItem('oceanflow_passenger_user');
      localStorage.removeItem('oceanflow_passenger'); localStorage.removeItem('currentPassenger');
      setState({type: 'error', message: 'Tài khoản không có quyền hành khách.'});
      return;
    }
    setState({type: 'success', message: 'Đăng nhập thành công.'});
    setTimeout(() => navigate(isAdminLogin ? '/admin/overview' : '/profile', {replace: true}), 500);
  };

  return (
    <main className="pw-auth-page">
      <div className="pw-auth-visual" aria-hidden="true">
        <img src={heroImg} alt="" className="pw-auth-visual-img" />
        <div className="pw-auth-overlay" aria-hidden="true" />
        <div className="pw-auth-visual-copy">
          <span className="pw-eyebrow"><Compass size={15}/> OCEANFLOW VOYAGES</span>
          <h2>Hành trình tinh tế, ký ức dài lâu</h2>
          <p>Quản lý dịch vụ và hoạt động du thuyền một cách chuyên nghiệp, hiện đại.</p>
        </div>
      </div>
      <section className="pw-auth-card">
        <div className="pw-auth-brand"><span className="pw-auth-brand-mark"><Ship size={19}/></span> OCEAN<span style={{color: '#087ea4'}}>FLOW</span></div>
        <h1>{isAdminLogin ? 'Đăng nhập quản trị' : 'Đăng nhập'}</h1>
        <p>{isAdminLogin ? 'Sử dụng tài khoản có role Admin để truy cập hệ thống quản trị.' : 'Truy cập hồ sơ và quản lý hành trình OceanFlow của bạn.'}</p>
        {state.message && <div className={`pw-auth-status ${state.type}`}>{state.message}</div>}
        <form className="pw-auth-form" onSubmit={submit}>
          <label>Tên đăng nhập<input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Nhập email đã đăng ký" autoComplete="username" required /></label>
          <label>Mật khẩu<div className="pw-auth-password"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e)=>setPassword(e.target.value)} autoComplete="current-password" required /><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'An mat khau':'Hien mat khau'}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>
          <button className="pw-button pw-button-primary pw-auth-submit" disabled={loading} type="submit">{loading?' Đang đăng nhập...':<><LogIn size={17}/> Đăng nhập</>}</button>
        </form>
        {!isAdminLogin && (
          <>
            <div className="pw-auth-divider">hoặc</div>
            <button className="pw-auth-secondary" type="button" onClick={()=>setState({type:'error',message:'Đăng nhập Google chưa được kết nối với backend.'})}>G Đăng nhập bằng Google</button>
            <p className="pw-auth-switch">Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
          </>
        )}
      </section>
    </main>
  );
}