// Where feedback goes (see src/components/FeedbackForm.tsx for how it's sent).
// VITE_FEEDBACK_URL is set in `.env.local` while developing, and in the
// hosting service's settings for the published site. See `.env.example`.

export const FEEDBACK_URL: string | undefined = import.meta.env.VITE_FEEDBACK_URL

/** Whether the feedback form can show at all: connected, or while developing. */
export const feedbackAvailable = !!FEEDBACK_URL || import.meta.env.DEV
