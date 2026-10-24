import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ServicePage from './pages/ServicePage';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import RefundPolicy from './pages/RefundPolicy';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import NotFound from './pages/NotFound';
import FakeAdmin from './pages/FakeAdmin';
import Coverage from './pages/Coverage';

// Admin imports
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Messages from './pages/admin/Messages';
import AdminServices from './pages/admin/Services';
import Team from './pages/admin/Team';
import SocialMedia from './pages/admin/SocialMedia';
import AdminTestimonials from './pages/admin/Testimonials';
import AdminFAQ from './pages/admin/FAQ';
import AdminCoverage from './pages/admin/Coverage';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-secondary text-white font-body overflow-x-hidden">
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/flasho" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="messages" element={<Messages />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="team" element={<Team />} />
            <Route path="social-media" element={<SocialMedia />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="faq" element={<AdminFAQ />} />
            <Route path="coverage" element={<AdminCoverage />} />
          </Route>

          {/* Public Routes */}
          <Route path="/*" element={
            <>
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/service/:id" element={<ServicePage />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/refund" element={<RefundPolicy />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/coverage" element={<Coverage />} />
                  <Route path="/admin" element={<FakeAdmin />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
