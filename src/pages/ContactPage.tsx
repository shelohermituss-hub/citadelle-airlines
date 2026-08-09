import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { FcInvite, FcPhone, FcGlobe, FcUpload, FcOk } from 'react-icons/fc';

export default function ContactPage() {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t('passengers.validation.required');
    if (!email.trim()) errs.email = t('passengers.validation.required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t('passengers.validation.email');
    if (!subject.trim()) errs.subject = t('passengers.validation.required');
    if (!message.trim()) errs.message = t('passengers.validation.required');
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSent(true);
    }
  }

  return (
    <div className="container-page py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-citadelle-black">{t('contact.title')}</h1>
          <p className="text-sm text-black/50 mt-1">{t('contact.subtitle')}</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Form */}
          <div>
            {sent ? (
              <div className="card p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-citadelle-success/10">
                    <FcOk className="h-8 w-8" />
                  </div>
                </div>
                <p className="text-sm text-black/60">{t('contact.sent')}</p>
                <button onClick={() => { setSent(false); setName(''); setEmail(''); setSubject(''); setMessage(''); }} className="btn-ghost mt-4">
                  {t('common.back')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card p-5 space-y-3">
                <div>
                  <label htmlFor="contactName" className="label">{t('contact.name')}</label>
                  <input id="contactName" type="text" className={`input ${errors.name ? 'input-error' : ''}`} value={name} onChange={(e) => setName(e.target.value)} />
                  {errors.name && <p className="error-text">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="contactEmail" className="label">{t('contact.email')}</label>
                  <input id="contactEmail" type="email" className={`input ${errors.email ? 'input-error' : ''}`} value={email} onChange={(e) => setEmail(e.target.value)} />
                  {errors.email && <p className="error-text">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="contactSubject" className="label">{t('contact.subject')}</label>
                  <input id="contactSubject" type="text" className={`input ${errors.subject ? 'input-error' : ''}`} value={subject} onChange={(e) => setSubject(e.target.value)} />
                  {errors.subject && <p className="error-text">{errors.subject}</p>}
                </div>
                <div>
                  <label htmlFor="contactMessage" className="label">{t('contact.message')}</label>
                  <textarea id="contactMessage" rows={5} className={`input resize-none ${errors.message ? 'input-error' : ''}`} value={message} onChange={(e) => setMessage(e.target.value)} />
                  {errors.message && <p className="error-text">{errors.message}</p>}
                </div>
                <button type="submit" className="btn-primary w-full">
                  <FcUpload className="h-4 w-4" />
                  {t('contact.send')}
                </button>
              </form>
            )}
          </div>

          {/* Contact info */}
          <aside>
            <div className="card p-5 space-y-4">
              <div className="flex items-start gap-3">
                <FcGlobe className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-black/40">{t('contact.address')}</p>
                  <p className="text-sm text-black/60">Avenue Toussaint Louverture<br />Port-au-Prince, Haiti</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FcPhone className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-black/40">{t('contact.phone')}</p>
                  <p className="text-sm text-black/60">+1 (509) 000-0000</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FcInvite className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-black/40">{t('contact.emailLabel')}</p>
                  <p className="text-sm text-black/60">contact@citadelleairlines.com</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
