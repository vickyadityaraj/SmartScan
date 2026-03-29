'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function getAdminAnalytics() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()

  // Transactions metrics
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('total_price, created_at, status')

  if (ordersError) return { error: ordersError.message }

  // Inventory metrics
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, stock')

  if (productsError) return { error: productsError.message }

  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total_price) || 0), 0)
  const totalTransactions = orders.length
  
  // Group orders by date for chart
  const map = new Map<string, number>()
  orders.forEach(order => {
     const date = new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
     map.set(date, (map.get(date) || 0) + Number(order.total_price))
  })
  const revenueData = Array.from(map.entries()).map(([date, amount]) => ({ date, amount }))

  return { 
    totalRevenue, 
    totalTransactions, 
    totalProducts: products.length,
    lowStockCount: products.filter(p => p.stock < 10).length,
    revenueData
  }
}

export async function createInternalUser(formData: FormData) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return { error: 'Unauthorized. Admins only.' }
    }

    const email = formData.get('email') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as string
    const password = formData.get('password') as string

    if (!password || password.length < 6) {
      return { error: 'Password must be at least 6 characters.' }
    }

    const supabase = await createClient()

    // 1. Hash the temporary password
    const passwordHash = await bcrypt.hash(password, 10)

    // 2. Insert user directly into public.users
    const { error } = await supabase
      .from('users')
      .insert({
        email,
        name,
        role,
        password_hash: passwordHash
      })

    if (error) {
      if (error.code === '23505') return { error: 'Email already registered.' }
      return { error: error.message }
    }

    revalidatePath('/admin/users')
    return { success: true }
    
  } catch (err: any) {
    return { error: err.message || 'Failed to create user' }
  }
}

export async function getUsersList() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return { data: [], error: 'Unauthorized' }
  }

  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data }
}
