import { useMemo, useState, type ChangeEvent, type FocusEvent } from 'react'

interface FormValues {
  name: string
  email: string
  message: string
}

type Errors = Partial<Record<keyof FormValues, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const EMPTY: FormValues = { name: '', email: '', message: '' }

function validate(values: FormValues): Errors {
  const errors: Errors = {}
  if (!values.name.trim()) errors.name = '请填写你的姓名'
  if (!values.email.trim()) {
    errors.email = '请填写邮箱地址'
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = '请输入有效的邮箱地址'
  }
  if (!values.message.trim()) errors.message = '请写下你想说的话'
  return errors
}

export default function ContactPage() {
  const [values, setValues] = useState<FormValues>(EMPTY)
  const [touched, setTouched] = useState<Record<keyof FormValues, boolean>>({
    name: false,
    email: false,
    message: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const errors = useMemo(() => validate(values), [values])
  const isValid = Object.keys(errors).length === 0

  const update =
    (field: keyof FormValues) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues(v => ({ ...v, [field]: e.target.value }))
    }

  const blur =
    (field: keyof FormValues) =>
    (_e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setTouched(t => ({ ...t, [field]: true }))
    }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || submitting) return
    setTouched({ name: true, email: true, message: true })
    setSubmitting(true)
    // No backend on purpose: simulate the round-trip, then show the success state.
    await new Promise(resolve => setTimeout(resolve, 700))
    setSubmitting(false)
    setSent(true)
  }

  const shown: Errors = {
    name: touched.name ? errors.name : undefined,
    email: touched.email ? errors.email : undefined,
    message: touched.message ? errors.message : undefined,
  }

  return (
    <div className="page contact-page">
      <header className="page-head">
        <p className="eyebrow">联系</p>
        <h1>来信</h1>
        <p className="page-sub">
          肖像委托、出版合作，或只是想聊聊一次高原上的出行计划——我通常在两日内回复。
        </p>
      </header>

      {sent ? (
        <div className="contact-success" role="status">
          <span className="success-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="30" height="30">
              <path
                d="M4 12.5l5 5L20 6.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h2>谢谢你的来信</h2>
          <p>消息已经收到。我会尽快阅读并回复到你留下的邮箱，请留意查收。</p>
        </div>
      ) : (
        <form className="contact-form" onSubmit={onSubmit} noValidate>
          <div className={`field${shown.name ? ' has-error' : ''}`}>
            <label htmlFor="name">姓名</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={update('name')}
              onBlur={blur('name')}
              aria-invalid={Boolean(shown.name)}
              aria-describedby={shown.name ? 'name-error' : undefined}
            />
            {shown.name && (
              <p className="field-error" id="name-error">
                {shown.name}
              </p>
            )}
          </div>

          <div className={`field${shown.email ? ' has-error' : ''}`}>
            <label htmlFor="email">邮箱</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={values.email}
              onChange={update('email')}
              onBlur={blur('email')}
              aria-invalid={Boolean(shown.email)}
              aria-describedby={shown.email ? 'email-error' : undefined}
            />
            {shown.email && (
              <p className="field-error" id="email-error">
                {shown.email}
              </p>
            )}
          </div>

          <div className={`field${shown.message ? ' has-error' : ''}`}>
            <label htmlFor="message">留言</label>
            <textarea
              id="message"
              name="message"
              rows={6}
              value={values.message}
              onChange={update('message')}
              onBlur={blur('message')}
              aria-invalid={Boolean(shown.message)}
              aria-describedby={shown.message ? 'message-error' : undefined}
            />
            {shown.message && (
              <p className="field-error" id="message-error">
                {shown.message}
              </p>
            )}
          </div>

          <button type="submit" className="submit-button" disabled={!isValid || submitting}>
            {submitting ? '发送中…' : '发送消息'}
          </button>
        </form>
      )}
    </div>
  )
}
