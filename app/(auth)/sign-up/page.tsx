import { GalleryVerticalEnd } from "lucide-react"

import { SignupForm } from "@/components/sign-up-form"

import { isGoogleAuthEnabled } from "@/lib/auth"

export default function SignUp() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            NoteBuddy
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm showGoogleAuth={isGoogleAuthEnabled} />
          </div>
        </div>
      </div>
      <div className="from-primary/20 via-background to-background relative hidden bg-gradient-to-br lg:block" />
    </div>
  )
}
