# FastMarket - Dutch Auction Marketplace

A Next.js marketplace application with dynamic pricing where product prices decrease daily from a maximum to minimum over a configurable period.

## Features

- **Dutch Auction Pricing**: Product prices automatically decrease each day
- **User Authentication**: Sign up/sign in with Supabase Auth
- **Product Management**: Create, view, and delete listings
- **Image Upload**: Upload product images to Supabase Storage
- **Real-time Database**: All data stored in Supabase PostgreSQL
- **Responsive Design**: Dark-themed UI inspired by OpenSea, built with Shadcn UI

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **UI Components**: Shadcn UI
- **Forms**: React Hook Form + Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql` to create tables and policies
3. Verify the `product-images` storage bucket was created

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from your Supabase project settings → API.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## How It Works

### Price Calculation

Products have a `min_price`, `max_price`, and `total_days`. The current price is calculated as:

```
daysElapsed = today - created_at
currentPrice = maxPrice - ((maxPrice - minPrice) / totalDays) * daysElapsed
```

When `daysElapsed >= totalDays`, the price equals `minPrice`.

### Database Schema

- **sellers**: User profiles with email and WhatsApp number
- **products**: Product listings linked to sellers
- **product-images**: Storage bucket for product images

See `supabase-schema.sql` for full schema including RLS policies.

## Usage

1. **Sign Up**: Create an account at `/auth/signup`
2. **Create Listing**: Go to Dashboard → Create New Listing
3. **Upload Image**: Select a product image (optional)
4. **Set Pricing**: Define min/max prices and days available
5. **Publish**: Product appears on the home page immediately

## Project Structure

```
src/
├── app/                  # Next.js app routes
│   ├── auth/            # Sign in/sign up pages
│   ├── dashboard/       # Seller dashboard
│   └── product/[id]/    # Product details
├── components/          # Reusable components
│   ├── ui/             # Shadcn UI components
│   ├── AuthProvider.tsx
│   ├── Navbar.tsx
│   └── ProductCard.tsx
└── lib/                 # Utilities
    ├── supabase.ts      # Supabase client
    ├── database.types.ts
    └── market-logic.ts   # Price calculation
```

## License

MIT
