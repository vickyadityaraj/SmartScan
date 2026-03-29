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
  const router = useRouter()

  const handleLookup = useCallback(async (barcode: string) => {
    if (!barcode) return
    setIsLookingUp(true)
    
    // Slight artificial delay to indicate work and prevent double scans
    const res = await lookupProductByBarcode(barcode)
    
    if (res.error) {
      toast.error(res.error)
    } else if (res.product) {
      addItem(res.product)
    }
    
    setIsLookingUp(false)
  }, [addItem])

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
    </div>
  )
}
