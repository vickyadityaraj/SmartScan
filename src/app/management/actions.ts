'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'

export async function getProducts() {
  const session = await getSession()
  if (!session || !['management', 'admin'].includes(session.role)) {
    return []
  }

  const supabase = await createAdminClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data || []
}

export async function updateProductStock(productId: string, newStock: number) {
  const session = await getSession()
  if (!session || !['management', 'admin'].includes(session.role)) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createAdminClient()
  
  const { error } = await supabase
    .from('products')
    .update({ stock: newStock })
    .eq('id', productId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/management')
  return { success: true }
}

export async function addProduct(formData: FormData) {
  const session = await getSession()
  if (!session || !['management', 'admin'].includes(session.role)) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createAdminClient()
  const adminClient = await createAdminClient() // Privileged client for storage
  
  const name = formData.get('name') as string
  const barcode = formData.get('barcode') as string
  const price = parseFloat(formData.get('price') as string)
  const weight = parseFloat(formData.get('weight') as string)
  const stock = parseInt(formData.get('stock') as string, 10)
  const image = formData.get('image') as File | null

  let image_url = null

  if (image && image.size > 0 && image.name !== 'undefined') {
    const fileExt = image.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `product_images/${fileName}`

    const { error: uploadError } = await adminClient
      .storage
      .from('product-images')
      .upload(filePath, image)

    if (uploadError) {
      console.error(uploadError)
      return { error: 'Failed to upload image.' }
    }

    const { data } = adminClient.storage.from('product-images').getPublicUrl(filePath)
    image_url = data.publicUrl
  }

  const { error: insertError } = await supabase
    .from('products')
    .insert({
      name,
      barcode,
      price,
      weight,
      stock,
      image_url
    })

  if (insertError) {
    return { error: insertError.message }
  }

  revalidatePath('/management')
  return { success: true }
}

export async function deleteProduct(productId: string) {
  const session = await getSession()
  if (!session || !['management', 'admin'].includes(session.role)) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createAdminClient()
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) {
    if (error.code === '23503') return { error: 'Cannot delete product with existing orders.' }
    return { error: error.message }
  }

  revalidatePath('/management')
  return { success: true }
}
