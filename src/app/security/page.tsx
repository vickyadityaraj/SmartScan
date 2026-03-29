'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { lookupOrderByQr, markOrderVerified } from './actions'
import { toast } from 'sonner'
import { Loader2, ShieldCheck, Camera, Check, AlertTriangle, ArrowLeft, RefreshCw, XCircle } from 'lucide-react'
import { Scanner } from '@/components/scanner'

export default function SecurityDashboard() {
  const [qrValue, setQrValue] = useState('')
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  
  // Active Order State
  const [activeOrder, setActiveOrder] = useState<any>(null)
  
  // Verification States
  const [verificationMode, setVerificationMode] = useState<'none'|'weight'|'scan'>('none')
  const [measuredWeight, setMeasuredWeight] = useState('')
  const [scannedBarcodes, setScannedBarcodes] = useState<string[]>([])
  const [currentScanInput, setCurrentScanInput] = useState('')

  async function handleQRSubmit(value: string) {
    if (!value) return
    setIsLookingUp(true)
    const { order, error } = await lookupOrderByQr(value)
    setIsLookingUp(false)
    
    if (error || !order) {
      toast.error(error || 'Invalid QR')
      return
    }
    
    if (order.status === 'verified') {
      toast.error('This pass has already been verified and used!')
    }
    
    setActiveOrder(order)
    setCameraActive(false)
    setQrValue('')
    setVerificationMode('none')
    setScannedBarcodes([])
    setMeasuredWeight('')
  }

  async function handleVerifySubmit() {
    if (!activeOrder) return
    setIsLookingUp(true)
    const { error } = await markOrderVerified(activeOrder.id)
    setIsLookingUp(false)

    if (error) {
       toast.error(error)
    } else {
       toast.success('Order Verified Successfully. Customer may exit.')
       setActiveOrder(null)
    }
  }

  if (activeOrder) {
    // Determine status of secondary verifications
    const weightMatch = measuredWeight ? Math.abs(parseFloat(measuredWeight) - activeOrder.total_weight) <= 10 : null // 10g tolerance
    
    let allScannedMatcher = null
    if (verificationMode === 'scan') {
      // Flatten expected barcodes based on quantity
      const expectedBarcodes: string[] = []
      activeOrder.order_items.forEach((item: any) => {
         for(let i = 0; i < item.quantity; i++) expectedBarcodes.push(item.products.barcode)
      })

      // Compare
      const remainingExpected = [...expectedBarcodes]
      let hasMismatch = false
      const matched: string[] = []
      
      scannedBarcodes.forEach(bc => {
         const idx = remainingExpected.indexOf(bc)
         if (idx !== -1) {
           remainingExpected.splice(idx, 1)
           matched.push(bc)
         } else {
           hasMismatch = true
         }
      })

      if (hasMismatch) {
        allScannedMatcher = false
      } else if (remainingExpected.length === 0) {
        allScannedMatcher = true
      }
    }

    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
           <Button variant="outline" onClick={() => setActiveOrder(null)}><ArrowLeft className="mr-2 h-4 w-4" /> Back to scanner</Button>
           <div className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 ${
             activeOrder.status === 'paid' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
           }`}>
              {activeOrder.status === 'paid' ? <AlertTriangle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              {activeOrder.status.toUpperCase()}
           </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
             <CardHeader className="bg-zinc-50 dark:bg-zinc-900 border-b">
                <CardTitle>Digital Receipt</CardTitle>
                <CardDescription>Order by: {activeOrder.users.name || activeOrder.users.email}</CardDescription>
             </CardHeader>
             <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between font-mono text-sm text-zinc-500">
                  <span>Expected Weight</span>
                  <span>{activeOrder.total_weight}g</span>
                </div>
                <div className="flex justify-between font-mono text-sm text-zinc-500">
                  <span>Total Items</span>
                  <span>{activeOrder.order_items.reduce((acc: number, item: any) => acc + item.quantity, 0)}</span>
                </div>
                
                <h4 className="font-semibold mt-6 mb-2">Item Breakdown</h4>
                <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
                   {activeOrder.order_items.map((item: any, idx: number) => (
                     <li key={idx} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded">
                       <span className="font-medium">{item.quantity}x {item.products.name}</span>
                       <span className="text-zinc-500 max-w-[100px] truncate font-mono text-xs">{item.products.barcode}</span>
                     </li>
                   ))}
                </ul>
             </CardContent>
          </Card>

          <Card className={`border-2 transition-colors ${
            weightMatch === true || allScannedMatcher === true ? 'border-green-500 bg-green-50/50 dark:bg-green-500/10' : 
            weightMatch === false || allScannedMatcher === false ? 'border-red-500 bg-red-50/50 dark:bg-red-500/10' : ''
          }`}>
             <CardHeader>
                <CardTitle>Verification Modes</CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
                {!verificationMode || verificationMode === 'none' ? (
                  <div className="grid gap-4">
                    <Button variant="secondary" className="h-16" onClick={() => setVerificationMode('weight')}>
                       Total Weight Check
                    </Button>
                    <Button variant="secondary" className="h-16" onClick={() => setVerificationMode('scan')}>
                       Manual Item Rescan
                    </Button>
                  </div>
                ) : verificationMode === 'weight' ? (
                   <div className="space-y-4">
                     <label className="text-sm font-medium">Place items on scale and enter weight (g)</label>
                     <div className="flex gap-2">
                       <Input type="number" value={measuredWeight} onChange={e => setMeasuredWeight(e.target.value)} placeholder="e.g. 500" className="h-12 text-lg" />
                     </div>
                     {weightMatch === true && (
                       <div className="flex items-center gap-2 text-green-600 font-semibold p-3 bg-green-100 dark:bg-green-900/40 rounded-lg">
                         <Check className="h-5 w-5" /> Weight matches expected (+/- 10g)
                       </div>
                     )}
                     {weightMatch === false && (
                       <div className="flex items-center gap-2 text-red-600 font-semibold p-3 bg-red-100 dark:bg-red-900/40 rounded-lg">
                         <XCircle className="h-5 w-5" /> Weight does not match!
                       </div>
                     )}
                   </div>
                ) : (
                   <div className="space-y-4">
                     <p className="text-sm text-zinc-500">Scan physical items again to verify against receipt.</p>
                     
                     <div className="flex gap-2">
                       <Input value={currentScanInput} onChange={e => setCurrentScanInput(e.target.value)} onKeyDown={(e) => {
                         if (e.key === 'Enter' && currentScanInput) {
                           setScannedBarcodes(prev => [...prev, currentScanInput])
                           setCurrentScanInput('')
                         }
                       }} placeholder="Enter barcode..." />
                       <Button onClick={() => {
                          if (currentScanInput) {
                            setScannedBarcodes(prev => [...prev, currentScanInput])
                            setCurrentScanInput('')
                          }
                       }}>Submit</Button>
                     </div>

                     <div className="text-sm font-medium">Scanned: {scannedBarcodes.length} / {activeOrder.order_items.reduce((acc: number, item: any) => acc + item.quantity, 0)}</div>
                     
                     {allScannedMatcher === true && (
                       <div className="flex items-center gap-2 text-green-600 font-semibold p-3 bg-green-100 dark:bg-green-900/40 rounded-lg">
                         <Check className="h-5 w-5" /> All items match receipt exactly!
                       </div>
                     )}
                     {allScannedMatcher === false && (
                       <div className="flex items-center gap-2 text-red-600 font-semibold p-3 bg-red-100 dark:bg-red-900/40 rounded-lg">
                         <XCircle className="h-5 w-5" /> Mismatch detected! Invalid barcode or extra item.
                       </div>
                     )}
                   </div>
                )}
             </CardContent>
             <CardFooter>
                 <Button 
                   className="w-full text-lg h-14" 
                   disabled={isLookingUp || activeOrder.status === 'verified'}
                   onClick={handleVerifySubmit}
                 >
                    {isLookingUp ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                    Finalize & Verify Order
                 </Button>
             </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500 pt-8">
       <div className="text-center">
         <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
           <ShieldCheck className="h-8 w-8" />
         </div>
         <h1 className="text-3xl font-bold tracking-tight">Security Checkpoint</h1>
         <p className="text-zinc-500 mt-2">Scan a customer's Exit Pass QR code to review their purchase.</p>
       </div>

       {cameraActive ? (
         <div className="space-y-4">
            <Scanner onScan={(text) => handleQRSubmit(text)} />
            <Button variant="outline" className="w-full" onClick={() => setCameraActive(false)}>Cancel Camera Scan</Button>
         </div>
       ) : (
         <Card className="border-2 border-dashed shadow-sm">
           <CardContent className="pt-6 flex flex-col items-center gap-4">
             <Button size="lg" className="w-full h-16 text-lg" onClick={() => setCameraActive(true)}>
               <Camera className="mr-2 h-6 w-6" /> Open Camera Scanner
             </Button>

             <div className="relative w-full my-2">
               <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
               <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-zinc-950 px-2 text-zinc-500">Or enter manually</span></div>
             </div>

             <div className="flex gap-2 w-full">
               <Input 
                 placeholder="Enter QR Hash..." 
                 className="h-12"
                 value={qrValue}
                 onChange={e => setQrValue(e.target.value)}
                 onKeyDown={(e) => {
                    if (e.key === 'Enter') handleQRSubmit(qrValue)
                 }}
               />
               <Button className="h-12 px-8" onClick={() => handleQRSubmit(qrValue)} disabled={isLookingUp || !qrValue}>
                 {isLookingUp ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Lookup'}
               </Button>
             </div>
           </CardContent>
         </Card>
       )}
    </div>
  )
}
