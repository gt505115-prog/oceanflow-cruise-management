import React, { useState } from 'react';
import { Eye, EyeOff, Ship, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './PassengerAuth.css';

export default function PassengerRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    identity: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [state, setState] = useState({
    type: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const update = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setState({
        type: 'error',
        message: 'Mật khẩu xác nhận không khớp.',
      });
      return;
    }

    if (!form.terms) {
      setState({
        type: 'error',
        message: 'Vui lòng đồng ý với điều khoản và chính sách.',
      });
      return;
    }

    if (!form.fullName.trim()) {
      setState({
        type: 'error',
        message: 'Vui lòng nhập họ và tên.',
      });
      return;
    }

    if (!form.email.trim()) {
      setState({
        type: 'error',
        message: 'Vui lòng nhập email.',
      });
      return;
    }

    setLoading(true);
    setState({
      type: '',
      message: '',
    });

    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: form.email.trim(),
          email: form.email.trim(),
          password: form.password,
          full_name: form.fullName.trim(),
          phone: form.phone.trim(),
          identity: form.identity.trim(),
          role: 'Passenger',
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.error || 'Không thể đăng ký tài khoản.'
        );
      }

      setState({
        type: 'success',
        message: 'Tạo tài khoản thành công. Vui lòng đăng nhập.',
      });

      setTimeout(() => {
        navigate('/login');
      }, 800);
    } catch (error) {
      setState({
        type: 'error',
        message: error.message || 'Không thể kết nối đến máy chủ.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pw-auth-page">
      <section className="pw-auth-card">
        <div className="pw-auth-brand">
          <span className="pw-auth-brand-mark">
            <Ship size={19} />
          </span>

          OCEAN
          <span style={{ color: '#38bdf8' }}>FLOW</span>
        </div>

        <h1>Tạo tài khoản hành khách</h1>

        <p>
          Đăng ký để theo dõi hành trình và thông tin chuyến đi.
        </p>

        {state.message && (
          <div className={`pw-auth-status ${state.type}`}>
            {state.message}
          </div>
        )}

        <form className="pw-auth-form" onSubmit={submit}>
          <label>
            Họ và tên

            <input
              value={form.fullName}
              onChange={(event) =>
                update('fullName', event.target.value)
              }
              placeholder="Nguyễn Văn An"
              required
            />
          </label>

          <label>
            Email

            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                update('email', event.target.value)
              }
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Số điện thoại

            <input
              value={form.phone}
              onChange={(event) =>
                update('phone', event.target.value)
              }
              placeholder="090..."
            />
          </label>

          <label>
            Số CCCD / Hộ chiếu

            <input
              value={form.identity}
              onChange={(event) =>
                update('identity', event.target.value)
              }
              placeholder="Đang cập nhật"
            />
          </label>

          <label>
            Mật khẩu

            <div className="pw-auth-password">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(event) =>
                  update('password', event.target.value)
                }
                minLength={8}
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                aria-label="Hiện hoặc ẩn mật khẩu"
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>
          </label>

          <label>
            Xác nhận mật khẩu

            <div className="pw-auth-password">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(event) =>
                  update('confirmPassword', event.target.value)
                }
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirm((current) => !current)
                }
                aria-label="Hiện hoặc ẩn xác nhận mật khẩu"
              >
                {showConfirm ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>
          </label>

          <label
            style={{
              display: 'flex',
              gridTemplateColumns: 'auto 1fr',
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 8,
              fontWeight: 400,
            }}
          >
            <input
              type="checkbox"
              checked={form.terms}
              onChange={(event) =>
                update('terms', event.target.checked)
              }
              required
              style={{
                width: 'auto',
                marginTop: 2,
              }}
            />

            Tôi đồng ý với Điều khoản và Chính sách bảo mật.
          </label>

          <div className="pw-auth-note">
            Thông tin họ tên sẽ được lưu vào hồ sơ hành khách khi đăng ký.
          </div>

          <button
            className="pw-button pw-button-primary pw-auth-submit"
            disabled={loading}
            type="submit"
          >
            {loading ? (
              'Đang tạo tài khoản...'
            ) : (
              <>
                <UserPlus size={17} />
                Tạo tài khoản
              </>
            )}
          </button>
        </form>

        <p className="pw-auth-switch">
          Đã có tài khoản?{' '}
          <Link to="/login">Đăng nhập ngay</Link>
        </p>
      </section>
    </main>
  );
}