# Project Handover Documentation: The Cake Boutique

## 1. Tech Stack
- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS 4.0
- **Animations**: Motion (formerly Framer Motion)
- **Database/Auth**: Firebase (Firestore & Auth)
- **Icons**: Lucide React
- **Payments**: Integrated for M-Pesa STK Push API

## 2. Key Features
- **Dynamic Catalog**: Filterable by price, category, and dietary requirements.
- **Custom Cake Builder**: Interactive selection of sponge, filling, and frosting styles.
- **Admin Dashboard**: Secure panel to manage orders, inquiries, and the product catalog.
- **Dark Mode**: System-aware and toggleable theme support.
- **Checkout**: Integrated with WhatsApp for delivery coordination and M-Pesa for payments.

## 3. Environment Variables
Requires the following variables (see `.env.example`). You can get these from the [Safaricom Developer Portal (Daraja)](https://developer.safaricom.co.ke/):

| Variable | Where to find it |
| :--- | :--- |
| `MPESA_CONSUMER_KEY` | In your App under **"My Apps"** in the Daraja Portal. |
| `MPESA_CONSUMER_SECRET` | In your App under **"My Apps"** in the Daraja Portal. |
| `MPESA_SHORTCODE` | **Sandbox**: "Test Credentials" -> "Business Short Code" (Usually `174379`). <br> **Production**: Your Paybill/Store number. |
| `MPESA_PASSKEY` | **Sandbox**: "Test Credentials" -> "Lipa Na M-Pesa Sandbox" -> **"Online Passkey"**. <br> **Production**: Sent to you by Safaricom after Go-Live approval. |

## 4. Firebase Structure
- `cakes`: Collection for the product catalog.
- `orders`: Collection for customer orders (linked to M-Pesa transactions).
- `inquiries`: Collection for the contact/customization forms.
- `admins`: Collection containing UIDs of authorized admin users.

## 5. Maintenance Tasks
- **Updating Prices**: Managed via the Admin View (`/admin`).
- **Changing Categories**: Edit `src/views/Catalog.tsx` or the Firestore documents directly.
- **Theme Colors**: Can be adjusted in `src/index.css` under the `@theme` block.

## 6. Deployment Command
```bash
npm run build
```
The resulting `dist/` folder can be served by any static web host.
