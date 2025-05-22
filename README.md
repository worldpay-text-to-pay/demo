# Worldpay Text-to-Pay Demo

A demonstration application for Worldpay's text-to-pay API capabilities. This application allows merchants to manage settings, create customers, and send payment requests via text message.

## Overview

This demo application showcases the integration with Worldpay's Text-to-Pay API, allowing you to:

- Configure merchant settings
- Manage customers with phone numbers
- Create and send payment requests via SMS
- View payment history

## Prerequisites

Before running this application, you'll need:

- Node.js 18.x or later
- npm or yarn
- A Worldpay account with API access
- API credentials (API Key and Merchant ID)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/worldpay-text-to-pay-demo.git
cd worldpay-text-to-pay-demo
```

2. Install dependencies:


```shellscript
npm install
# or
yarn install
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```plaintext
WORLDPAY_API_KEY=your_api_key_here
WORLDPAY_MID=your_merchant_id_here
WORLDPAY_BASE_URL=https://apis.stage.worldpay.com/text-to-pay
```

Replace the API key and merchant ID values with your actual Worldpay credentials. The base URL is set to the staging environment by default.

## Running Locally

1. Start the development server:


```shellscript
npm run dev
# or
yarn dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.


## Features

### Merchant Settings

- Update merchant information
- Configure branding (primary color, logo)
- Update merchant description


### Customer Management

- Create customers with name and phone number
- View, edit, and delete existing customers
- Phone numbers are automatically formatted to international format


### Payment Creation

- Select a customer to send a payment request
- Specify amount, invoice details, and custom message
- View payment history and details


## Project Structure

```plaintext
worldpay-text-to-pay-demo/
├── app/                  # Next.js app directory
│   ├── api/              # API routes
│   │   ├── merchant/     # Merchant API routes
│   │   ├── customers/    # Customer API routes
│   │   └── payments/     # Payment API routes
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page
├── components/           # React components
│   ├── ui/               # UI components (shadcn/ui)
│   ├── customer-management.tsx
│   ├── merchant-settings.tsx
│   ├── payment-creation.tsx
│   └── worldpay-logo.tsx
├── lib/                  # Utility functions
│   └── api-utils.ts      # API utilities
├── public/               # Static assets
└── .env.local            # Environment variables (create this)
```

## Troubleshooting

### API Connection Issues

- Verify your API credentials are correct in the `.env.local` file
- Check that your Worldpay account has the necessary permissions
- Ensure your API key is active and not expired


### Customer Creation Problems

- Phone numbers must be in international format (e.g., +12025550123)
- All required fields must be completed


### Payment Sending Issues

- Ensure the customer has a valid phone number
- Check that all required payment fields are completed
- Verify your Worldpay account has sufficient credits for sending SMS


## Local Storage

This demo application uses browser localStorage to persist:

- Customer information
- Payment history


This means your data will remain available between browser sessions but is limited to the browser you're using.

## License

This project is for demonstration purposes only. All rights reserved.

## Support

For issues with the demo application, please open an issue in the GitHub repository.

For Worldpay API issues, please contact Worldpay support.
