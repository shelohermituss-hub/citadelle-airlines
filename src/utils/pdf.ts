import jsPDF from 'jspdf';
import type { PNRRecord } from '@/data/types';
import type { Locale } from '@/i18n/translations';
import { getAirport } from '@/data/airports';

type TFunc = (key: string, params?: Record<string, string | number>) => string;
type FormatPrice = (amount: number) => string;
type FormatTime = (dateStr: string) => string;
type FormatDate = (dateStr: string) => string;

export function generatePdfSummary(
  booking: PNRRecord,
  t: TFunc,
  locale: Locale,
  formatPrice: FormatPrice,
  formatTime: FormatTime,
  formatDate: FormatDate,
): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 50;

  // Header
  doc.setFillColor(20, 20, 20);
  doc.rect(0, 0, pageW, 80, 'F');
  doc.setTextColor(242, 168, 29);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Citadelle Airlines', margin, 35);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(t('confirm.itinerary'), margin, 55);

  y = 110;
  doc.setTextColor(20, 20, 20);

  // PNR
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(t('confirm.pnr'), margin, y);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(242, 168, 29);
  doc.text(booking.pnr, margin, y + 25);

  y += 50;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageW - margin, y);
  y += 20;

  // Itinerary
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text(t('confirm.itinerary'), margin, y);
  y += 20;

  booking.offers.forEach((offer, offerIdx) => {
    offer.itineraries.forEach((itin, itinIdx) => {
      const isFirst = offerIdx === 0 && itinIdx === 0;
      const label = isFirst ? t('results.outbound') : t('results.return');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 100);
      doc.text(label, margin, y);
      y += 15;

      itin.segments.forEach((seg) => {
        const depAp = getAirport(seg.departure.iataCode);
        const arrAp = getAirport(seg.arrival.iataCode);
        const cityName = (a: ReturnType<typeof getAirport>) => a ? (locale === 'fr' ? a.cityFr : a.cityEn) : seg.departure.iataCode;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(20, 20, 20);
        doc.text(`${formatTime(seg.departure.at)} ${cityName(depAp)} (${seg.departure.iataCode})`, margin, y);
        doc.text(`→ ${formatTime(seg.arrival.at)} ${cityName(arrAp)} (${seg.arrival.iataCode})`, margin + 250, y);
        y += 14;
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(`${formatDate(seg.departure.at)} · CA${seg.number} · ${seg.aircraft.code}`, margin, y);
        y += 18;
      });
    });
  });

  y += 10;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageW - margin, y);
  y += 20;

  // Passengers
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text(t('confirm.passengers'), margin, y);
  y += 18;

  booking.travelers.forEach((pax) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const seatSuffix = pax.seatNumber ? ` — ${pax.seatNumber}` : '';
    doc.text(`${pax.title} ${pax.firstName} ${pax.lastName}${seatSuffix}`, margin, y);
    y += 14;
  });

  y += 10;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageW - margin, y);
  y += 20;

  // Total
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(t('confirm.totalPaid'), margin, y);
  doc.text(formatPrice(booking.totalPrice), pageW - margin, y, { align: 'right' });

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text(t('demo.banner'), margin, doc.internal.pageSize.getHeight() - 20);

  doc.save(`Citadelle-booking-${booking.pnr}.pdf`);
}
