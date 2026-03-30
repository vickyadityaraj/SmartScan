'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Link from 'next/link'
import { getProducts, updateProductStock, deleteProduct } from './actions'
import { Package, Plus, Search, Loader2, AlertCircle, ShoppingCart, Scan, X, Trash2 } from 'lucide-react'
import { Scanner } from '@/components/scanner'

export default function ManagementPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showScanner, setShowScanner] = useState(false)

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

  async function handleProductDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    const res = await deleteProduct(id)
    if (res.success) {
      setProducts(products.filter(p => p.id !== id))
      toast.success('Product removed from catalog')
    } else {
      toast.error(res.error || 'Failed to delete product')
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

      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search items by name or barcode..." 
            className="pl-12 pr-44 h-16 text-lg bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl shadow-black/5 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
            {search && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSearch('')}
                className="h-10 w-10 p-0 text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
            <Button 
              onClick={() => setShowScanner(!showScanner)}
              variant={showScanner ? "default" : "secondary"}
              className="h-10 rounded-xl px-4 font-bold text-[10px] uppercase tracking-widest gap-2"
            >
              {showScanner ? <X className="h-4 w-4" /> : <Scan className="h-4 w-4" />}
              {showScanner ? "Close" : "Scan to Search"}
            </Button>
          </div>
        </div>

        {showScanner && (
          <div className="max-w-xl mx-auto animate-in slide-in-from-top-4 duration-300">
            <Scanner onScan={(text) => {
              setSearch(text)
              setShowScanner(false)
              toast.success(`Filtering for: ${text}`)
            }} />
          </div>
        )}
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
                <div className="absolute top-3 right-3 flex gap-2">
                  <Badge variant={p.stock < 10 ? "destructive" : "secondary"} className="shadow-lg backdrop-blur-md">
                    {p.stock} in stock
                  </Badge>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleProductDelete(p.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex justify-between items-center gap-2">
                  <span className="truncate">{p.name}</span>
                </CardTitle>
                <CardDescription className="font-mono text-xs truncate bg-zinc-100 dark:bg-zinc-900 p-1 rounded inline-block w-fit">{p.barcode}</CardDescription>
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

          {filteredProducts.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
              <div className="p-4 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-4">
                <Search className="h-10 w-10 text-zinc-400" />
              </div>
              <h3 className="text-xl font-bold">No products found</h3>
              <p className="text-zinc-500 mb-6">We couldn't find anything matching "{search}"</p>
              <Button onClick={() => setSearch('')} variant="outline" className="rounded-xl">Clear search filters</Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
