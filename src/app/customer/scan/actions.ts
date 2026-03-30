'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'

export async function lookupProductByBarcode(barcode: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('barcode', barcode)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return { error: 'Product not found' }
    }
    return { error: error.message }
  }

  return { product: data }
}

export async function submitCheckoutAction(items: { id: string, quantity: number, price_at_purchase: number }[], totalPrice: number, totalWeight: number) {
  const session = await getSession()
  if (!session) {
    return { error: 'Not authenticated' }
  }

  const supabase = await createAdminClient()

  // Generate a random hex string for the QR code value
  const qr_code_value = [...Array(32)].map(() => Math.floor(Math.random() * 16).toString(16)).join("")

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: session.userId,
      total_price: totalPrice,
      total_weight: totalWeight,
      qr_code_value: qr_code_value,
      status: 'paid'
    })
    .select('id, qr_code_value')
    .single()

  if (orderError) {
    return { error: orderError.message }
  }

  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.id,
    quantity: item.quantity,
    price_at_purchase: item.price_at_purchase
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    return { error: itemsError.message }
  }

  // Decrease stock for each product
  // In a production environment, this should ideally be done in a single transaction or via an RPC
  for (const item of items) {
    const { data: currentProduct } = await supabase
      .from('products')
      .select('stock')
      .eq('id', item.id)
      .single()

    if (currentProduct) {
      await supabase
        .from('products')
        .update({ stock: Math.max(0, currentProduct.stock - item.quantity) })
        .eq('id', item.id)
    }
  }

  revalidatePath('/customer')
  revalidatePath('/management') // Revalidate inventory as well
  
  return { success: true, orderId: order.id, qrCode: order.qr_code_value }
}
