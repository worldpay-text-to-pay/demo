"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getClientHeaders } from "@/lib/api-utils"
import { Loader2, Plus, Trash, Edit, Check, X, AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Customer {
  id: string
  name: string
  contact?: {
    phone: string
  }
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

const safeSaveCustomers = (customers: Customer[]) => {
  try {
    localStorage.setItem("worldpay-customers", JSON.stringify(customers))
  } catch (error) {
    console.warn("Error saving customers to localStorage:", error)
  }
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>(safeGetCustomers)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
  })

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  // Save customers to localStorage whenever the customers array changes
  useEffect(() => {
    safeSaveCustomers(customers)
  }, [customers])

  // Format phone number to ensure it has the international format
  const formatPhoneNumber = (phone: string): string => {
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, "")

    // If it's a US number without country code (10 digits), add +1
    if (digits.length === 10) {
      return `+1${digits}`
    }

    // If it already has a country code (11+ digits) but no plus, add it
    if (digits.length >= 11 && !phone.startsWith("+")) {
      return `+${digits}`
    }

    // If it already has a plus, just return the cleaned digits with plus
    if (phone.startsWith("+")) {
      return `+${digits}`
    }

    // Return the original input if we can't determine the format
    return phone
  }

  // Validate phone number format
  const validatePhoneNumber = (phone: string): boolean => {
    // Basic validation for international format: +[country code][number]
    // This regex checks for a plus sign followed by at least 10 digits
    const phoneRegex = /^\+\d{10,15}$/
    return phoneRegex.test(phone)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const formattedPhone = formatPhoneNumber(value)

    setNewCustomer((prev) => ({
      ...prev,
      phone: formattedPhone,
    }))

    // Clear error if valid, otherwise show error
    if (value && !validatePhoneNumber(formattedPhone)) {
      setPhoneError("Phone must be in international format: +[country code][number], e.g., +12025550123")
    } else {
      setPhoneError(null)
    }
  }

  const createCustomer = async (e: React.FormEvent) => {
    e.preventDefault()

    // Final validation before submission
    const formattedPhone = formatPhoneNumber(newCustomer.phone)
    if (!validatePhoneNumber(formattedPhone)) {
      setPhoneError("Phone must be in international format: +[country code][number], e.g., +12025550123")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: getClientHeaders(),
        body: JSON.stringify({
          name: newCustomer.name,
          contact: {
            phone: formattedPhone,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create customer")
      }

      const data = await response.json()

      // Ensure the returned data has the expected structure
      const newCustomerData = {
        ...data,
        contact: data.contact || { phone: formattedPhone },
      }

      // Add the new customer to our local state
      setCustomers((prev) => [...prev, newCustomerData])
      setSuccess("Customer created successfully")

      // Reset the form
      setNewCustomer({
        name: "",
        phone: "",
      })
    } catch (err: any) {
      setError(`Error creating customer: ${err.message}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getCustomer = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        headers: getClientHeaders(),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch customer")
      }

      const data = await response.json()
      return data
    } catch (err) {
      console.error(err)
      return null
    }
  }

  const updateCustomer = async (customer: Customer) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: "PUT",
        headers: getClientHeaders(),
        body: JSON.stringify({
          name: customer.name,
          contact: {
            phone: customer.contact?.phone || "",
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.errors?.[0]?.message?.[0] || "Failed to update customer")
      }

      // Update the customer in our local state
      setCustomers((prev) => prev.map((c) => (c.id === customer.id ? customer : c)))

      setSuccess("Customer updated successfully")
      setEditingCustomer(null)
    } catch (err: any) {
      setError(`Error updating customer: ${err.message}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteCustomer = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) {
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
        headers: getClientHeaders(),
      })

      if (!response.ok && response.status !== 204) {
        throw new Error("Failed to delete customer")
      }

      // Remove the customer from our local state
      setCustomers((prev) => prev.filter((c) => c.id !== customerId))
      setSuccess("Customer deleted successfully")
    } catch (err) {
      setError("Error deleting customer")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleNewCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name !== "phone") {
      setNewCustomer((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleEditCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (editingCustomer) {
      if (name === "phone") {
        setEditingCustomer({
          ...editingCustomer,
          contact: {
            ...(editingCustomer.contact || {}),
            phone: value,
          },
        })
      } else {
        setEditingCustomer({
          ...editingCustomer,
          [name]: value,
        })
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Customer Management</CardTitle>
            <CardDescription>Create, view, update, and delete customers for text-to-pay</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>
        )}

        <div className="space-y-6">
          {/* Create new customer form */}
          <div className="border p-4 rounded-md">
            <h3 className="text-lg font-medium mb-4">Add New Customer</h3>
            <form onSubmit={createCustomer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name</Label>
                <Input id="name" name="name" value={newCustomer.name} onChange={handleNewCustomerChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={newCustomer.phone}
                  onChange={handlePhoneChange}
                  placeholder="+12025550123"
                  required
                />
                {phoneError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{phoneError}</AlertDescription>
                  </Alert>
                )}
                <p className="text-xs text-gray-500">Format: +12025550123 (include country code with + prefix)</p>

                <Alert variant="default" className="mt-3 bg-blue-50 border-blue-200 text-blue-800">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    By entering your mobile number, you agree to receive text messages. Standard message and data rates
                    may apply. Message frequency varies. Call 562-567-6776 for help. Text STOP to cancel.
                  </AlertDescription>
                </Alert>
              </div>

              <Button type="submit" disabled={loading || !!phoneError} className="bg-primary hover:bg-primary-600">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Customer
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Customer list */}
          <div>
            <h3 className="text-lg font-medium mb-4">Your Customers</h3>
            {customers.length === 0 ? (
              <p className="text-gray-500">No customers yet. Add your first customer above.</p>
            ) : (
              <div className="space-y-4">
                {customers.map((customer) => (
                  <div key={customer.id} className="border p-4 rounded-md">
                    {editingCustomer && editingCustomer.id === customer.id ? (
                      // Edit mode
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`edit-name-${customer.id}`}>Name</Label>
                          <Input
                            id={`edit-name-${customer.id}`}
                            name="name"
                            value={editingCustomer.name}
                            onChange={handleEditCustomerChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`edit-phone-${customer.id}`}>Phone</Label>
                          <Input
                            id={`edit-phone-${customer.id}`}
                            name="phone"
                            value={editingCustomer.contact?.phone || ""}
                            onChange={handleEditCustomerChange}
                            disabled
                          />
                          <p className="text-xs text-gray-500">Phone number cannot be updated</p>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => updateCustomer(editingCustomer)}
                            disabled={loading}
                            className="bg-primary hover:bg-primary-600"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingCustomer(null)}>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{customer.name}</h4>
                            <p className="text-sm text-gray-500">{customer.contact?.phone || "No phone number"}</p>
                            <p className="text-xs text-gray-400 mt-1">ID: {customer.id}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingCustomer(customer)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteCustomer(customer.id)}
                              disabled={loading}
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
