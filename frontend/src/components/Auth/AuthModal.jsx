import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { authApi } from '../../api/authApi';

const VI = {
  loginTitle: 'Đăng nhập hệ thống', registerTitle: 'Đăng ký tài khoản', account: 'Tài khoản OceanFlow',
  username: 'Tên đăng nhập', email: 'Email', password: 'Mật khẩu', confirmPassword: 'Xác nhận mật khẩu',
  processing: 'Đang xử lý...', login: 'Đăng nhập', createAccount: 'Tạo tài khoản',
  noAccount: 'Chưa có tài khoản?', hasAccount: 'Đã có tài khoản?', register: 'Đăng ký',
  loginSuccess: 'Đăng nhập thành công', registerSuccess: 'Tạo tài khoản thành công. Vui lòng đăng nhập.',
  passwordMismatch: 'Mật khẩu xác nhận không khớp', loginFailed: 'Đăng nhập không thành công', registerFailed: 'Không thể đăng ký tài khoản'
};

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [email, setEmail] = useState('');
  if (!isOpen) return null;
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccessMsg(''); setLoading(true);
    if (isLoginMode) {
      const res = await authApi.loginAdmin(username, password); setLoading(false);
      if (res.success) {
        const roles = res.data?.user?.roles || [];
        if (!roles.some((role) => String(role).toLowerCase() === 'admin')) { localStorage.removeItem('oceanflow_admin_token'); localStorage.removeItem('oceanflow_admin_user'); setError('Tài khoản không có quyền quản trị'); return; }
        setSuccessMsg(VI.loginSuccess); if (onAuthSuccess) onAuthSuccess({ username }); setTimeout(() => { onClose(); }, 1200);
      }
      else setError(res.error || VI.loginFailed);
    } else {
      if (password !== passwordConfirm) { setLoading(false); setError(VI.passwordMismatch); return; }
      const res = await authApi.signupPassenger(username, password); setLoading(false);
      if (res.success) { setSuccessMsg(VI.registerSuccess); setIsLoginMode(true); }
      else setError(res.error || VI.registerFailed);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl glass-dropdown border border-ocean-500/30 p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-ocean-900/60 transition-colors"><X className="w-5 h-5" /></button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ocean-600 to-ocean-400 flex items-center justify-center shadow-ocean-glow"><Shield className="w-5 h-5 text-white" /></div>
          <div><h3 className="text-lg font-bold text-white">{isLoginMode ? VI.loginTitle : VI.registerTitle}</h3><p className="text-xs text-ocean-300/80">{VI.account}</p></div>
        </div>
        {error && (<div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-400 min-w-[16px]" /><span>{error}</span></div>)}
        {successMsg && (<div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 min-w-[16px]" /><span>{successMsg}</span></div>)}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-xs font-medium text-slate-300 mb-1.5">{VI.username}</label><div className="relative"><User className="w-4 h-4 text-slate-400 absolute left-3 top-3" /><input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" className="w-full pl-9 pr-3 py-2 rounded-xl bg-ocean-900/80 border border-ocean-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ocean-400" /></div></div>
          {!isLoginMode && (<div><label className="block text-xs font-medium text-slate-300 mb-1.5">{VI.email}</label><div className="relative"><Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="operator@oceanflow.vn" className="w-full pl-9 pr-3 py-2 rounded-xl bg-ocean-900/80 border border-ocean-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ocean-400" /></div></div>)}
          <div><label className="block text-xs font-medium text-slate-300 mb-1.5">{VI.password}</label><div className="relative"><Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" /><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-xl bg-ocean-900/80 border border-ocean-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ocean-400" /></div></div>
          {!isLoginMode && (<div><label className="block text-xs font-medium text-slate-300 mb-1.5">{VI.confirmPassword}</label><div className="relative"><Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" /><input type="password" required value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-xl bg-ocean-900/80 border border-ocean-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ocean-400" /></div></div>)}
          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-400 hover:to-ocean-500 text-white font-semibold text-sm shadow-ocean-glow transition-all disabled:opacity-50 cursor-pointer mt-2">{loading ? VI.processing : isLoginMode ? VI.login : VI.createAccount}</button>
        </form>
        <div className="mt-4 pt-4 border-t border-ocean-800/80 flex items-center justify-between text-xs"><span className="text-slate-400">{isLoginMode ? VI.noAccount : VI.hasAccount}</span><button onClick={() => { setIsLoginMode(!isLoginMode); setError(''); setSuccessMsg(''); }} className="text-ocean-300 hover:text-white font-semibold cursor-pointer">{isLoginMode ? VI.register : VI.login}</button></div>
      </div>
    </div>
  );
}
