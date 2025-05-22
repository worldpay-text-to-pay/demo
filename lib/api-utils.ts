// Utility functions for API calls
export function getHeaders() {
  return {
    accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.WORLDPAY_API_KEY}`,
    "X-WP-Diagnostics-CorrelationId": crypto.randomUUID(),
    "X-WP-Diagnostics-CallerId": "worldpay-demo",
    "X-WP-Timestamp": new Date().toISOString(),
  }
}

export function getClientHeaders() {
  return {
    accept: "application/json",
    "Content-Type": "application/json",
    "X-WP-Diagnostics-CorrelationId": crypto.randomUUID(),
    "X-WP-Diagnostics-CallerId": "worldpay-demo",
    "X-WP-Timestamp": new Date().toISOString(),
  }
}

export const API_BASE_URL = process.env.WORLDPAY_BASE_URL
export const MERCHANT_ID = process.env.WORLDPAY_MID

// Simple fetch function without logging
export async function loggedFetch(url: string, options: RequestInit, entity: "merchant" | "customer" | "payment") {
  // Just perform the fetch without any logging
  const response = await fetch(url, options)

  let responseData

  try {
    if (response.status !== 204) {
      // No content
      const responseText = await response.text()
      try {
        responseData = JSON.parse(responseText)
      } catch (e) {
        responseData = { rawResponse: responseText.substring(0, 1000) }
      }
    } else {
      responseData = { success: true }
    }
  } catch (e) {
    responseData = { error: "Could not parse response" }
  }

  // Clone the response since it's been consumed
  return new Response(JSON.stringify(responseData), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  })
}
