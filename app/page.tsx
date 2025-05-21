import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MerchantSettings from "@/components/merchant-settings"
import CustomerManagement from "@/components/customer-management"
import PaymentCreation from "@/components/payment-creation"
import { WorldpayLogo } from "@/components/worldpay-logo"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <WorldpayLogo />
          <div className="text-sm text-gray-500">Text-to-Pay API Demo</div>
        </div>
      </header>

      <main className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2 text-primary-600">Text-to-Pay Demo</h1>
            <p className="text-gray-500">A demonstration of Worldpay's text-to-pay API capabilities</p>
          </div>

          <Tabs defaultValue="merchant" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="merchant">Merchant Settings</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="merchant">
              <MerchantSettings />
            </TabsContent>

            <TabsContent value="customers">
              <CustomerManagement />
            </TabsContent>

            <TabsContent value="payments">
              <PaymentCreation />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-10">
        <div className="container mx-auto py-6 px-4 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Worldpay. This is a demo application for the Text-to-Pay API.
          </p>
        </div>
      </footer>
    </div>
  )
}
