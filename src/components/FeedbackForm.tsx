import { useState, type FormEvent } from 'react'
import { FEEDBACK_URL, feedbackAvailable } from '../feedback'
import { SmallButton } from './SmallButton'

// "Share feedback": a text box whose message is emailed to the game's maker.
//
// A website alone can't send email (that needs a server), so the message
// goes to a form service (Formspree, formspree.io), which emails it on.
// The form's address is a setting, VITE_FEEDBACK_URL (src/feedback.ts).
// Your email address never appears in the code: only the form service
// knows it.
//
// Without the setting, the form says it isn't connected yet while
// developing, and doesn't appear at all on the published site.

type Status = 'idle' | 'sending' | 'sent' | 'error'

type FeedbackFormProps = {
  /** A line about the game (players, final stars), sent along for context. Shown to the player. */
  context?: string
}

export function FeedbackForm({ context }: FeedbackFormProps) {
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  if (!feedbackAvailable) return null

  const send = async (e: FormEvent) => {
    e.preventDefault()
    if (!FEEDBACK_URL || !message.trim()) return
    setStatus('sending')
    try {
      const response = await fetch(FEEDBACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ message, email: email || undefined, game: context }),
      })
      setStatus(response.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return <p className="font-mono text-[18px] leading-[1.3] text-ink-soft">Thank you! Your note is on its way.</p>
  }

  // Focused: the border just gets a little thicker (a 1px shadow hugging it)
  const field = 'w-full rounded-[5px] border border-ink-soft bg-cream px-[10px] py-[8px] font-mono text-[15px] text-ink-soft placeholder:text-ink-soft/50 focus:outline-none focus:shadow-[0_0_0_1px_var(--color-ink-soft)]'
  return (
    <form onSubmit={send} className="flex w-full flex-col gap-[8px]">
      <label className="sr-only" htmlFor="feedback-message">
        Your feedback
      </label>
      <textarea
        id="feedback-message"
        rows={4}
        maxLength={2000}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="What did you think? What would you change?"
        className={`${field} resize-none`}
      />
      <label className="sr-only" htmlFor="feedback-email">
        Your email, if you'd like a reply (optional)
      </label>
      <input
        id="feedback-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email, for a reply (optional)"
        className={field}
      />
      {context && <p className="font-mono text-[11px] leading-[1.25] text-ink-soft/80">Sent with it: {context}</p>}
      <div className="flex items-center gap-[12px]">
        <SmallButton type="submit" width={110} disabled={!FEEDBACK_URL || !message.trim() || status === 'sending'}>
          {status === 'sending' ? 'sending' : 'send'}
        </SmallButton>
        {!FEEDBACK_URL && <p className="font-mono text-[12px] leading-[1.2] text-ink-soft">Not connected yet: add VITE_FEEDBACK_URL (see README).</p>}
        {status === 'error' && <p className="font-mono text-[13px] leading-[1.2] text-ink-soft">That didn't send. Please try again.</p>}
      </div>
    </form>
  )
}
