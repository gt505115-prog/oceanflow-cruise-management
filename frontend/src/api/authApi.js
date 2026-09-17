import apiClient from './client';

const message = (err, fallback) =>
  err?.response?.data?.error ||
  err?.response?.data?.message ||
  err?.message ||
  fallback;

const clearPassengerSession = () => {
  localStorage.removeItem('oceanflow_passenger_token');
  localStorage.removeItem('oceanflow_passenger_user');
  localStorage.removeItem('oceanflow_passenger');
  localStorage.removeItem('currentPassenger');
};

const clearAdminSession = () => {
  localStorage.removeItem('oceanflow_admin_token');
  localStorage.removeItem('oceanflow_admin_user');
};

export const authApi = {
  // =====================================================
  // CHECK BACKEND
  // =====================================================

  checkRouter: async () => {
    try {
      const res = await apiClient.get('/health');

      return {
        success: true,
        data: res.data,
        status: res.status,
      };
    } catch (err) {
      return {
        success: false,
        error: message(err, 'Không thể kết nối máy chủ'),
        status: err.response?.status || 0,
      };
    }
  },

  // =====================================================
  // ADMIN LOGIN
  // =====================================================

  loginAdmin: async (username, password) => {
    try {
      clearAdminSession();

      const res = await apiClient.post('/api/v1/auth/login', {
        username: username.trim(),
        password,
      });

      if (res.data?.token) {
        localStorage.setItem(
          'oceanflow_admin_token',
          res.data.token,
        );

        localStorage.setItem(
          'oceanflow_admin_user',
          JSON.stringify(
            res.data.user || {
              username: username.trim(),
            },
          ),
        );
      }

      return {
        success: true,
        data: res.data,
      };
    } catch (err) {
      clearAdminSession();

      return {
        success: false,
        error: message(err, 'Đăng nhập không thành công'),
        status: err.response?.status || 0,
      };
    }
  },

  // =====================================================
  // PASSENGER LOGIN
  // =====================================================

  loginPassenger: async (username, password) => {
    try {
      // Xóa toàn bộ phiên Passenger cũ trước khi đăng nhập
      clearPassengerSession();

      const res = await apiClient.post('/api/v1/auth/login', {
        username: username.trim(),
        password,
      });

      const token = res.data?.token;

      if (!token) {
        return {
          success: false,
          error: 'Backend không trả về token đăng nhập.',
          status: res.status,
        };
      }

      let user = res.data?.user || {
        username: username.trim(),
      };

      // Lưu token trước khi gọi API lấy hồ sơ Passenger
      localStorage.setItem(
        'oceanflow_passenger_token',
        token,
      );

      /*
       * Lấy đúng hồ sơ Passenger của tài khoản hiện tại.
       *
       * Backend endpoint:
       * GET /api/v1/passengers/me
       *
       * Endpoint này dùng user_id trong JWT để tìm Passenger,
       * nên không bị lấy nhầm passenger của tài khoản khác.
       */
      try {
        const passengerRes = await apiClient.get(
          '/api/v1/passengers/me',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const passenger = passengerRes.data;

        if (passenger?.id) {
          // Bổ sung passenger_id vào user hiện tại
          user = {
            ...user,
            passenger_id: passenger.id,
            first_name: passenger.first_name || '',
            last_name: passenger.last_name || '',
            user_id: passenger.user_id || user.id,
          };

          // Lưu hồ sơ Passenger riêng
          localStorage.setItem(
            'oceanflow_passenger',
            JSON.stringify({
              id: passenger.id,
              user_id: passenger.user_id || user.id,
              first_name: passenger.first_name || '',
              last_name: passenger.last_name || '',
              cabin: passenger.cabin || null,
              status: passenger.status || 'booked',
            }),
          );

          // Tương thích với những component cũ
          localStorage.setItem(
            'currentPassenger',
            JSON.stringify(passenger),
          );
        }
      } catch (passengerErr) {
        /*
         * Không xóa token ngay tại đây.
         * Nếu endpoint /passengers/me chưa được backend cập nhật,
         * tài khoản vẫn đăng nhập được nhưng chưa lấy được profile.
         */
        console.warn(
          'Không thể lấy hồ sơ Passenger hiện tại:',
          passengerErr,
        );
      }

      // Lưu user sau khi đã bổ sung passenger_id
      localStorage.setItem(
        'oceanflow_passenger_user',
        JSON.stringify(user),
      );

      return {
        success: true,
        data: {
          ...res.data,
          user,
        },
      };
    } catch (err) {
      clearPassengerSession();

      return {
        success: false,
        error: message(err, 'Đăng nhập không thành công'),
        status: err.response?.status || 0,
      };
    }
  },

  // =====================================================
  // PASSENGER REGISTER
  // =====================================================

  signupPassenger: async (formOrUsername, password) => {
    try {
      let payload;

      /*
       * Hỗ trợ cách gọi cũ:
       *
       * signupPassenger(username, password)
       */
      if (typeof formOrUsername === 'string') {
        payload = {
          username: formOrUsername.trim(),
          password,
          role: 'Passenger',
        };
      } else {
        const form = formOrUsername || {};

        const fullName = String(
          form.fullName || '',
        ).trim();

        const email = String(
          form.email || '',
        ).trim();

        const phone = String(
          form.phone || '',
        ).trim();

        const identity = String(
          form.identity || '',
        ).trim();

        payload = {
          /*
           * Email được dùng làm username đăng nhập.
           * Ví dụ: gt505115@gmail.com
           */
          username: email || phone || fullName,

          password: String(
            form.password || '',
          ),

          full_name: fullName,

          first_name: String(
            form.firstName || '',
          ).trim(),

          last_name: String(
            form.lastName || '',
          ).trim(),

          email,

          phone,

          identity,

          role: 'Passenger',
        };
      }

      if (!payload.username) {
        return {
          success: false,
          error: 'Vui lòng nhập email hoặc tên đăng nhập.',
          status: 400,
        };
      }

      if (!payload.password || payload.password.length < 8) {
        return {
          success: false,
          error: 'Mật khẩu phải có ít nhất 8 ký tự.',
          status: 400,
        };
      }

      const res = await apiClient.post(
        '/api/v1/auth/register',
        payload,
      );

      return {
        success: true,
        data: res.data,
      };
    } catch (err) {
      return {
        success: false,
        error: message(
          err,
          'Không thể đăng ký tài khoản',
        ),
        status: err.response?.status || 0,
      };
    }
  },

  // =====================================================
  // GENERIC AUTH METHODS
  // =====================================================

  login: async (username, password) =>
    authApi.loginAdmin(username, password),

  signup: async (formOrUsername, password) =>
    authApi.signupPassenger(
      formOrUsername,
      password,
    ),

  // =====================================================
  // OTHER API
  // =====================================================

  getTodos: async () => ({
    success: false,
    error: 'Kiểm tra dữ liệu không khả dụng',
  }),
};