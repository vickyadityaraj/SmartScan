'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export function Scanner({ onScan }: { onScan: (decodedText: string) => void }) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const isMounted = useRef(false)
  
  useEffect(() => {
    isMounted.current = true

    // Give the DOM a tiny bit to render the div
    const timer = setTimeout(() => {
        if (!isMounted.current) return
        
        scannerRef.current = new Html5QrcodeScanner(
          'reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
          },
          false
        )
    
        scannerRef.current.render(
          (decodedText) => {
            // Scanner success callback
            onScan(decodedText)
            
            // To prevent rapid successive scans, we can pause or just rely on onScan debouncing logic parent-side
          },
          (error) => {
            // Unavoidable parsing errors spam the console with html5-qrcode
            // ignore
          }
        )
    }, 100)

    return () => {
      isMounted.current = false
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
      }
      clearTimeout(timer)
    }
  }, [onScan])

  return (
    <Card className="overflow-hidden border-2 border-primary/10">
      <CardHeader className="bg-zinc-50 dark:bg-zinc-900 border-b">
        <CardTitle className="text-xl">Scan Barcode</CardTitle>
        <CardDescription>Position the barcode squarely in the frame</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div id="reader" className="w-full h-full min-h-[350px] bg-black relative">
          {/* html5-qrcode dynamically manages the style inside here, we just provide the container */}
        </div>
      </CardContent>
    </Card>
  )
}
