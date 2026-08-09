import type { PNRRecord } from '@/data/types';

export function generateIcsFile(booking: PNRRecord): void {
  const events: string[] = [];

  booking.offers.forEach((offer, offerIdx) => {
    offer.itineraries.forEach((itin, itinIdx) => {
      const firstSeg = itin.segments[0];
      const lastSeg = itin.segments[itin.segments.length - 1];

      const dtStart = toIcsDate(firstSeg.departure.at);
      const dtEnd = toIcsDate(lastSeg.arrival.at);
      const title = `Citadelle Airlines ${offerIdx === 0 && itinIdx === 0 ? 'Outbound' : 'Return'}: ${firstSeg.departure.iataCode} → ${lastSeg.arrival.iataCode}`;
      const desc = [
        `Booking ref: ${booking.pnr}`,
        `Flight: CA${firstSeg.number}`,
        `From: ${firstSeg.departure.iataCode}`,
        `To: ${lastSeg.arrival.iataCode}`,
        `Passengers: ${booking.travelers.map((p) => `${p.firstName} ${p.lastName}`).join(', ')}`,
      ].join('\\n');

      const uid = `${booking.pnr}-${offerIdx}-${itinIdx}@citadelleairlines.com`;

      events.push([
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${desc}`,
        `LOCATION:${firstSeg.departure.iataCode}`,
        'END:VEVENT',
      ].join('\r\n'));
    });
  });

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Citadelle Airlines//Booking//EN',
    'CALSCALE:GREGORIAN',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Citadelle-booking-${booking.pnr}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function toIcsDate(isoStr: string): string {
  const dt = new Date(isoStr);
  const utc = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000);
  return utc.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}
