# Project Handover Documentation: Wincer Cake House

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
- **Checkout**: Integrated with WhatsApp for delivery coordination and M-Pesa for payments.

## 3. Deployment Steps (Firebase)

The app is pre-configured to work with Firebase. To deploy:

1. **Build the App**:
   ```bash
   npm run build
   ```
2. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```
3. **Login and Initialize**:
   ```bash
   firebase login
   firebase init
   ```
   - Select **Hosting**.
   - Use the **dist** directory as your public directory.
   - Configure as a single-page app (Yes).
4. **Deploy**:
   ```bash
   firebase deploy
   ```

Alternatively, used the **"Settings" -> "Full Deployment"** workflow in the AI Studio Build UI to deploy directly to a production environment.

## 4. Custom Domains and Billing

- **Free Tier**: Firebase Hosting provides a free `*.web.app` address.
- **Custom Domains**: You can link your own domain (e.g., `wincercakehouse.com`) for free in the Firebase Console.
- **Cost**: Buying the domain name itself is an external cost (usually $10-$20/year) and **cannot** be paid for using Google Cloud free credits.
- **Credits**: The $300 Google Cloud credit can be used for things like higher-tier database usage or functions, but not for purchasing a domain name from a registrar.

## 5. Environment Variables
Requires the following variables (see `.env.example`). You can get these from the [Safaricom Developer Portal (Daraja)](https://developer.safaricom.co.ke/):

| Variable | Where to find it |
| :--- | :--- |
| `MPESA_CONSUMER_KEY` | In your App under **"My Apps"** in the Daraja Portal. |
| `MPESA_CONSUMER_SECRET` | In your App under **"My Apps"** in the Daraja Portal. |
| `MPESA_SHORTCODE` | **Sandbox**: "Test Credentials" -> "Business Short Code" (Usually `174379`). <br> **Production**: Your Paybill/Store number. |
| `MPESA_PASSKEY` | **Sandbox**: "Test Credentials" -> "Lipa Na M-Pesa Sandbox" -> **"Online Passkey"**. <br> **Production**: Sent to you by Safaricom after Go-Live approval. |

## 6. Firebase Structure
- `cakes`: Collection for the product catalog.
- `blog_posts`: Collection for news and updates.
- `orders`: Collection for customer orders (linked to M-Pesa transactions).
- `users`: Collection for user accounts and admin roles.

## 7. Maintenance Tasks
- **Updating Prices**: Managed via the Admin View (`/admin`).
- **Changing Categories**: Edit `src/views/Catalog.tsx` or the Firestore documents directly.
- **Theme Colors**: Can be adjusted in `src/index.css` under the `@theme` block.
