import { NextResponse } from "next/server"
import { getHeaders, API_BASE_URL, MERCHANT_ID, loggedFetch } from "@/lib/api-utils"

// Create a new customer
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const url = `${API_BASE_URL}/v1/merchants/${MERCHANT_ID}/customers`

    const response = await loggedFetch(
      url,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      },
      "customer",
    )

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}
