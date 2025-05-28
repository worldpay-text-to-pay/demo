import { useEffect } from "react"
import { toast } from "@/hooks/use-toast"

export function usePaymentNotifications() {
  useEffect(() => {
    const evtSource = new EventSource("/api/webhook")
    evtSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data)
        console.log("[Payment Notification]", notification)

        const paymentId = notification.data?.paymentDetails?.id
        const newStatus = notification.data?.paymentDetails?.status

        if (paymentId && newStatus) {
          let payments: any[] = []
          try {
            payments = JSON.parse(localStorage.getItem("worldpay-payments") || "[]")
          } catch {}

          const paymentIndex = payments.findIndex((p) => p.id === paymentId)
          if (paymentIndex !== -1) {
            const oldStatus = payments[paymentIndex].status
            if (oldStatus !== newStatus) {
              payments[paymentIndex].status = newStatus
              localStorage.setItem("worldpay-payments", JSON.stringify(payments))
              toast({
                title: "Payment Status Updated!",
                description: `Payment ${paymentId} status: ${newStatus} (Go to Payment History to view details)`,
                variant: "primary",
                duration: 8000,
              })
              window.dispatchEvent(new Event("worldpay-payments-updated"))
            }
          }
        }
      } catch (e) {
        console.error("Failed to process payment notification", e)
      }
    }
    return () => evtSource.close()
  }, [])
}