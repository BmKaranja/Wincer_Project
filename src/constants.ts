// ==========================================
// CAKEHOUSE SETTINGS & DATA
// Modify these variables to update the details 
// and offerings of your cakehouse
// ==========================================

// To change or add new categories to the catalog, update this array
export const CATEGORIES = ["Vanilla", "Chocolate", "Marble", "Red Velvet", "Black Forest", "White Forest", "Strawberry", "Blueberry", "Passion", "Amarula", "Pina Colada", "Pistachio", "Lotus Biscoff", "Ferrero", "Eggless", "Diabetic-friendly"];

// To change the cakes enlisted in the store, modify this array.
// Each object represents a different cake offering.
// You can change prices, titles, descriptions, images, tags, and default customizer settings here.
export const PRODUCTS = [
  {
    id: 1,
    title: "Signature Black Forest",
    price: "Kshs. 2200",
    desc: "A rich German classic chocolate sponge layered with whipped cream and cherries. Experience the true essence of Belgian chocolate and fresh cherries.",
    tag: "Bestseller",
    gauge: "Premium",
    gaugeVal: "w-[90%]",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNxYJrngqv4m-5-nDOT98WJJBsj4VLTJ-jVyN2GTmOgLLaIhA8e_J7zRCNu7PpNMhh3SahmEUA53TTuvP_NfFDfwxD4uZwx94gZRpEOpVB2bHIP0vwj-Wx9vYjLJ2l8sVDc8kVewXkWyeWyieVZi5uBKYxiLwi-EvwAcIZe3M1Ii4m5wF8t05CcyYZwjedKjQKNc9V3RVOiyxvIarZ6mAbQHOvOLrmcTN33J-TfWAmNVioejdOJeYI-Ux-YCz2ZeeK1NR1UzROn1Y",
    customDefaults: {
      sponge: "Rich Chocolate",
      filling: "Cherry Compote",
      frosting: "Whipped Cream",
      toppings: ["Chocolate Shavings"],
      message: "Happy Birthday"
    }
  },
  {
    id: 3,
    title: "Classic Red Velvet",
    price: "Kshs. 2800",
    desc: "A velvety, cocoa-infused sponge complete with our creamy, rich cream cheese frosting. The ultimate Wincer signature.",
    tag: "Signature",
    gauge: "Velvety",
    gaugeVal: "w-[75%]",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCloe64oMMRQW-RnI7s-onNgc6APJHBIAt97hmCm0xA0nZCk-_2k47ue-ZyVMozgjLj5ziIAbzSqsbUAYSw6Dnqsx0_wgPLJjLIDVX3AHSbcn8JUI6aJXspnHvLDnDY6GQWtxMhjbfSLC2UmeOFc7u3HSY3OPWpAQgj7mvvNhNgQ5E9cYvzHkB9S_092HF3iwSS4IgN4dEWKTClywo2-r1sSlHk3EuV1qAkHjG5mQFheLWbg3XyGhHPVLnMKn4VudoraUG0qTgoV64"
  }
];

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
}

export const DELIVERY_ZONES: DeliveryZone[] = [
  { id: 'cbd', name: 'Nairobi CBD & Central (greeenhouse/city center)', fee: 200 },
  { id: 'westlands', name: 'Westlands, Parklands, Highridge & Gigiri', fee: 300 },
  { id: 'kilimani', name: 'Kilimani, Kileleshwa, Lavington & Hurlingham', fee: 300 },
  { id: 'karen', name: 'Karen & Lang\'ata', fee: 450 },
  { id: 'runda', name: 'Runda, Muthaiga, Garden Estate & Ridgeways', fee: 400 },
  { id: 'roysambu', name: 'Roysambu, Kasarani, Zimmerman & Kahawa', fee: 350 },
  { id: 'embakasi', name: 'Embakasi, South B, South C & Eastlands', fee: 400 },
  { id: 'thika', name: 'Thika Road (beyond Kahawa) & Ruiru', fee: 500 },
  { id: 'syokimau', name: 'Syokimau, Mlolongo, Kitengela & Athi River', fee: 650 },
  { id: 'kiambu', name: 'Kiambu Road & Northern Bypass', fee: 400 },
  { id: 'other', name: 'Other Nairobi Suburbs (Standard)', fee: 450 },
  { id: 'outside', name: 'Outside Nairobi (Special delivery / Courier)', fee: 900 }
];

