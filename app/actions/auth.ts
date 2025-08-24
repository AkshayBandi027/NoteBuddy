"use server"

import { auth } from "@/lib/auth"

export const signIn = async (values: { email: string; password: string }) => {
  const { email, password } = values
  await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  })
}

export const signUp = async (values: {
  username: string
  password: string
  email: string
}) => {
  const { username, password, email } = values
  await auth.api.signUpEmail({
    body: {
      name: username,
      email,
      password,
    },
  })
}
