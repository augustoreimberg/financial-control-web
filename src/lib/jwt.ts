import { cookies } from 'next/headers'

export const getJwtToken = () => {
  const cookieStore = cookies()
  const token = cookieStore.get('accessToken')
  return token?.value
}

export const setJwtToken = (token: string) => {
  const cookieStore = cookies()
  cookieStore.set({
    name: 'accessToken',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: '/',
  })
}

export const removeJwtToken = () => {
  const cookieStore = cookies()
  cookieStore.delete('accessToken')
} 