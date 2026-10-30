import { LoginForm } from "@/components/login-form"
import { isGoogleAuthEnabled } from "@/lib/auth"

export default function UnauthorizedPage() {
  return (
    <main>
      <h1>401 - Unauthorized</h1>
      <p>Please log in to access this page.</p>
      <LoginForm showGoogleAuth={isGoogleAuthEnabled} />
    </main>
  )
}
