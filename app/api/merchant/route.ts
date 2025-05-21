import { NextResponse } from "next/server"
import { getHeaders, API_BASE_URL, MERCHANT_ID, loggedFetch } from "@/lib/api-utils"

// Get merchant settings
export async function GET() {
  try {
    const url = `${API_BASE_URL}/v1/merchants/${MERCHANT_ID}`
    const response = await loggedFetch(
      url,
      {
        method: "GET",
        headers: getHeaders(),
      },
      "merchant",
    )

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching merchant:", error)
    return NextResponse.json({ error: "Failed to fetch merchant settings" }, { status: 500 })
  }
}

// Update merchant settings
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const url = `${API_BASE_URL}/v1/merchants/${MERCHANT_ID}`

    const response = await loggedFetch(
      url,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(body),
      },
      "merchant",
    )

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating merchant:", error)
    return NextResponse.json({ error: "Failed to update merchant settings" }, { status: 500 })
  }
}
