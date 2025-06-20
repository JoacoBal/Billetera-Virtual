import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { QrCode, Settings } from "lucide-react"
import { useState } from "react"
import QRCode from 'qrcode';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Wallet } from "@/types";

export const WalletQrDialog = ({ wallet } : { wallet: Partial<Wallet> }) => {
  const [open, setOpen] = useState(false)
    const [qrUrl, setQrUrl] = useState<string | null>(null);

  const generateQr = async () => {
    console.log("cvu ", wallet.cvu);

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}/transfer?cvu=${encodeURIComponent(wallet.cvu!)}`;
    try {
        const dataUrl = await QRCode.toDataURL(url);
        setQrUrl(dataUrl);
      } catch (err) {
        console.log('Error generating QR code');
      }
    }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="ml-2" onClick={generateQr}>
          <QrCode className="w-4 h-4"/>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Información de pago por QR</DialogTitle>
        </DialogHeader>
      <WalletQrDisplayComponent qrUrl={qrUrl} cvu={wallet.cvu!}/>
      </DialogContent>
    </Dialog>
  )
}

const WalletQrDisplayComponent = ({ qrUrl, cvu } : { qrUrl: string | null, cvu: string}) => {
    
    return (
        <Card className="w-fit mx-auto p-4">
      <CardContent className="flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground">Escaneá este QR para pagar</p>
        {qrUrl ? (
          <img src={qrUrl} alt="QR de pago" className="w-40 h-40" />
        ) : (
          <Skeleton className="w-40 h-40" />
        )}
        <p className="text-xs break-all text-center text-muted-foreground">{cvu}</p>
      </CardContent>
    </Card>
    )
}