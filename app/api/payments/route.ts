import { NextResponse } from "next/server"
import { getHeaders, API_BASE_URL, MERCHANT_ID, loggedFetch } from "@/lib/api-utils"

// Create a payment for a customer
export async function POST(request: Request) {
  try {
    const { customerId, ...paymentData } = await request.json()
    const url = `${API_BASE_URL}/v1/merchants/${MERCHANT_ID}/customers/${customerId}/payments`

    const response = await loggedFetch(
      url,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(paymentData),
      },
      "payment",
    )

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()

    // If the API doesn't return an ID, generate one
    if (!data.id) {
      data.id = crypto.randomUUID()
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
  }
}
