"use client"
import { usePaymentNotifications } from "@/hooks/use-payment-notifications"

export function PaymentNotificationListener() {
  usePaymentNotifications()
  return null
}