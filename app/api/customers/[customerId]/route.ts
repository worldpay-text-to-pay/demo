import { NextResponse } from "next/server"
import { getHeaders, API_BASE_URL, MERCHANT_ID, loggedFetch } from "@/lib/api-utils"

// Get a customer by ID
export async function GET(request: Request, { params }: { params: { customerId: string } }) {
  try {
    const { customerId } = params
    const url = `${API_BASE_URL}/v1/merchants/${MERCHANT_ID}/customers/${customerId}`

    const response = await loggedFetch(
      url,
      {
        method: "GET",
        headers: getHeaders(),
      },
      "customer",
    )

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching customer:", error)
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 })
  }
}

// Update a customer
export async function PUT(request: Request, { params }: { params: { customerId: string } }) {
  try {
    const { customerId } = params
    const body = await request.json()
    const url = `${API_BASE_URL}/v1/merchants/${MERCHANT_ID}/customers/${customerId}`

    const response = await loggedFetch(
      url,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(body),
      },
      "customer",
    )

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating customer:", error)
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
  }
}

// Delete a customer
export async function DELETE(request: Request, { params }: { params: { customerId: string } }) {
  try {
    const { customerId } = params
    const url = `${API_BASE_URL}/v1/merchants/${MERCHANT_ID}/customers/${customerId}`

    const response = await loggedFetch(
      url,
      {
        method: "DELETE",
        headers: getHeaders(),
      },
      "customer",
    )

    if (response.status === 204) {
      return NextResponse.json({ success: true })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error deleting customer:", error)
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
  }
}
