import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { I18nProvider } from '@/i18n/I18nContext';
import { BookingProvider } from '@/contexts/BookingContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { DemoBanner } from '@/components/DemoBanner';
import { ScrollToTop } from '@/components/ScrollToTop';
import HomePage from '@/pages/HomePage';
import SearchResultsPage from '@/pages/SearchResultsPage';
import FareSelectionPage from '@/pages/FareSelectionPage';
import PassengersPage from '@/pages/PassengersPage';
import PaymentPage from '@/pages/PaymentPage';
import ConfirmationPage from '@/pages/ConfirmationPage';
import ManageBookingPage from '@/pages/ManageBookingPage';
import FlightStatusPage from '@/pages/FlightStatusPage';
import CheckInPage from '@/pages/CheckInPage';
import DestinationsPage from '@/pages/DestinationsPage';
import DestinationDetailPage from '@/pages/DestinationDetailPage';
import AboutPage from '@/pages/AboutPage';
import HelpPage from '@/pages/HelpPage';
import ContactPage from '@/pages/ContactPage';
import LegalPage from '@/pages/LegalPage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  return (
    <I18nProvider>
      <BookingProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="flex min-h-screen flex-col">
            <DemoBanner />
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/booking/fare" element={<FareSelectionPage />} />
                <Route path="/booking/passengers" element={<PassengersPage />} />
                <Route path="/booking/payment" element={<PaymentPage />} />
                <Route path="/booking/confirmation" element={<ConfirmationPage />} />
                <Route path="/manage-booking" element={<ManageBookingPage />} />
                <Route path="/flight-status" element={<FlightStatusPage />} />
                <Route path="/check-in" element={<CheckInPage />} />
                <Route path="/destinations" element={<DestinationsPage />} />
                <Route path="/destinations/:code" element={<DestinationDetailPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/legal/:type" element={<LegalPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </BookingProvider>
    </I18nProvider>
  );
}
