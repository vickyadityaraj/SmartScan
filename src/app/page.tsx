import { redirect } from 'next/navigation'

export default function Home() {
  // Proxy should intercept this, but just in case:
  redirect('/login')
}
