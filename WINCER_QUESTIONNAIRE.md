# 🌸 Wincer Cake House: Website Customization & Payment Alignment Questionnaire

This questionnaire is designed to gather key business details, feature preferences, and operational structures for **Wincer Cake House** to fine-tune the website's layout, catalog, ordering engine, and payment setup to perfectly suit your needs.

---

## 🌟 Section 1: Business Vision & Long-Term Goals
*Every great brand is built on a clear purpose. Help us understand the heart, mission, and future of Wincer Cake House so we can reflect it deeply in the website copy and story.*

1. **The Vision & Brand Story**
   - What is the ultimate vision for Wincer Cake House over the next 3–5 years? (e.g., Becoming Nairobi's premier custom luxury cake boutique, expanding to physical branch locations, specializing in bridal/large-event catering, or training next-generation bakers?)
     - **To become Nairobi’s premier custom luxury cake boutique, widely recognized for masterfully crafted multi-tiered wedding cakes, corporate event catering, and premium celebration confections while scaling our signature "scratch-baking" model.**
   - What inspired you to start Wincer Cake House? If there's an origin story, we can feature it beautifully in an "Our Story" section!
     - **Sourcing only authentic premium scratch ingredients and mastering cake styling here in Nairobi to deliver outstanding confectionery art and memorable custom experiences.**

2. **Core Values & Mission**
   - What values do you refuse to compromise on in your kitchen? (e.g., 100% natural butter/premium ingredients, scratch baking with zero artificial preservatives, immaculate artistic design, stellar customer service?)
     - **We never compromise on using 100% natural butter and premium ingredients, baking strictly from scratch. This is paired with immaculate artistic design and a commitment to stellar customer service.**
   - What is the primary promise you make to every customer who orders from you?
     - **Freshness, stunning custom artistry, and safe, punctual delivery.**

3. **Target Audience & Core Offer**
   - Who is your ideal customer? (e.g., Busy mothers seeking premium kids birthday cakes, corporate event planners, young couples planning modern weddings, or gourmet foodies who appreciate complex artisanal flavors?)
     - **A mix of families seeking premium milestone cakes, couples planning milestone weddings, and corporate event planners who refuse to compromise on punctual delivery, taste, and custom artistic presentation.**

---

## 🎨 Section 2: Brand & Visual Customization
*Help us align the aesthetic of your website with the unique spirit of Wincer Cake House.*

1. **Brand Aesthetic & Vibe**
   - Which style best fits Wincer Cake House?
     - [ ] **Minimalist & Contemporary** (Lots of white space, clean thin fonts, modern focus)
     - [ ] **Warm & Cozy Cottage** (Charming cursive headers, organic soft earth tones, traditional bakery feel)
     - [x] **Elegant & Editorial** (Sophisticated serif typography, high-contrast gold/charcoal palette, luxury look)
     - [ ] **Vibrant & Playful** (Cheerful pastel colors, warm bubbly fonts, family-friendly celebration vibe)
   - Do you have a preferred signature color palette? (e.g., Pink & Gold, Chocolate Sage, Cream & Lilac)
     - **Elegant Editorial Palette (Sophisticated Serif typography, rich chocolate, warm gold, and ivory background)**

2. **Main Imagery & Logo**
   - Do you have an established logo you'd like uploaded to the header and checkout receipt, or should we create a custom high-contrast text brandmark?
     - **Custom elegant typography brandmark.**
   - Do you have original high-resolution photos of your signature cakes, or would you like us to generate visually stunning AI bakery assets that showcase your flavor concepts perfectly?
     - **Utilizing high-contrast generated assets matching flavor models.**

---

## 🎂 Section 3: Catalog, Flavors & Customizations
*Help us build a catalog that represents what you offer and how you prepare cakes.*

1. **Standard Sizes & Gauges**
   - How are your standard cakes priced and sized? (e.g., 1kg, 1.5kg, 2kg, 3kg, and custom tiered sizes)
     - **Standard pricing based on weight tiers (1kg, 2kg, 3kg, 5kg).**
   - Do you have a standard price list for your base sizes?
     - **1 kg starting at Kshs. 2200 for Signature Black Forest, scaled proportionally up to 5 kg.**

2. **Flavors & Fillings Options**
   - Please list your signature cake flavors:
     - **Vanilla, Chocolate, Marble, Red Velvet, Black Forest, White Forest, Strawberry, Blueberry, Passion, Amarula, Pina Colada, Pistachio, Lotus Biscoff, Ferrero, Eggless, Diabetic-friendly.**
   - Do you offer custom fillings or frostings (e.g., Fresh cream, Fondant finish, Buttercream, Ganache)?
     - **Yes, fresh whipped cream, buttercream, and ganache coatings.**

3. **Customization Variables (The Interactive Builder)**
   - What questions should a customer answer when ordering a custom-designed cake? Checked options:
     - [x] Toppings Preference (e.g., fruits, flowers, chocolates, macarons)
     - [x] Writing/Message on the cake board (Text input field)
     - [x] Eggless or Vegan variations (+ extra fee?)
     - [x] Upload custom design sketch or inspiration photo (Required/Optional)

---

## 🚚 Section 4: Delivery Zones & Order Timelines
*Make sure delivery logic operates safely within your logistics capabilities.*

1. **Delivery Zone Setup**
   - Currently, delivery has been temporarily set to **Free** promo style across all zones. For your future pricing structure, do you want to keep:
     - [x] **Flat rate delivery for local orders (Donholm & environs: Kshs. 200). For outside zones, utilize Uber/Bolt services where final transit fee is calculated by distance and paid directly by client.**

2. **Order Notice & Cutting Times**
   - How much early notice do you require to prepare and dispatch an order?
     - **Recommended notice is 2 days for standard orders and 1 month for event cakes. We actively accommodate urgent/same-day orders whenever logistics and capacity allow.**
   - What are your standard delivery windows? (e.g., Morning: 9 AM - 12 PM, Afternoon: 1 PM - 5 PM)
     - **9:00 AM - 8:00 PM**

---

## 💳 Section 5: M-Pesa & Payment Infrastructure Options
*Safaricom Daraja API callbacks sometimes face issues beyond standard control in dynamic sandboxes. We want to align on the absolute best mechanism for your daily customer checkout.*

### Option A: Fully-Integrated Automated STK Push (Live Daraja Business Till)
- **Description**: The site sends an instant checkout prompt to the customer's phone. They enter their PIN, and once validated by Safaricom, the site transitions directly to the success screen.
- **Good for**: Large volumes of automated transactions without human checking.
- **Requirement**: A valid Safaricom Paybill or Till number with Daraja Admin dashboard credentials.

### Option B: Hybrid Verified Transaction Code Checking (Current Setup)
- **Description**: The site launches an automated prompt, but offers an instant text block reading: *"Paid already but callback is lagging? Enter Transaction Code (e.g. RE45TY78Z9)."* Standard customers can enter their PIN, and if Safaricom's network delays, they simply enter the text code to confirm instantly.
- **Good for**: Stable conversions even during Safaricom server downtime. Highly recommended.

### Option C: Manual "Buy Goods" & File Code Upload Instructions
- **Description**: When checking out, a simple pop-up shows instructions: *"1. Pay KShs X to Till No: 12345. 2. Copy the M-Pesa Message/Transaction Code and paste it below."* Excellent simplicity, 100% reliable, zero API configuration needed.

*Which payment setup feels safest/best for your customers?*
- [x] Option A (Fully integrated automated STK push with fallback support)
- [ ] Option B
- [ ] Option C

---

## 📊 Section 6: Applet Implementation & Payment Plans
*Which support design plan fits your roadmap for launching, hosting, and maintaining Wincer Cake House?*

### 💰 Upfront Development Cost (Completed Work & Domain Setup)
- [x] KShs 15,000 - 25,000 (Includes premium `.com`/`.co.ke` domain registration + custom feature tuning)

### 🛠️ Ongoing Maintenance & Technical Support Plan
- [x] KShs 2,000 / month (Balanced support, catalog adjustments, prompt debugging)
