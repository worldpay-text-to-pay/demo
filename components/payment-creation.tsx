"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getClientHeaders } from "@/lib/api-utils"
import { Loader2, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PaymentFormData {
  customerId: string
  totalAmount: number
  currency: string
  invoiceTitle: string
  invoiceReference: string
  invoiceDate: string
  message: string
}

interface StoredPayment {
  id: string
  customerId: string
  customerName: string
  totalAmount: number
  currency: string
  invoiceTitle: string
  invoiceReference: string
  invoiceDate: string
  message: string
  createdAt: string
  status: string
  response: any
}

const safeGetCustomers = () => {
  try {
    const storedCustomers = localStorage.getItem("worldpay-customers")
    return storedCustomers ? JSON.parse(storedCustomers) : []
  } catch (error) {
    console.warn("Error accessing localStorage for customers:", error)
    return []
  }
}

const safeGetPayments = () => {
  try {
    const storedPayments = localStorage.getItem("worldpay-payments")
    return storedPayments ? JSON.parse(storedPayments) : []
  } catch (error) {
    console.warn("Error accessing localStorage for payments:", error)
    return []
  }
}

const safeSavePayments = (payments: StoredPayment[]) => {
  try {
    localStorage.setItem("worldpay-payments", JSON.stringify(payments))
  } catch (error) {
    console.warn("Error saving payments to localStorage:", error)
  }
}

export default function PaymentCreation() {
  const [customers, setCustomers] = useState<any[]>(safeGetCustomers)
  const [payments, setPayments] = useState<StoredPayment[]>(safeGetPayments)

  const [formData, setFormData] = useState<PaymentFormData>({
    customerId: "",
    totalAmount: 0,
    currency: "USD", // USD is the only option
    invoiceTitle: "",
    invoiceReference: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    message: "Thank you for your business. Please pay your invoice.",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<StoredPayment | null>(null)
  const [missingPhoneWarning, setMissingPhoneWarning] = useState<string | null>(null)

  // Save payments to localStorage whenever they change
  useEffect(() => {
    safeSavePayments(payments)
  }, [payments])

  // Check if selected customer has a valid phone number
  useEffect(() => {
    if (formData.customerId) {
      const selectedCustomer = customers.find((c) => c.id === formData.customerId)
      if (!selectedCustomer?.contact?.phone) {
        setMissingPhoneWarning("Selected customer does not have a valid phone number. Payment may fail.")
      } else {
        setMissingPhoneWarning(null)
      }
    }
  }, [formData.customerId, customers])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId)
    return customer ? customer.name : "Unknown Customer"
  }

  const getCustomerPhone = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId)
    return customer?.contact?.phone || "No phone"
  }

  const createPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Convert amount to cents (integer)
      const amountInCents = Math.round(formData.totalAmount * 100)

      const paymentData = {
        customerId: formData.customerId,
        totalAmount: amountInCents,
        currency: "USD", // Always USD
        invoices: [
          {
            title: formData.invoiceTitle,
            reference: formData.invoiceReference || Date.now().toString(),
            invoiceDate: formData.invoiceDate,
            amount: amountInCents,
          },
        ],
        message: {
          text: formData.message,
        },
      }

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: getClientHeaders(),
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create payment")
      }

      const data = await response.json()

      // Store the payment in localStorage
      const newPayment: StoredPayment = {
        id: data.id || crypto.randomUUID(),
        customerId: formData.customerId,
        customerName: getCustomerName(formData.customerId),
        totalAmount: formData.totalAmount,
        currency: "USD", // Always USD
        invoiceTitle: formData.invoiceTitle,
        invoiceReference: formData.invoiceReference || Date.now().toString(),
        invoiceDate: formData.invoiceDate,
        message: formData.message,
        createdAt: new Date().toISOString(),
        status: "SENT", // Initial status
        response: data,
      }

      setPayments((prev) => [newPayment, ...prev])
      setSuccess("Payment request sent successfully! A text message has been sent to the customer.")
    } catch (err: any) {
      setError(`Error creating payment: ${err.message}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Filter out customers without valid phone numbers
  const validCustomers = customers.filter((customer) => customer.contact?.phone)

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Payment Management</CardTitle>
            <CardDescription>Create and manage text-to-pay payment requests</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="create" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Create Payment
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Payment History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
            )}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            {validCustomers.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">
                  You need to create a customer with a valid phone number before you can send a payment request.
                </p>
                <p className="text-sm text-gray-400">Go to the Customers tab to add a customer first.</p>
              </div>
            ) : (
              <form onSubmit={createPayment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerId">Select Customer</Label>
                  <select
                    id="customerId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.customerId}
                    onChange={(e) => handleSelectChange("customerId", e.target.value)}
                    required
                  >
                    <option value="">Select a customer</option>
                    {validCustomers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} ({customer.contact?.phone || "No phone"})
                      </option>
                    ))}
                  </select>
                  {missingPhoneWarning && (
                    <Alert variant="warning" className="mt-2 bg-yellow-50 border-yellow-200 text-yellow-800">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{missingPhoneWarning}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Amount (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <Input
                      id="totalAmount"
                      name="totalAmount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.totalAmount || ""}
                      onChange={handleChange}
                      className="pl-7"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoiceTitle">Invoice Title</Label>
                  <Input
                    id="invoiceTitle"
                    name="invoiceTitle"
                    value={formData.invoiceTitle}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceReference">Invoice Reference (Optional)</Label>
                    <Input
                      id="invoiceReference"
                      name="invoiceReference"
                      value={formData.invoiceReference}
                      onChange={handleChange}
                      placeholder="Auto-generated if empty"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invoiceDate">Invoice Date</Label>
                    <Input
                      id="invoiceDate"
                      name="invoiceDate"
                      type="date"
                      value={formData.invoiceDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Text Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary-600">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Payment Request"
                  )}
                </Button>
              </form>
            )}
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Payment History</h3>

              {payments.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">No payment history yet. Create your first payment request.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedPayment ? (
                    <div className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium">Payment Details</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPayment(null)}
                          className="border-primary text-primary hover:bg-primary-50"
                        >
                          Back to List
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Customer</p>
                          <p className="font-medium">{selectedPayment.customerName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Amount</p>
                          <p className="font-medium">
                            {formatCurrency(selectedPayment.totalAmount, selectedPayment.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Invoice</p>
                          <p className="font-medium">{selectedPayment.invoiceTitle}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Reference</p>
                          <p className="font-medium">{selectedPayment.invoiceReference}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Invoice Date</p>
                          <p className="font-medium">{formatDate(selectedPayment.invoiceDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Created</p>
                          <p className="font-medium">{formatDate(selectedPayment.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className="font-medium">{selectedPayment.status}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Message</p>
                          <p className="font-medium">{selectedPayment.message}</p>
                        </div>
                      </div>

                      <div className="mt-4 border-t pt-4">
                        <h5 className="font-medium mb-2">API Response</h5>
                        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                          {JSON.stringify(selectedPayment.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Date
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Customer
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Amount
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Status
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {payments.map((payment) => (
                            <tr key={payment.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(payment.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{payment.customerName}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {formatCurrency(payment.totalAmount, payment.currency)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  {payment.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedPayment(payment)}
                                  className="text-primary hover:text-primary-600"
                                >
                                  View Details
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
