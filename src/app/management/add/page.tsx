'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { addProduct } from '../actions'
import { Loader2, UploadCloud, RefreshCw, Hand } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AddProductPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [barcodeValue, setBarcodeValue] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const generateBarcode = () => {
    // Generates a mock 12-digit EAN-like barcode
    const randomEAN = Math.floor(Math.random() * 900000000000) + 100000000000
    setBarcodeValue(randomEAN.toString())
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    const file = fileInputRef.current?.files?.[0]
    if (file) {
      formData.set('image', file)
    }

    const { error, success } = await addProduct(formData)
    
    setIsSubmitting(false)

    if (error) {
      toast.error(error)
    } else if (success) {
      toast.success('Product added successfully!')
      router.push('/management')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
        <p className="text-zinc-500">Create a new item in the store's inventory.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>Enter the physical specifics and pricing data.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="add-product-form" onSubmit={onSubmit} className="space-y-6">
            
            <div className="space-y-2">
               <Label htmlFor="image">Product Image</Label>
               <div 
                 className="mt-2 flex justify-center rounded-lg border border-dashed border-zinc-900/25 dark:border-zinc-100/25 px-6 py-10 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors"
                 onClick={() => fileInputRef.current?.click()}
               >
                 <div className="text-center">
                   {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="mx-auto h-32 object-cover rounded shadow-sm" />
                   ) : (
                      <UploadCloud className="mx-auto h-12 w-12 text-zinc-300" aria-hidden="true" />
                   )}
                   <div className="mt-4 flex text-sm leading-6 text-zinc-600 dark:text-zinc-400 justify-center">
                     <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80">
                       <span>Upload a file</span>
                     </label>
                     <p className="pl-1">or drag and drop</p>
                   </div>
                   <p className="text-xs leading-5 text-zinc-500">PNG, JPG up to 10MB</p>
                 </div>
               </div>
               <input id="image" type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required placeholder="e.g. Organic Bananas" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <div className="flex gap-2">
                   <Input id="barcode" name="barcode" required value={barcodeValue} onChange={e => setBarcodeValue(e.target.value)} placeholder="012345678912" className="font-mono" />
                   <Button type="button" variant="outline" size="icon" onClick={generateBarcode} title="Generate random barcode">
                      <RefreshCw className="h-4 w-4" />
                   </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input id="price" name="price" type="number" step="0.01" min="0" required placeholder="4.99" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (grams)</Label>
                <Input id="weight" name="weight" type="number" step="1" min="1" required placeholder="500" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="stock">Initial Stock Quantity</Label>
                <Input id="stock" name="stock" type="number" step="1" min="0" required defaultValue="50" />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button form="add-product-form" type="submit" disabled={isSubmitting}>
             {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
             Save Product
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
