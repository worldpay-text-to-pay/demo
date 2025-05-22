"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getClientHeaders } from "@/lib/api-utils"
import { Loader2 } from "lucide-react"

interface MerchantData {
  friendlyName: string
  description: string
  theme?: {
    primaryColorHexCode?: string
    logoUrl?: string
  }
}

export default function MerchantSettings() {
  const [merchant, setMerchant] = useState<MerchantData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchMerchant()
  }, [])

  const fetchMerchant = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/merchant", {
        headers: getClientHeaders(),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch merchant settings")
      }

      const data = await response.json()
      setMerchant(data)
    } catch (err) {
      setError("Error fetching merchant settings")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateMerchant = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/merchant", {
        method: "PUT",
        headers: getClientHeaders(),
        body: JSON.stringify(merchant),
      })

      if (!response.ok) {
        throw new Error("Failed to update merchant settings")
      }

      const data = await response.json()
      setMerchant(data)
      setSuccess("Merchant settings updated successfully")
    } catch (err) {
      setError("Error updating merchant settings")
      console.error(err)
    } finally {
      setUpdating(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setMerchant((prev) => ({
        ...prev!,
        [parent]: {
          ...(prev![parent as keyof MerchantData] as object),
          [child]: value,
        },
      }))
    } else {
      setMerchant((prev) => ({
        ...prev!,
        [name]: value,
      }))
    }
  }

  if (loading && !merchant) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Merchant Settings</CardTitle>
            <CardDescription>Update your merchant settings for text-to-pay</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>
        )}

        {merchant && (
          <form onSubmit={updateMerchant} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="friendlyName">Merchant Name</Label>
              <Input
                id="friendlyName"
                name="friendlyName"
                value={merchant.friendlyName || ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" value={merchant.description || ""} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme.primaryColorHexCode">Primary Color (Hex)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="theme.primaryColorHexCode"
                  name="theme.primaryColorHexCode"
                  value={merchant.theme?.primaryColorHexCode || ""}
                  onChange={handleChange}
                />
                <div className="flex items-center space-x-2 border rounded p-1">
                  <input
                    type="color"
                    id="colorPicker"
                    value={merchant.theme?.primaryColorHexCode || "#00A1DF"}
                    onChange={(e) => {
                      const hexColor = e.target.value
                      setMerchant((prev) => ({
                        ...prev!,
                        theme: {
                          ...(prev!.theme || {}),
                          primaryColorHexCode: hexColor,
                        },
                      }))
                    }}
                    className="w-8 h-8 cursor-pointer"
                  />
                  <Label htmlFor="colorPicker" className="text-xs text-gray-500">
                    Pick
                  </Label>
                </div>
              </div>
              {merchant.theme?.primaryColorHexCode && (
                <div className="flex items-center mt-2">
                  <div
                    className="w-6 h-6 rounded-full mr-2 border"
                    style={{ backgroundColor: merchant.theme.primaryColorHexCode }}
                  ></div>
                  <span className="text-xs text-gray-500">Selected color preview</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme.logoUrl">Logo URL</Label>
              <Input
                id="theme.logoUrl"
                name="theme.logoUrl"
                value={merchant.theme?.logoUrl || ""}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" disabled={updating} className="bg-primary hover:bg-primary-600">
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Settings"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
