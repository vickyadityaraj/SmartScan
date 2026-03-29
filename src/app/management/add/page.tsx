'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { addProduct } from '../actions'
import { Loader2, PackagePlus, ArrowLeft, Image as ImageIcon, Barcode, DollarSign, Weight } from 'lucide-react'
import Link from 'next/link'

export default function AddProductPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const router = useRouter()

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    const res = await addProduct(formData)
    
    setIsSubmitting(false)

    if (res.success) {
      toast.success('Product added to catalog!')
      router.push('/management')
    } else {
      toast.error(res.error || 'Failed to add product')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <Link href="/management" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-primary transition-colors mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Inventory
      </Link>

      <Card className="border-0 shadow-2xl overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-800">
        <CardHeader className="bg-primary/5 pb-8 pt-10">
          <div className="flex gap-4 items-center mb-2">
            <div className="p-3 bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/20">
              <PackagePlus className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">New Product</CardTitle>
              <CardDescription>Catalog a new item into the inventory system.</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-8 px-8">
          <form id="add-product-form" onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-widest font-bold text-zinc-500">Product Name</Label>
                <div className="relative">
                  <PackagePlus className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input id="name" name="name" required placeholder="Luxury Chocolate" className="pl-10 h-11 bg-zinc-50/50 dark:bg-zinc-900/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode" className="text-xs uppercase tracking-widest font-bold text-zinc-500">Barcode / SKU</Label>
                <div className="relative">
                  <Barcode className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input id="barcode" name="barcode" required placeholder="750123456789" className="pl-10 h-11 bg-zinc-50/50 dark:bg-zinc-900/50" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-xs uppercase tracking-widest font-bold text-zinc-500">Price ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input id="price" name="price" type="number" step="0.01" required placeholder="9.99" className="pl-10 h-11 bg-zinc-50/50 dark:bg-zinc-900/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-xs uppercase tracking-widest font-bold text-zinc-500">Weight (g)</Label>
                <div className="relative">
                  <Weight className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input id="weight" name="weight" type="number" step="0.1" required placeholder="250.0" className="pl-10 h-11 bg-zinc-50/50 dark:bg-zinc-900/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock" className="text-xs uppercase tracking-widest font-bold text-zinc-500">Initial Stock</Label>
                <Input id="stock" name="stock" type="number" required defaultValue="50" className="h-11 bg-zinc-50/50 dark:bg-zinc-900/50" />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-xs uppercase tracking-widest font-bold text-zinc-500">Product Image</Label>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center overflow-hidden transition-all hover:border-primary">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-zinc-300" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Input 
                    id="image" 
                    name="image" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="cursor-pointer file:font-semibold file:text-primary file:mr-4 file:bg-primary/10 file:border-0 hover:file:bg-primary/20 transition-all"
                  />
                  <p className="text-xs text-zinc-500 italic">Recommended size: 800x600px, Max 5MB</p>
                </div>
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter className="px-8 pb-10 pt-4 flex gap-3">
          <Button 
            form="add-product-form" 
            type="submit" 
            disabled={isSubmitting} 
            className="flex-1 h-12 text-md font-bold shadow-lg shadow-primary/20"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PackagePlus className="mr-2 h-5 w-5" />}
            Provision Product
          </Button>
          <Link href="/management" className="flex-1">
            <Button variant="ghost" className="w-full h-12 text-md font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900">
              Cancel
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
