import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import { useBooking } from '@/contexts/BookingContext';
import { bookingService } from '@/data/bookingService';
import { BookingSummary } from './PassengersPage';
import { FcLeft, FcMoneyTransfer, FcLock, FcApproval, FcHighPriority, FcSynchronize } from 'react-icons/fc';

export default function PaymentPage() {
  const { t, formatPrice, currency } = useI18n();
  const { selectedOffers, passengers, contact, totalPrice, ancillariesTotal, fareFamily, setConfirmedBooking } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedOffers.length === 0 || passengers.length === 0) {
      navigate('/search');
      return;
    }
    const missingSeat = passengers.some((p) => p.travelerType !== 'HELD_INFANT' && !p.seatNumber);
    if (missingSeat) navigate('/booking/seats');
  }, [selectedOffers, passengers, navigate]);

  const grandTotal = totalPrice + ancillariesTotal;

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(false);

  // Calculate breakdown
  const baseFare = Math.round(totalPrice / 1.22);
  const taxes = totalPrice - baseFare;

  function formatCardNumber(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  }

  function formatExpiry(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    const cardDigits = cardNumber.replace(/\s/g, '');
    if (cardDigits.length < 13 || cardDigits.length > 16) errs.cardNumber = t('payment.validation.cardNumber');
    if (!cardName.trim()) errs.cardName = t('payment.validation.cardName');
    if (!/^\d{2}\/\d{2}$/.test(expiry)) errs.expiry = t('payment.validation.expiry');
    if (!/^\d{3,4}$/.test(cvc)) errs.cvc = t('payment.validation.cvc');
    if (!acceptTerms) errs.terms = t('payment.validation.terms');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handlePay() {
    if (!validate()) return;
    setProcessing(true);
    setPaymentError(false);
    try {
      // Simulate payment — test failure case with card number ending in 0002
      const cardDigits = cardNumber.replace(/\s/g, '');
      if (cardDigits.endsWith('0002')) {
        await new Promise((r) => setTimeout(r, 1500));
        setPaymentError(true);
        setProcessing(false);
        return;
      }

      const record = await bookingService.createBooking(
        selectedOffers,
        passengers,
        contact,
        grandTotal,
        currency,
        fareFamily,
      );
      setConfirmedBooking(record);
      navigate('/booking/confirmation');
    } catch {
      setPaymentError(true);
    } finally {
      setProcessing(false);
    }
  }

  if (selectedOffers.length === 0) return null;

  return (
    <div className="container-page py-6">
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div>
          <div className="mb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-citadelle-black">{t('payment.title')}</h1>
            <p className="text-sm text-black/50 mt-1">{t('payment.subtitle')}</p>
          </div>

          {/* Card form */}
          <div className="card p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <FcMoneyTransfer className="h-5 w-5" />
              <h3 className="font-semibold text-citadelle-black">{t('payment.acceptCards')}</h3>
              <div className="flex gap-1.5 ml-auto">
                <div className="flex h-6 w-10 items-center justify-center rounded bg-citadelle-cream text-[0.625rem] font-bold text-citadelle-black">VISA</div>
                <div className="flex h-6 w-10 items-center justify-center rounded bg-citadelle-cream text-[0.625rem] font-bold text-citadelle-error">MC</div>
                <div className="flex h-6 w-10 items-center justify-center rounded bg-citadelle-cream text-[0.5rem] font-bold text-citadelle-black">AMEX</div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label htmlFor="cardNumber" className="label">{t('payment.cardNumber')}</label>
                <input
                  id="cardNumber"
                  type="text"
                  inputMode="numeric"
                  className={`input ${errors.cardNumber ? 'input-error' : ''}`}
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  disabled={processing}
                />
                {errors.cardNumber && <p className="error-text">{errors.cardNumber}</p>}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="cardName" className="label">{t('payment.cardName')}</label>
                <input
                  id="cardName"
                  type="text"
                  className={`input ${errors.cardName ? 'input-error' : ''}`}
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  disabled={processing}
                  autoComplete="cc-name"
                />
                {errors.cardName && <p className="error-text">{errors.cardName}</p>}
              </div>
              <div>
                <label htmlFor="expiry" className="label">{t('payment.expiry')}</label>
                <input
                  id="expiry"
                  type="text"
                  inputMode="numeric"
                  className={`input ${errors.expiry ? 'input-error' : ''}`}
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  disabled={processing}
                  autoComplete="cc-exp"
                />
                {errors.expiry && <p className="error-text">{errors.expiry}</p>}
              </div>
              <div>
                <label htmlFor="cvc" className="label">{t('payment.cvc')}</label>
                <input
                  id="cvc"
                  type="text"
                  inputMode="numeric"
                  className={`input ${errors.cvc ? 'input-error' : ''}`}
                  placeholder="123"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  disabled={processing}
                  autoComplete="cc-csc"
                />
                {errors.cvc && <p className="error-text">{errors.cvc}</p>}
              </div>
            </div>

            {/* Terms */}
            <div className="mt-4">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-black/20 text-citadelle-gold focus:ring-citadelle-gold"
                  disabled={processing}
                />
                <span className="text-sm text-black/60">
                  {t('payment.terms')}
                </span>
              </label>
              {errors.terms && <p className="error-text">{errors.terms}</p>}
            </div>

            {/* Simulated notice */}
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-citadelle-cream p-3">
              <FcLock className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-xs text-black/50">{t('payment.simulated')}</p>
            </div>
          </div>

          {/* Payment error */}
          {paymentError && (
            <div className="card p-4 mb-4 border-citadelle-error/30 bg-citadelle-error/5 animate-slide-down">
              <div className="flex items-center gap-2 text-citadelle-error">
                <FcHighPriority className="h-5 w-5" />
                <p className="text-sm font-medium">{t('payment.fail.simulated')}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Link to="/booking/passengers" className="btn-ghost" onClick={(e) => { if (processing) e.preventDefault(); }}>
              <FcLeft className="h-4 w-4" />
              {t('common.back')}
            </Link>
            <button onClick={handlePay} disabled={processing} className="btn-primary">
              {processing ? (
                <>
                  <FcSynchronize className="h-4 w-4 animate-spin" />
                  {t('payment.processing')}
                </>
              ) : (
                <>
                  <FcApproval className="h-4 w-4" />
                  {t('payment.pay', { amount: formatPrice(grandTotal) })}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Summary + breakdown */}
        <aside>
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-semibold text-citadelle-black mb-4">{t('passengers.summary')}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-black/50">{t('payment.fareTotal')}</span>
                  <span className="font-medium">{formatPrice(baseFare)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/50">{t('payment.taxes')}</span>
                  <span className="font-medium">{formatPrice(taxes)}</span>
                </div>
                {ancillariesTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-black/50">{t('seats.seatTotal')}</span>
                    <span className="font-medium">{formatPrice(ancillariesTotal)}</span>
                  </div>
                )}
                <div className="border-t border-black/[0.06] pt-2 flex justify-between items-center">
                  <span className="text-black/50">{t('payment.total')}</span>
                  <span className="font-display text-xl font-bold text-citadelle-black">{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>
            <BookingSummary />
          </div>
        </aside>
      </div>
    </div>
  );
}
