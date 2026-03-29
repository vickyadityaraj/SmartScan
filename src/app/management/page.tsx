import { getProducts } from './actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Edit2, PackageOpen } from 'lucide-react'

export default async function ManagementDashboard() {
  const products = await getProducts()

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-zinc-500">Manage your product catalog and stock levels.</p>
        </div>
        <Link href="/management/add">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>A list of all products currently in your catalog ({products.length} total).</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-500 border-2 border-dashed rounded-lg">
               <PackageOpen className="h-10 w-10 mb-4 text-zinc-300" />
               <p>No products found in the catalog.</p>
               <Link href="/management/add">
                 <Button variant="outline" className="mt-4">Add your first product</Button>
               </Link>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-zinc-100/50 data-[state=selected]:bg-zinc-100 dark:hover:bg-zinc-800/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Image</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Name</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Barcode</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Price</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Weight (g)</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-zinc-500">Stock</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-zinc-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {products.map((product: any) => (
                    <tr key={product.id} className="border-b transition-colors hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50">
                      <td className="p-4 align-middle">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="h-10 w-10 object-cover rounded bg-zinc-100" />
                        ) : (
                          <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center text-zinc-400 text-xs">
                            No Img
                          </div>
                        )}
                      </td>
                      <td className="p-4 align-middle font-medium">{product.name}</td>
                      <td className="p-4 align-middle font-mono text-zinc-500">{product.barcode}</td>
                      <td className="p-4 align-middle">${product.price.toFixed(2)}</td>
                      <td className="p-4 align-middle">{product.weight}g</td>
                      <td className="p-4 align-middle">
                        <div className={`px-2 py-1 inline-flex text-xs font-medium rounded-full ${
                          product.stock > 10 ? 'bg-green-100 text-green-700' : 
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {product.stock} in stock
                        </div>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <Button variant="ghost" size="icon" title="Edit">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
