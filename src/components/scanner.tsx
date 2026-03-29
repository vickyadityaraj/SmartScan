'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CameraOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Scanner({ onScan }: { onScan: (decodedText: string) => void }) {
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const onScanRef = useRef(onScan)

  // Update the ref when onScan changes, without triggering useEffect
  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  useEffect(() => {
    let mounted = true

    const startScanner = async () => {
      try {
        setIsInitializing(true)
        setError(null)

        // Create instance if it doesn't exist
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode('reader')
        }

        const config = {
          fps: 10,
          qrbox: { width: 280, height: 280 },
          aspectRatio: 1.0
        }

        await scannerRef.current.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (mounted) {
              onScanRef.current(decodedText)
            }
          },
          (errorMessage) => {
            // Noise/parsing errors are common and can be ignored
          }
        )

        if (mounted) {
          setIsInitializing(false)
        }
      } catch (err: any) {
        console.error('Scanner error:', err)
        if (mounted) {
          setError(err?.message || 'Failed to start camera')
          setIsInitializing(false)
        }
      }
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      startScanner()
    }, 200)

    return () => {
      mounted = false
      clearTimeout(timer)
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, []) // Empty dependency array: only run on mount/unmount

  return (
    <Card className="overflow-hidden border-2 border-primary/10 shadow-lg">
      <CardHeader className="bg-zinc-50 dark:bg-zinc-900 border-b py-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Scanner Active</CardTitle>
            <CardDescription>Align barcode/QR within the frame</CardDescription>
          </div>
          {isInitializing && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        </div>
      </CardHeader>
      <CardContent className="p-0 bg-black relative aspect-square md:aspect-video min-h-[300px]">
        <div id="reader" className="w-full h-full" />
        
        {isInitializing && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/80 text-white gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium animate-pulse">Initializing Camera...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/95 text-white p-6 text-center gap-4">
            <div className="h-16 w-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center">
              <CameraOff className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg">Camera Error</h3>
              <p className="text-sm text-zinc-400 max-w-[250px]">{error}</p>
            </div>
            <Button 
                variant="outline" 
                size="sm" 
                className="bg-transparent border-white/20 hover:bg-white/10 text-white"
                onClick={() => window.location.reload()}
            >
              <AlertCircle className="mr-2 h-4 w-4" /> Try Refreshing Page
            </Button>
            <p className="text-[10px] text-zinc-500 mt-2 italic">Note: Camera requires HTTPS or Localhost to work.</p>
          </div>
        )}

        {/* Scan Overlay Frame */}
        {!error && !isInitializing && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-primary/50 rounded-lg relative">
               <div className="absolute -top-1 -left-1 w-6 h-6 border-l-4 border-t-4 border-primary rounded-tl-md"></div>
               <div className="absolute -top-1 -right-1 w-6 h-6 border-r-4 border-t-4 border-primary rounded-tr-md"></div>
               <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-4 border-b-4 border-primary rounded-bl-md"></div>
               <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-4 border-b-4 border-primary rounded-br-md"></div>
               
               {/* Scanning Line Animation */}
               <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/40 shadow-[0_0_10px_rgba(var(--primary),0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
