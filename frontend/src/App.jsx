import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import CruiseToursPage from './pages/CruiseToursPage';
import ItinerariesPage from './pages/ItinerariesPage';
import PortsPage from './pages/PortsPage';
import PassengersPage from './pages/PassengersPage';
import ActivitiesPage from './pages/ActivitiesPage';
import BookingsPage from './pages/BookingsPage';
import ServicesPage from './pages/ServicesPage';
import ServicePurchasesPage from './pages/ServicePurchasesPage';
import ShoreExcursionsPage from './pages/ShoreExcursionsPage';
import ExpensesPage from './pages/ExpensesPage';
import ReportsPage from './pages/ReportsPage';
import PassengerPortal from './pages/passenger/PassengerPortal';
import PassengerLogin from './pages/passenger/PassengerLogin';
import PassengerRegister from './pages/passenger/PassengerRegister';

const adminRoutes = [
  { path: 'overview', section: 'dashboard' },
  { path: 'passengers', section: 'passengers' },
  { path: 'bookings', section: 'bookings' },
  { path: 'cruises', section: 'tours' },
  { path: 'itineraries', section: 'itineraries' },
  { path: 'ports', section: 'ports' },
  { path: 'activities', section: 'activities' },
  { path: 'services', section: 'services' },
  { path: 'purchases', section: 'purchases' },
  { path: 'excursions', section: 'excursions' },
  { path: 'expenses', section: 'expenses' },
  { path: 'reports', section: 'reports' },
];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PassengerPortal />} />
        <Route path="/cruises" element={<PassengerPortal />} />
        <Route path="/my-bookings" element={<PassengerPortal />} />
        <Route path="/profile" element={<PassengerPortal />} />
        <Route path="/login" element={<PassengerLogin />} />
        <Route path="/register" element={<PassengerRegister />} />
        <Route path="/check-in" element={<PassengerPortal />} />
        <Route path="/itinerary" element={<PassengerPortal />} />
        <Route path="/services" element={<PassengerPortal />} />
        <Route path="/support" element={<PassengerPortal />} />
        <Route path="/activities" element={<PassengerPortal />} />
        <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
        {adminRoutes.map(({ path, section }) => (
          <Route key={path} path={`/admin/${path}`} element={<AdminGuard initialSection={section} />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function AdminGuard({ initialSection }) {
  let user = null;
  try { user = JSON.parse(localStorage.getItem('oceanflow_admin_user') || 'null'); } catch { user = null; }
  const hasAdminRole = Array.isArray(user?.roles) && user.roles.some((role) => String(role).toLowerCase() === 'admin');
  if (!localStorage.getItem('oceanflow_admin_token') || !hasAdminRole) return <Navigate to="/login?audience=admin" replace />;
  return <AdminApp initialSection={initialSection} />;
}

function AdminApp({ initialSection }) {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedTourId = 'ALL';
  const activeSection = adminRoutes.find(({ path }) => location.pathname === `/admin/${path}`)?.section || initialSection;
  const selectSection = (section) => {
    const route = adminRoutes.find((item) => item.section === section);
    navigate(`/admin/${route?.path || 'overview'}`);
  };

  const renderCurrentPage = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardPage onNavigate={selectSection} selectedTourId={selectedTourId} />;
      case 'tours':
        return <CruiseToursPage />;
      case 'itineraries':
        return <ItinerariesPage selectedTourId={selectedTourId} />;
      case 'ports':
        return <PortsPage />;
      case 'passengers':
        return <PassengersPage selectedTourId={selectedTourId} />;
      case 'activities':
        return <ActivitiesPage />;
      case 'bookings':
        return <BookingsPage />;
      case 'services':
        return <ServicesPage onNavigate={selectSection} />;
      case 'purchases':
        return <ServicePurchasesPage />;
      case 'excursions':
        return <ShoreExcursionsPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <DashboardPage onNavigate={selectSection} selectedTourId={selectedTourId} />;
    }
  };

  return (
    <AppLayout
      activeSection={activeSection}
      onSelectSection={selectSection}
      onReplayOpening={() => {}}
    >
      {renderCurrentPage()}
    </AppLayout>
  );
}