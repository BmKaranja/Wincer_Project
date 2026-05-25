# 🌸 Wincer Cake House: Website Customization & Payment Alignment Questionnaire

This questionnaire is designed to gather key business details, feature preferences, and operational structures for **Wincer Cake House** to fine-tune the website's layout, catalog, ordering engine, and payment setup to perfectly suit your needs.

---

## 🌟 Section 1: Business Vision & Long-Term Goals
*Every great brand is built on a clear purpose. Help us understand the heart, mission, and future of Wincer Cake House so we can reflect it deeply in the website copy and story.*

1. **The Vision & Brand Story**
   - What is the ultimate vision for Wincer Cake House over the next 3–5 years? (e.g., Becoming Nairobi's premier custom luxury cake boutique, expanding to physical branch locations, specializing in bridal/large-event catering, or training next-generation bakers?)
     - 
     - 
   - What inspired you to start Wincer Cake House? If there's an origin story, we can feature it beautifully in an "Our Story" section!
     - 
     - 

2. **Core Values & Mission**
   - What values do you refuse to compromise on in your kitchen? (e.g., 100% natural butter/premium ingredients, scratch baking with zero artificial preservatives, immaculate artistic design, stellar customer service?)
     - 
     - 
   - What is the primary promise you make to every customer who orders from you?
     - 

3. **Target Audience & Core Offer**
   - Who is your ideal customer? (e.g., Busy mothers seeking premium kids birthday cakes, corporate event planners, young couples planning modern weddings, or gourmet foodies who appreciate complex artisanal flavors?)
     - 
     - 

---

## 🎨 Section 2: Brand & Visual Customization
*Help us align the aesthetic of your website with the unique spirit of Wincer Cake House.*

1. **Brand Aesthetic & Vibe**
   - Which style best fits Wincer Cake House?
     - [ ] **Minimalist & Contemporary** (Lots of white space, clean thin fonts, modern focus)
     - [ ] **Warm & Cozy Cottage** (Charming cursive headers, organic soft earth tones, traditional bakery feel)
     - [ ] **Elegant & Editorial** (Sophisticated serif typography, high-contrast gold/charcoal palette, luxury look)
     - [ ] **Vibrant & Playful** (Cheerful pastel colors, warm bubbly fonts, family-friendly celebration vibe)
   - Do you have a preferred signature color palette? (e.g., Pink & Gold, Chocolate Sage, Cream & Lilac)

2. **Main Imagery & Logo**
   - Do you have an established logo you'd like uploaded to the header and checkout receipt, or should we create a custom high-contrast text brandmark?
   - Do you have original high-resolution photos of your signature cakes, or would you like us to generate visually stunning AI bakery assets that showcase your flavor concepts perfectly?

---

## 🎂 Section 3: Catalog, Flavors & Customizations
*Help us build a catalog that represents what you offer and how you prepare cakes.*

1. **Standard Sizes & Gauges**
   - How are your standard cakes priced and sized? (e.g., 1kg, 1.5kg, 2kg, 3kg, and custom tiered sizes)
   - Do you have a standard price list for your base sizes?

2. **Flavors & Fillings Options**
   - Please list your signature cake flavors:
     - 
     - 
   - Do you offer custom fillings or frostings (e.g., Fresh cream, Fondant finish, Buttercream, Ganache)?

3. **Customization Variables (The Interactive Builder)**
   - What questions should a customer answer when ordering a custom-designed cake? Check all that apply:
     - [ ] Toppings Preference (e.g., fruits, flowers, chocolates, macarons)
     - [ ] Writing/Message on the cake board (Text input field)
     - [ ] Eggless or Vegan variations (+ extra fee?)
     - [ ] Upload custom design sketch or inspiration photo (Required/Optional)

---

## 🚚 Section 4: Delivery Zones & Order Timelines
*Make sure delivery logic operates safely within your logistics capabilities.*

1. **Delivery Zone Setup**
   - Currently, delivery has been temporarily set to **Free** promo style across all zones. For your future pricing structure, do you want to keep:
     - [ ] Flat rate delivery anywhere in Nairobi (e.g., KShs 450)
     - [ ] Tiered rates by zone (e.g., CBD: KShs 200, Karen: KShs 450, Out of Town: KShs 900)
     - [ ] Complete free pickup / Selected spots free, and only home dispatch charged?

2. **Order Notice & Cutting Times**
   - How much early notice do you require to prepare and dispatch an order?
     - [ ] At least 24 hours (1 Day advance)
     - [ ] At least 48 hours (2 Days advance — **Current default**)
     - [ ] 72 hours+ for large wedding/tiered custom cakes
   - What are your standard delivery windows? (e.g., Morning: 9 AM - 12 PM, Afternoon: 1 PM - 5 PM)

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
- [ ] Option A
- [ ] Option B
- [ ] Option C

---

## 📊 Section 6: Applet Implementation & Payment Plans
*Which support design plan fits your roadmap for launching, hosting, and maintaining Wincer Cake House?*

### 💰 Upfront Development Cost (Completed Work & Domain Setup)
Since the primary custom development of the Wincer Cake House website is almost ready, we want to align on an upfront project fee for the work done that matches your business budget and what you are comfortable handling. 

**This upfront cost includes the domain registration and setup charges (e.g., securing your custom `.co.ke` or `.com` business domain name).**

- **Upfront Development & Domain Settlement**: What upfront amount fits your budget for the completed site setup, custom domain registration, visual design layout, Firebase database configuration, delivery zone selectors, and fallback checkout integrations?
  - [ ] KShs 5,000 - 15,000 (Includes standard `.co.ke` domain registration + core setup)
  - [ ] KShs 15,000 - 25,000 (Includes premium `.com`/`.co.ke` domain registration + custom feature tuning)
  - [ ] KShs 25,000+ (Includes custom domain + full premium visual design elements and integrations)
  - [ ] Other / Custom amount: KShs ____________________ (includes domain setup)

### 🛠️ Ongoing Maintenance & Technical Support Plan
To keep Wincer Cake House running securely without technical hiccups, we offer a single customizable support plan where you decide the monthly fee that fits your business needs and budget:

- **What is included**:
  - Full hosting setup supervision and domain name registration assistance.
  - Periodic catalog content updates (e.g., adding festive greeting cakes, Father’s/Mother’s Day menu transitions, and cake price adjustments).
  - Standard system diagnostics, database health monitoring, and M-Pesa checkout flow health checks.
  - Direct technical support for troubleshooting, styling adjustments, or priority security updates.

- **Proposed Monthly Maintenance Budget**: Choose or write in the monthly amount you are comfortable allocating for full technical maintenance and active hosting admin support:
  - [ ] KShs 1,000 / month (Essential hosting upkeep, minor seasonal updates)
  - [ ] KShs 2,000 / month (Balanced support, catalog adjustments, prompt debugging)
  - [ ] KShs 3,000 / month (Active maintenance, design tweaks, and priority troubleshooting support)
  - [ ] Custom Proposed Maintenance Budget: KShs ____________________ / month

---

### 📝 Next Steps
After reviewing these options, please type your responses in a reply or add them directly to this questionnaire. Once we know your preferences, we will shape the visual atmosphere and configurations of **Wincer Cake House** to match your exact business model!
