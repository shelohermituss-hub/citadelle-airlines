import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import { useBooking } from '@/contexts/BookingContext';
import { getAirport } from '@/data/airports';
import type { PassengerInfo, ContactInfo } from '@/data/types';
import { ArrowLeft, ArrowRight, Users, Mail } from 'lucide-react';

const TITLES = ['MR', 'MS', 'MRS', 'MX', 'MISS', 'MSTR'] as const;
const COUNTRY_CODES = ['+1', '+33', '+509', '+1 809', '+1 876', '+1 868', '+55', '+1 786', '+44', '+49', '+90'];

export default function PassengersPage() {
  const { t } = useI18n();
  const { criteria, outboundResult, passengers, setPassengers, contact, setContact, selectedOffers } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    if (!outboundResult) navigate('/search');
    if (selectedOffers.length === 0) navigate('/booking/fare');
  }, [outboundResult, selectedOffers, navigate]);

  // Initialize passengers based on criteria
  useEffect(() => {
    if (passengers.length === 0 && criteria) {
      const initial: PassengerInfo[] = [];
      for (let i = 0; i < criteria.adults; i++) {
        initial.push(createEmptyPassenger('ADULT', i));
      }
      for (let i = 0; i < criteria.children; i++) {
        initial.push(createEmptyPassenger('CHILD', i));
      }
      for (let i = 0; i < criteria.infants; i++) {
        initial.push(createEmptyPassenger('HELD_INFANT', i));
      }
      setPassengers(initial);
    }
  }, [criteria, passengers.length, setPassengers]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});

  function createEmptyPassenger(type: 'ADULT' | 'CHILD' | 'HELD_INFANT', idx: number): PassengerInfo {
    return {
      id: `${type}-${idx}`,
      travelerType: type,
      title: type === 'CHILD' ? (idx % 2 === 0 ? 'MISS' : 'MSTR') : type === 'HELD_INFANT' ? 'MISS' : 'MR',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationality: '',
      passportNumber: '',
      passportExpiry: '',
    };
  }

  function updatePassenger(id: string, field: keyof PassengerInfo, value: string) {
    setPassengers(passengers.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }

  function validatePassenger(p: PassengerInfo, idx: number): Record<string, string> {
    const errs: Record<string, string> = {};
    const prefix = `pax-${idx}`;
    if (!p.firstName.trim()) errs[`${prefix}-firstName`] = t('passengers.validation.required');
    else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(p.firstName)) errs[`${prefix}-firstName`] = t('passengers.validation.nameFormat');
    if (!p.lastName.trim()) errs[`${prefix}-lastName`] = t('passengers.validation.required');
    else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(p.lastName)) errs[`${prefix}-lastName`] = t('passengers.validation.nameFormat');
    if (!p.dateOfBirth) errs[`${prefix}-dob`] = t('passengers.validation.required');
    else {
      const age = calculateAge(p.dateOfBirth);
      if (p.travelerType === 'CHILD' && (age < 2 || age > 11)) errs[`${prefix}-dob`] = t('passengers.validation.ageChild');
      if (p.travelerType === 'HELD_INFANT' && age >= 2) errs[`${prefix}-dob`] = t('passengers.validation.ageInfant');
    }
    if (!p.nationality.trim()) errs[`${prefix}-nationality`] = t('passengers.validation.required');
    if (!p.passportNumber.trim()) errs[`${prefix}-passportNumber`] = t('passengers.validation.required');
    if (!p.passportExpiry) errs[`${prefix}-passportExpiry`] = t('passengers.validation.required');
    else if (criteria) {
      const travelDate = new Date(criteria.departureDate);
      const expiry = new Date(p.passportExpiry);
      if (expiry < travelDate) errs[`${prefix}-passportExpiry`] = t('passengers.validation.passport');
    }
    return errs;
  }

  function validateContact(c: ContactInfo): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!c.email.trim()) errs.email = t('passengers.validation.required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) errs.email = t('passengers.validation.email');
    if (c.email !== c.emailConfirm) errs.emailConfirm = t('passengers.validation.emailMatch');
    if (!c.phoneNumber.trim()) errs.phoneNumber = t('passengers.validation.required');
    else if (!/^\d{6,}$/.test(c.phoneNumber.replace(/\s/g, ''))) errs.phoneNumber = t('passengers.validation.phone');
    return errs;
  }

  function handleContinue() {
    const allErrors: Record<string, string> = {};
    passengers.forEach((p, i) => {
      Object.assign(allErrors, validatePassenger(p, i));
    });
    Object.assign(allErrors, validateContact(contact));
    setErrors(allErrors);
    setContactErrors(validateContact(contact));
    if (Object.keys(allErrors).length === 0) {
      navigate('/booking/payment');
    }
  }

  if (!outboundResult) return null;

  return (
    <div className="container-page py-6">
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div>
          <div className="mb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-citadelle-black">{t('passengers.title')}</h1>
            <p className="text-sm text-black/50 mt-1">{t('passengers.subtitle')}</p>
          </div>

          {/* Passenger forms */}
          <div className="space-y-4">
            {passengers.map((pax, idx) => {
              const typeLabel = pax.travelerType === 'ADULT' ? t('passengers.adult') : pax.travelerType === 'CHILD' ? t('passengers.child') : t('passengers.infant');
              return (
                <div key={pax.id} className="card p-5">
                  <h3 className="font-semibold text-citadelle-black mb-4 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-citadelle-cream text-xs font-bold text-citadelle-gold-dark">
                      {idx + 1}
                    </span>
                    {t('passengers.passenger', { n: idx + 1 })} — {typeLabel}
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor={`${pax.id}-title`} className="label">{t('passengers.title_field')}</label>
                      <select
                        id={`${pax.id}-title`}
                        className="input"
                        value={pax.title}
                        onChange={(e) => updatePassenger(pax.id, 'title', e.target.value)}
                      >
                        {TITLES.map((ttl) => <option key={ttl} value={ttl}>{ttl}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`${pax.id}-firstName`} className="label">{t('passengers.firstName')}</label>
                      <input
                        id={`${pax.id}-firstName`}
                        type="text"
                        className={`input ${errors[`pax-${idx}-firstName`] ? 'input-error' : ''}`}
                        value={pax.firstName}
                        onChange={(e) => updatePassenger(pax.id, 'firstName', e.target.value)}
                        autoComplete="given-name"
                      />
                      {errors[`pax-${idx}-firstName`] && <p className="error-text">{errors[`pax-${idx}-firstName`]}</p>}
                    </div>
                    <div>
                      <label htmlFor={`${pax.id}-lastName`} className="label">{t('passengers.lastName')}</label>
                      <input
                        id={`${pax.id}-lastName`}
                        type="text"
                        className={`input ${errors[`pax-${idx}-lastName`] ? 'input-error' : ''}`}
                        value={pax.lastName}
                        onChange={(e) => updatePassenger(pax.id, 'lastName', e.target.value)}
                        autoComplete="family-name"
                      />
                      {errors[`pax-${idx}-lastName`] && <p className="error-text">{errors[`pax-${idx}-lastName`]}</p>}
                    </div>
                    <div>
                      <label htmlFor={`${pax.id}-dob`} className="label">{t('passengers.dob')}</label>
                      <input
                        id={`${pax.id}-dob`}
                        type="date"
                        className={`input ${errors[`pax-${idx}-dob`] ? 'input-error' : ''}`}
                        value={pax.dateOfBirth}
                        max={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => updatePassenger(pax.id, 'dateOfBirth', e.target.value)}
                      />
                      {errors[`pax-${idx}-dob`] && <p className="error-text">{errors[`pax-${idx}-dob`]}</p>}
                    </div>
                    <div>
                      <label htmlFor={`${pax.id}-nationality`} className="label">{t('passengers.nationality')}</label>
                      <input
                        id={`${pax.id}-nationality`}
                        type="text"
                        className={`input ${errors[`pax-${idx}-nationality`] ? 'input-error' : ''}`}
                        value={pax.nationality}
                        onChange={(e) => updatePassenger(pax.id, 'nationality', e.target.value)}
                      />
                      {errors[`pax-${idx}-nationality`] && <p className="error-text">{errors[`pax-${idx}-nationality`]}</p>}
                    </div>
                    <div>
                      <label htmlFor={`${pax.id}-passportNumber`} className="label">{t('passengers.passportNumber')}</label>
                      <input
                        id={`${pax.id}-passportNumber`}
                        type="text"
                        className={`input ${errors[`pax-${idx}-passportNumber`] ? 'input-error' : ''}`}
                        value={pax.passportNumber}
                        onChange={(e) => updatePassenger(pax.id, 'passportNumber', e.target.value.toUpperCase())}
                      />
                      {errors[`pax-${idx}-passportNumber`] && <p className="error-text">{errors[`pax-${idx}-passportNumber`]}</p>}
                    </div>
                    <div>
                      <label htmlFor={`${pax.id}-passportExpiry`} className="label">{t('passengers.passportExpiry')}</label>
                      <input
                        id={`${pax.id}-passportExpiry`}
                        type="date"
                        className={`input ${errors[`pax-${idx}-passportExpiry`] ? 'input-error' : ''}`}
                        value={pax.passportExpiry}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => updatePassenger(pax.id, 'passportExpiry', e.target.value)}
                      />
                      {errors[`pax-${idx}-passportExpiry`] && <p className="error-text">{errors[`pax-${idx}-passportExpiry`]}</p>}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Contact info */}
            <div className="card p-5">
              <h3 className="font-semibold text-citadelle-black mb-4 flex items-center gap-2">
                <Mail className="h-4 w-4 text-citadelle-gold-dark" />
                {t('passengers.contact')}
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="email" className="label">{t('passengers.email')}</label>
                  <input
                    id="email"
                    type="email"
                    className={`input ${contactErrors.email ? 'input-error' : ''}`}
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    autoComplete="email"
                  />
                  {contactErrors.email && <p className="error-text">{contactErrors.email}</p>}
                </div>
                <div>
                  <label htmlFor="emailConfirm" className="label">{t('passengers.emailConfirm')}</label>
                  <input
                    id="emailConfirm"
                    type="email"
                    className={`input ${contactErrors.emailConfirm ? 'input-error' : ''}`}
                    value={contact.emailConfirm ?? ''}
                    onChange={(e) => setContact({ ...contact, emailConfirm: e.target.value })}
                    autoComplete="email"
                  />
                  {contactErrors.emailConfirm && <p className="error-text">{contactErrors.emailConfirm}</p>}
                </div>
                <div>
                  <label htmlFor="phoneCode" className="label">{t('passengers.phoneCode')}</label>
                  <select
                    id="phoneCode"
                    className="input"
                    value={contact.phoneCountryCode}
                    onChange={(e) => setContact({ ...contact, phoneCountryCode: e.target.value })}
                  >
                    {COUNTRY_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="label">{t('passengers.phoneNumber')}</label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    className={`input ${contactErrors.phoneNumber ? 'input-error' : ''}`}
                    value={contact.phoneNumber}
                    onChange={(e) => setContact({ ...contact, phoneNumber: e.target.value })}
                    autoComplete="tel"
                  />
                  {contactErrors.phoneNumber && <p className="error-text">{contactErrors.phoneNumber}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Link to="/booking/fare" className="btn-ghost">
              <ArrowLeft className="h-4 w-4" />
              {t('common.back')}
            </Link>
            <button onClick={handleContinue} className="btn-primary">
              {t('common.continue')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Summary sidebar */}
        <aside>
          <BookingSummary />
        </aside>
      </div>
    </div>
  );
}

export function BookingSummary() {
  const { t, locale, formatPrice, formatTime, formatDate } = useI18n();
  const { criteria, outboundResult, returnResult, fareFamily, totalPrice, passengers } = useBooking();

  function getCityName(iata: string): string {
    const a = getAirport(iata);
    if (!a) return iata;
    if (locale === 'fr') return a.cityFr;
    if (locale === 'ht') return a.cityHt;
    return a.cityEn;
  }

  if (!outboundResult || !criteria) return null;

  const fareLabel = fareFamily === 'ECO' ? t('fare.eco') : fareFamily === 'ECO_FLEX' ? t('fare.ecoFlex') : t('fare.business');

  return (
    <div className="card p-5 sticky top-24">
      <h3 className="font-semibold text-citadelle-black mb-4">{t('passengers.summary')}</h3>
      <div className="space-y-3 text-sm">
        {/* Outbound */}
        <div className="border-l-2 border-citadelle-gold pl-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-black/40 mb-1">{t('results.outbound')}</p>
          <p className="font-semibold text-citadelle-black">
            {getCityName(outboundResult.outbound.segments[0].departure.iataCode)} → {getCityName(outboundResult.outbound.segments[outboundResult.outbound.segments.length - 1].arrival.iataCode)}
          </p>
          <p className="text-xs text-black/50">{formatDate(criteria.departureDate)}</p>
          <p className="text-xs text-black/50">{formatTime(outboundResult.departureTime)} → {formatTime(outboundResult.arrivalTime)}</p>
        </div>
        {/* Return */}
        {returnResult && criteria.returnDate && (
          <div className="border-l-2 border-citadelle-gold/50 pl-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-black/40 mb-1">{t('results.return')}</p>
            <p className="font-semibold text-citadelle-black">
              {getCityName(returnResult.outbound.segments[0].departure.iataCode)} → {getCityName(returnResult.outbound.segments[returnResult.outbound.segments.length - 1].arrival.iataCode)}
            </p>
            <p className="text-xs text-black/50">{formatDate(criteria.returnDate)}</p>
          </div>
        )}
        {/* Passengers */}
        <div className="flex items-center gap-2 text-black/60 pt-2 border-t border-black/[0.06]">
          <Users className="h-4 w-4 text-black/30" />
          <span>{passengers.length || (criteria.adults + criteria.children + criteria.infants)} {t('common.passengers').toLowerCase()}</span>
        </div>
        {/* Fare */}
        <div className="flex items-center justify-between">
          <span className="text-black/50">{t('fare.title')}</span>
          <span className="font-medium text-citadelle-black">{fareLabel}</span>
        </div>
        {/* Total */}
        <div className="border-t border-black/[0.06] pt-3 flex justify-between items-center">
          <span className="text-black/50">{t('common.total')}</span>
          <span className="font-display text-xl font-bold text-citadelle-black">{formatPrice(totalPrice)}</span>
        </div>
      </div>
    </div>
  );
}

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}
