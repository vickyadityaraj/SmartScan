'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Link from 'next/link'
import { getProducts, updateProductStock } from './actions'
import { Package, Plus, Search, Loader2, AlertCircle, ShoppingCart } from 'lucide-react'

export default function ManagementPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const data = await getProducts()
    setProducts(data)
    setLoading(false)
  }

  async function handleStockUpdate(id: string, currentStock: number, delta: number) {
    const newStock = Math.max(0, currentStock + delta)
    const res = await updateProductStock(id, newStock)
    if (res.success) {
      setProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p))
      toast.success('Stock updated')
    } else {
      toast.error(res.error || 'Failed to update stock')
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.barcode.includes(search)
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Inventory Terminal</h1>
          <p className="text-zinc-500 mt-1">Manage your catalog and stock levels in real-time.</p>
        </div>
        <Link href="/management/add">
          <Button className="h-11 px-6 shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
            <Plus className="mr-2 h-5 w-5" /> Add New Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary text-primary-foreground rounded-2xl">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Total SKUs</p>
                <h3 className="text-2xl font-bold">{products.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500 text-white rounded-2xl">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Low Stock Items</p>
                <h3 className="text-2xl font-bold">{products.filter(p => p.stock < 10).length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 text-white rounded-2xl">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500">Last Added</p>
                <h3 className="text-2xl font-bold truncate max-w-[150px]">
                  {products[0]?.name || 'N/A'}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
        <Input 
          placeholder="Search items by name or barcode..." 
          className="pl-12 h-14 text-lg bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm focus:ring-primary"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-zinc-500 font-medium italic">Synchronizing catalog...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {filteredProducts.map((p) => (
            <Card key={p.id} className="group overflow-hidden border-zinc-200 dark:border-zinc-800 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-900 relative">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-400 italic text-sm">No image available</div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge variant={p.stock < 10 ? "destructive" : "secondary"} className="shadow-lg backdrop-blur-md">
                    {p.stock} in stock
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{p.name}</CardTitle>
                <CardDescription className="font-mono text-xs">{p.barcode}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-2xl font-black text-primary">${Number(p.price).toFixed(2)}</span>
                  <span className="text-sm text-zinc-500">{p.weight}g</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 h-10 border-2 font-bold" onClick={() => handleStockUpdate(p.id, p.stock, -1)}>- 1</Button>
                  <Button variant="outline" className="flex-1 h-10 border-2 font-bold" onClick={() => handleStockUpdate(p.id, p.stock, 1)}>+ 1</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
