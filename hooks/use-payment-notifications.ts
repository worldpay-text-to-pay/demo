import { useEffect } from "react"
import { toast } from "@/hooks/use-toast"

export function usePaymentNotifications() {
  useEffect(() => {
    const evtSource = new EventSource("/api/webhook")
    evtSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data)
        console.log("[Payment Notification]", notification)

        // Update payment in localStorage
        const paymentId = notification.data?.paymentDetails?.id
        if (paymentId) {
          let payments = []
          try {
            payments = JSON.parse(localStorage.getItem("worldpay-payments") || "[]")
          } catch {}
          payments = payments.map((p: any) =>
            p.id === paymentId
              ? { ...p, status: notification.data.paymentDetails.status }
              : p
          )
          localStorage.setItem("worldpay-payments", JSON.stringify(payments))
        }

        // Show toast
        toast({
          title: "Payment Status Updated!",
          description: `Payment ${paymentId} status: ${notification.data?.paymentDetails?.status}`,
          variant: "default",
          duration: 8000,
          // Make the toast clickable
          action: {
            label: "View Details",
            onClick: () => {
              window.dispatchEvent(new CustomEvent("worldpay-view-payment-details", { detail: { paymentId } }))
            }
          }
        })

        window.dispatchEvent(new Event("worldpay-payments-updated"))
      } catch (e) {
        console.error("Failed to process payment notification", e)
      }
    }
    return () => evtSource.close()
  }, [])
}