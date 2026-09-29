import { useState, type ChangeEvent, type FormEvent } from 'react'
import { getPhoto, photoUrl } from '../data/photos'

type Fields = { name: string; email: string; message: string }
type Errors = Partial<Record<keyof Fields, string>>
type Status = 'idle' | 'sending' | 'success'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateField(name: keyof Fields, value: string): string {
  const trimmed = value.trim()
  if (name === 'name') {
    if (!trimmed) return '请填写姓名'
    if (trimmed.length < 2) return '姓名至少需要两个字符'
  }
  if (name === 'email') {
    if (!trimmed) return '请填写邮箱'
    if (!EMAIL_PATTERN.test(trimmed)) return '请输入有效的邮箱地址'
  }
  if (name === 'message') {
    if (!trimmed) return '请填写留言内容'
    if (trimmed.length < 10) return '留言至少需要十个字符，便于我了解你的想法'
  }
  return ''
}

function validateAll(fields: Fields): Errors {
  return {
    name: validateField('name', fields.name) || undefined,
    email: validateField('email', fields.email) || undefined,
    message: validateField('message', fields.message) || undefined,
  }
}

export function ContactPage() {
  const [fields, setFields] = useState<Fields>({ name: '', email: '', message: '' })
  const [touched, setTouched] = useState<Record<keyof Fields, boolean>>({
    name: false,
    email: false,
    message: false,
  })
  const [status, setStatus] = useState<Status>('idle')

  const errors = validateAll(fields)
  const isValid = !errors.name && !errors.email && !errors.message
  const sidePhoto = getPhoto('landscape-03')

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFields((prev) => ({ ...prev, [name]: value }))
  }

  const handleBlur = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched((prev) => ({ ...prev, [event.target.name]: true }))
  }

  const visibleError = (name: keyof Fields): string | undefined =>
    touched[name] ? errors[name] : undefined

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setTouched({ name: true, email: true, message: true })
    if (!isValid || status !== 'idle') return
    // 无后端：模拟发送过程，随后切换到与原始表单明确区分的成功态。
    setStatus('sending')
    window.setTimeout(() => setStatus('success'), 900)
  }

  const resetForm = () => {
    setFields({ name: '', email: '', message: '' })
    setTouched({ name: false, email: false, message: false })
    setStatus('idle')
  }

  return (
    <div className="contact-page page-section">
      <div className="contact-split">
        <section className="contact-intro">
          <p className="eyebrow">Contact</p>
          <h1>联系</h1>
          <p className="contact-lead">
            展览、出版、肖像委托与长期拍摄合作，都可以写信告诉我。
            我通常在两个工作日内回复；高原驻拍期间可能稍慢，请见谅。
          </p>

          <dl className="contact-details">
            <div>
              <dt>邮箱</dt>
              <dd>studio@linzhao.photo</dd>
            </div>
            <div>
              <dt>工作室</dt>
              <dd>四川 · 康定</dd>
            </div>
            <div>
              <dt>档期</dt>
              <dd>接受次年春季后的肖像与驻地合作预约</dd>
            </div>
          </dl>

          <div className="contact-side-image">
            <img
              src={photoUrl(sidePhoto)}
              alt={sidePhoto.altText}
              width={sidePhoto.width}
              height={sidePhoto.height}
              loading="lazy"
            />
          </div>
        </section>

        <section className="contact-form-wrap">
          {status === 'success' ? (
            <div className="contact-success" role="status">
              <span className="success-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="40" height="40">
                  <path
                    d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.7 7.7-5.6 5.6a1 1 0 0 1-1.4 0l-2.4-2.4a1 1 0 1 1 1.4-1.4l1.7 1.7 4.9-4.9a1 1 0 0 1 1.4 1.4Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <h2>谢谢你的来信</h2>
              <p>
                {fields.name}，你的留言已经送达。我会在两个工作日内通过
                <strong> {fields.email} </strong>
                与你联系。
              </p>
              <button type="button" className="btn btn-ghost" onClick={resetForm}>
                再写一封
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className={`field${visibleError('name') ? ' has-error' : ''}`}>
                <label htmlFor="name">姓名</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={fields.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(visibleError('name'))}
                  aria-describedby={visibleError('name') ? 'name-error' : undefined}
                  placeholder="你希望我如何称呼你"
                />
                {visibleError('name') && <p id="name-error" className="field-error">{visibleError('name')}</p>}
              </div>

              <div className={`field${visibleError('email') ? ' has-error' : ''}`}>
                <label htmlFor="email">邮箱</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={fields.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(visibleError('email'))}
                  aria-describedby={visibleError('email') ? 'email-error' : undefined}
                  placeholder="name@example.com"
                />
                {visibleError('email') && (
                  <p id="email-error" className="field-error">{visibleError('email')}</p>
                )}
              </div>

              <div className={`field${visibleError('message') ? ' has-error' : ''}`}>
                <label htmlFor="message">留言</label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={fields.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(visibleError('message'))}
                  aria-describedby={visibleError('message') ? 'message-error' : undefined}
                  placeholder="简单说说拍摄主题、时间与地点"
                />
                {visibleError('message') && (
                  <p id="message-error" className="field-error">{visibleError('message')}</p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-gold btn-submit"
                disabled={!isValid || status === 'sending'}
              >
                {status === 'sending' ? '正在发送…' : '发送消息'}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
