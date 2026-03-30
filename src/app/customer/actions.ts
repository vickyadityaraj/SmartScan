'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'

export async function getCustomerOrders() {
  const session = await getSession()
  if (!session) throw new Error('Not authenticated')

  const supabase = await createAdminClient()

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      total_price,
      total_weight,
      status,
      created_at,
      qr_code_value,
      order_items (
        quantity,
        price_at_purchase,
        products (
          name,
          image_url
        )
      )
    `)
    .eq('user_id', session.userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return []
  }

  return orders || []
}
