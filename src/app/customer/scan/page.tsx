'use client'

import { useCallback, useState } from 'react'
import { Scanner } from '@/components/scanner'
import { useCart } from '@/components/providers/cart-provider'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { lookupProductByBarcode, submitCheckoutAction } from './actions'
import { Loader2, Plus, Minus, Trash2, Camera, MapPin, ScanLine } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ScanPage() {
  const { items, addItem, updateQuantity, removeItem, totalPrice, totalWeight, clearCart } = useCart()
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [manualBarcode, setManualBarcode] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  
  // Confirmation Popup State
  const [scannedProduct, setScannedProduct] = useState<any | null>(null)
  const [scannedQuantity, setScannedQuantity] = useState(1)
  
  const router = useRouter()

  const handleLookup = useCallback(async (barcode: string) => {
    if (!barcode) return
    setIsLookingUp(true)
    
    const res = await lookupProductByBarcode(barcode)
    
    if (res.error) {
      toast.error(res.error)
    } else if (res.product) {
      setScannedProduct(res.product)
      setScannedQuantity(1)
    }
    
    setIsLookingUp(false)
  }, [])

  function confirmAdd() {
    if (scannedProduct) {
      addItem(scannedProduct, scannedQuantity)
      setScannedProduct(null)
      setScannedQuantity(1)
    }
  }

  async function handleCheckout() {
    if (items.length === 0) return
    setIsCheckingOut(true)

    const payload = items.map(item => ({
      id: item.id,
      quantity: item.quantity,
      price_at_purchase: item.price
    }))

    const res = await submitCheckoutAction(payload, totalPrice, totalWeight)

    setIsCheckingOut(false)

    if (res?.error) {
      toast.error('Checkout failed: ' + res.error)
    } else if (res?.success) {
      toast.success('Payment successful!')
      clearCart()
      router.push(`/customer/success?qr=${res.qrCode}&id=${res.orderId}`)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
      <div className="space-y-4 flex flex-col items-center">
        <h1 className="text-2xl font-bold tracking-tight text-left w-full">Scan Items</h1>
        
        {cameraActive ? (
          <div className="w-full relative">
            <Scanner onScan={handleLookup} />
            <Button variant="outline" className="mt-4 w-full" onClick={() => setCameraActive(false)}>
              Turn off camera
            </Button>
          </div>
        ) : (
          <Card className="w-full flex flex-col items-center justify-center p-12 py-24 border-dashed bg-zinc-50 dark:bg-zinc-900">
            <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => setCameraActive(true)}>
               <Camera className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium">Activate Camera</h3>
            <p className="text-sm text-zinc-500 text-center max-w-[200px]">Tap above to scan a barcode using your device camera.</p>
          </Card>
        )}

        <div className="flex gap-2 w-full mt-4">
          <Input 
            placeholder="Or enter barcode manually..." 
            value={manualBarcode} 
            onChange={(e) => setManualBarcode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleLookup(manualBarcode)
                setManualBarcode('')
              }
            }}
          />
          <Button disabled={isLookingUp || !manualBarcode} onClick={() => {
            handleLookup(manualBarcode)
            setManualBarcode('')
          }}>
            {isLookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="h-full flex flex-col">
          <CardHeader className="bg-zinc-50 dark:bg-zinc-900 border-b">
            <CardTitle>Your Cart</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto min-h-[300px] p-0">
            {items.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-zinc-500 pt-16">
                 <MapPin className="h-12 w-12 text-zinc-200 dark:text-zinc-800 mb-4" />
                 <p>Your cart is empty.</p>
               </div>
            ) : (
              <ul className="divide-y">
                {items.map(item => (
                  <li key={item.id} className="p-4 flex gap-4 items-center">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="h-16 w-16 rounded-md object-cover bg-zinc-100" />
                    ) : (
                      <div className="h-16 w-16 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <ScanLine className="h-6 w-6 text-zinc-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{item.name}</h4>
                      <p className="text-xs text-zinc-500">{item.weight}g each</p>
                      <div className="mt-2 flex items-center gap-3">
                        <Button size="icon" variant="outline" className="h-6 w-6 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <Button size="icon" variant="outline" className="h-6 w-6 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                       <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                       <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeItem(item.id)}>
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-4 border-t p-6 pb-8">
            <div className="flex justify-between w-full text-lg">
              <span className="font-medium text-zinc-600">Total</span>
              <span className="font-bold">${totalPrice.toFixed(2)}</span>
            </div>
            <Button 
              size="lg" 
              className="w-full text-lg h-14" 
              disabled={items.length === 0 || isCheckingOut}
              onClick={handleCheckout}
            >
              {isCheckingOut ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {isCheckingOut ? 'Processing...' : 'Pay with Mobile Wallet'}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Confirmation Popup */}
      {scannedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <Card className="w-full max-w-md shadow-2xl border-2 border-primary/20 animate-in zoom-in-95 duration-300">
              <CardHeader className="text-center bg-zinc-50 dark:bg-zinc-950 border-b">
                 <CardTitle className="text-xl">Add to Cart</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 text-center">
                 {scannedProduct.image_url ? (
                   <img src={scannedProduct.image_url} alt={scannedProduct.name} className="h-40 w-40 mx-auto rounded-xl object-cover shadow-lg mb-4" />
                 ) : (
                   <div className="h-40 w-40 mx-auto rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                      <ScanLine className="h-12 w-12 text-zinc-300" />
                   </div>
                 )}
                 <h2 className="text-xl font-bold">{scannedProduct.name}</h2>
                 <p className="text-primary font-bold text-2xl mt-1">${scannedProduct.price.toFixed(2)}</p>
                 <p className="text-zinc-500 text-sm mt-1">{scannedProduct.weight}g per unit</p>
                 
                 <div className="mt-8 space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Select Quantity</p>
                    <div className="flex items-center justify-center gap-6">
                       <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-12 w-12 rounded-full border-2" 
                          onClick={() => setScannedQuantity(prev => Math.max(1, prev - 1))}
                       >
                          <Minus className="h-5 w-5" />
                       </Button>
                       <span className="text-3xl font-bold w-12">{scannedQuantity}</span>
                       <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-12 w-12 rounded-full border-2" 
                          onClick={() => setScannedQuantity(prev => prev + 1)}
                       >
                          <Plus className="h-5 w-5" />
                       </Button>
                    </div>
                 </div>
              </CardContent>
              <CardFooter className="flex gap-3 pt-6 border-t mt-4">
                 <Button variant="ghost" className="flex-1 h-12" onClick={() => setScannedProduct(null)}>
                    Cancel
                 </Button>
                 <Button className="flex-1 h-12 text-lg font-bold" onClick={confirmAdd}>
                    Add to Cart
                 </Button>
              </CardFooter>
           </Card>
        </div>
      )}
    </div>
  )
}
