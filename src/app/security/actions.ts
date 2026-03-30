'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'

export async function lookupOrderByQr(qrValue: string) {
  const session = await getSession()
  if (!session || !['security', 'admin'].includes(session.role)) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      total_price,
      total_weight,
      status,
      created_at,
      user_id,
      users (
        name,
        email
      ),
      order_items (
        quantity,
        price_at_purchase,
        products (
          id,
          name,
          barcode,
          weight
        )
      )
    `)
    .eq('qr_code_value', qrValue)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return { error: 'Invalid or unknown QR Pass' }
    return { error: error.message }
  }

  return { order: data }
}

export async function markOrderVerified(orderId: string) {
  const session = await getSession()
  if (!session || !['security', 'admin'].includes(session.role)) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createAdminClient()
  
  const { error } = await supabase
    .from('orders')
    .update({ status: 'verified' })
    .eq('id', orderId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/security')
  return { success: true }
}
