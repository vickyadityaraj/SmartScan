'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScanLine, CheckCircle2 } from 'lucide-react'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const qrCode = searchParams.get('qr')
  const orderId = searchParams.get('id')

  if (!qrCode) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <h1 className="text-2xl font-bold">Invalid session</h1>
        <Link href="/customer" className="text-primary mt-4 underline">Return to dashboard</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="animate-bounce mb-4 text-green-500 bg-green-50 dark:bg-green-500/10 p-4 rounded-full">
         <CheckCircle2 className="h-16 w-16" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-center text-zinc-900 dark:text-zinc-50">Checkout Complete!</h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-[400px] text-center">
        Present this pass at the exit security gate to walk out with your items.
      </p>

      <Card className="w-full max-w-sm rounded-[2rem] border-4 overflow-hidden shadow-2xl">
        <div className="bg-primary p-6 text-primary-foreground text-center">
           <div className="flex items-center justify-center gap-2 font-bold text-xl uppercase tracking-widest">
             <ScanLine className="h-6 w-6" />
             Exit Pass
           </div>
           <div className="text-xs opacity-80 mt-1 uppercase tracking-[0.2em] font-mono">
             #{orderId?.substring(0, 8)}
           </div>
        </div>
        
        <CardContent className="bg-white text-zinc-900 pt-10 pb-8 flex justify-center items-center relative">
          <div className="absolute top-0 left-[-16px] w-[32px] h-[32px] rounded-full bg-zinc-50 dark:bg-zinc-950 translate-y-[-50%] z-10" />
          <div className="absolute top-0 right-[-16px] w-[32px] h-[32px] rounded-full bg-zinc-50 dark:bg-zinc-950 translate-y-[-50%] z-10" />
          
          <div className="bg-white p-4 rounded-xl border-2 border-zinc-100 shadow-inner">
            <QRCodeSVG 
              value={qrCode} 
              size={200} 
              bgColor={"#ffffff"} 
              fgColor={"#000000"} 
              level={"M"} 
            />
          </div>
        </CardContent>
        
        <div className="border-t-2 border-dashed border-zinc-200 w-[80%] mx-auto my-2" />
        
        <CardFooter className="bg-white text-center flex flex-col pt-4">
          <Link href="/customer" className="w-full">
            <Button className="w-full text-lg h-14 rounded-full" variant="outline">
              Done
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
