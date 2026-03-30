import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function Home() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const { role } = session

  // Redirect based on role
  if (role === 'admin') {
    redirect('/admin/users')
  } else if (role === 'security') {
    redirect('/security')
  } else if (role === 'management') {
    redirect('/management')
  } else {
    redirect('/customer')
  }
}
