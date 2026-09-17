import apiClient from './client';

// API adapter: backend is the single source of truth. Failed requests return an
// explicit unavailable state; the UI must never replace it with demo records.
export const endpointRegistry = {
  cruiseTours: { path: '/api/v1/cruise-tours', label: 'Chuyến du thuyền' },
  itineraries: { path: '/api/v1/itineraries', label: 'Lịch trình' },
  ports: { path: '/api/v1/ports', label: 'Cảng' },
  passengers: { path: '/api/v1/passengers', label: 'Hành khách' },
  activities: { path: '/api/v1/activities', label: 'Hoạt động trên tàu' },
  bookings: { path: '/api/v1/bookings', label: 'Booking' },
  services: { path: '/api/v1/onboard-services', label: 'Dịch vụ trên tàu' },
  servicePurchases: { path: '/api/v1/service-orders', label: 'Đơn dịch vụ' },
  shoreExcursions: { path: '/api/v1/shore-excursions', label: 'Tour tham quan bờ' },
  excursions: { path: '/api/v1/excursions', label: 'Tour tham quan bờ' },
  expenses: { path: '/api/v1/expenses', label: 'Chi phí vận hành' },
};

const unavailable = (error, endpointPath) => ({
  data: [], isLiveBackend: false, endpointPath,
  error: error?.response?.data?.error || error?.message || 'Không thể kết nối máy chủ',
});

const createResourceApi = (resourceKey) => {
  const { path } = endpointRegistry[resourceKey];
  const mutationPath = resourceKey === 'shoreExcursions' ? '/api/v1/excursions' : path;
  return {
    endpointPath: path,
    getAll: async () => {
      try { const res = await apiClient.get(path); return { data: res.data, isLiveBackend: true, endpointPath: path }; }
      catch (error) { return unavailable(error, path); }
    },
    getById: async (id) => {
      try { const res = await apiClient.get(`${path}/${id}`); return { data: res.data, isLiveBackend: true, endpointPath: path }; }
      catch (error) { return unavailable(error, path); }
    },
    create: async (payload) => {
      try { const res = await apiClient.post(path, payload); return { data: res.data, isLiveBackend: true, endpointPath: path }; }
      catch (error) { return unavailable(error, path); }
    },
    update: async (id, payload) => {
      try { const res = await apiClient.put(`${mutationPath}/${id}`, payload); return { data: res.data, isLiveBackend: true, endpointPath: path }; }
      catch (error) { return unavailable(error, path); }
    },
    delete: async (id) => {
      try { const res = await apiClient.delete(`${mutationPath}/${id}`); return { success: true, data: res.data, isLiveBackend: true, endpointPath: path }; }
      catch (error) { return { success: false, isLiveBackend: false, endpointPath: path, error: error?.response?.data?.error || error?.message }; }
    },
  };
};

export const cruiseToursApi = createResourceApi('cruiseTours');
export const itinerariesApi = createResourceApi('itineraries');
export const portsApi = createResourceApi('ports');
export const passengersApi = createResourceApi('passengers');
export const activitiesApi = createResourceApi('activities');
export const bookingsApi = createResourceApi('bookings');
export const servicesApi = createResourceApi('services');
export const servicePurchasesApi = createResourceApi('servicePurchases');
export const shoreExcursionsApi = createResourceApi('shoreExcursions');
export const excursionsApi = createResourceApi('excursions');
export const expensesApi = createResourceApi('expenses');

export const passengerRegistrationsApi = {
  activity: () => apiClient.get('/api/v1/passengers/me/activity-registrations').then((res) => res.data),
  excursion: () => apiClient.get('/api/v1/passengers/me/excursion-registrations').then((res) => res.data),
};
