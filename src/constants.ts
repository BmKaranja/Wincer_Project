// ==========================================
// CAKEHOUSE SETTINGS & DATA
// Modify these variables to update the details 
// and offerings of your cakehouse
// ==========================================

// To change or add new categories to the catalog, update this array
export const CATEGORIES = ["Chocolate", "Vanilla", "Red Velvet", "Fruit"];

// To change the cakes enlisted in the store, modify this array.
// Each object represents a different cake offering.
// You can change prices, titles, descriptions, images, tags, and default customizer settings here.
export const PRODUCTS = [
  {
    id: 1,
    title: "Midnight Ganache",
    price: "$85.00",
    desc: "Intense 70% dark cocoa sponge layered with silken Madagascar vanilla cream.",
    tag: "Bestseller",
    gauge: "Premium",
    gaugeVal: "w-[90%]",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNxYJrngqv4m-5-nDOT98WJJBsj4VLTJ-jVyN2GTmOgLLaIhA8e_J7zRCNu7PpNMhh3SahmEUA53TTuvP_NfFDfwxD4uZwx94gZRpEOpVB2bHIP0vwj-Wx9vYjLJ2l8sVDc8kVewXkWyeWyieVZi5uBKYxiLwi-EvwAcIZe3M1Ii4m5wF8t05CcyYZwjedKjQKNc9V3RVOiyxvIarZ6mAbQHOvOLrmcTN33J-TfWAmNVioejdOJeYI-Ux-YCz2ZeeK1NR1UzROn1Y",
    customDefaults: {
      sponge: "Rich Chocolate",
      filling: "Chantilly Cream",
      frosting: "Smooth Silk",
      toppings: ["Gold Leaf (+ $15)"],
      message: "Midnight Indulgence"
    }
  },
  {
    id: 2,
    title: "Summer Whisper",
    price: "$72.00",
    desc: "Light buttermilk sponge infused with wild strawberry essence and elderflower.",
    tag: "Vegan",
    gauge: "Delicate",
    gaugeVal: "w-[45%]",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXCz2WSWUlvtdP5LdWW3cMtIJK0itREwK2Pf8fynowLXCLjjqHq9Ub9kkJxfibYs_rvAsY3MgTvIgrBKEVsYDEwhH6TKHov2is5jOGRBuVVh-Ia19Nl94VqADDcg7Qclrc4KpJrVEHyPO-jVsGmKEA0WBl0eJ-NC3uasDY5zps5A-8RdbQ1QkTHhvRf4X-QSHSKThfx9_D3b0QcZ_RldR4xFlvEfv033Z5BnlKAPdU1Xrh7G2uUFC3ErivBXqKceg48lmEST09Yyw"
  },
  {
    id: 3,
    title: "Royal Velvet",
    price: "$95.00",
    desc: "Traditional cocoa-infused sponge with our signature tangy cream cheese frosting.",
    tag: "Signature",
    gauge: "Velvety",
    gaugeVal: "w-[75%]",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCloe64oMMRQW-RnI7s-onNgc6APJHBIAt97hmCm0xA0nZCk-_2k47ue-ZyVMozgjLj5ziIAbzSqsbUAYSw6Dnqsx0_wgPLJjLIDVX3AHSbcn8JUI6aJXspnHvLDnDY6GQWtxMhjbfSLC2UmeOFc7u3HSY3OPWpAQgj7mvvNhNgQ5E9cYvzHkB9S_092HF3iwSS4IgN4dEWKTClywo2-r1sSlHk3EuV1qAkHjG5mQFheLWbg3XyGhHPVLnMKn4VudoraUG0qTgoV64"
  },
  {
    id: 4,
    title: "Pistachio Dream",
    price: "$110.00",
    desc: "Hand-ground Sicilian pistachios with a tart raspberry compote heart.",
    tag: null,
    gauge: "Complex",
    gaugeVal: "w-[85%]",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCduC7-DGJ68RWEAf2l_fJs1p53PHh9Cy9cgU_ofEE8G8Z0OuNf2XwhXsTIF_tOoJ58uxs1EWWuSWckap5hMRsX3p2DkyVldDeQ60lTd5ptqeykxhefHcABsMP6jj0DiSjHjiv-24nYzYJ6vrR1TFWr8lRwlHOuWVHu7WHrE2X2Rkq3Ci6UFM_alU8vCAPGgo5e3xGH1J0Hmod_8CblUb6erShZSvPi7bo5cvDmxZ2e3mB5PVWiZiu8gtCiy5OLcEY2qKdytrDyGWs"
  },
  {
    id: 5,
    title: "Celebration Joy",
    price: "$68.00",
    desc: "Our classic buttery vanilla sponge with a festive sprinkle confetti core.",
    tag: "GF Available",
    gauge: "Classic",
    gaugeVal: "w-[65%]",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB176m2zlRpaD5R6G1M4MidY7Cn9B1EvIvGGuCZvlEhdIyPt-n6G2ZQEaHKP_xR22yqVMVPXB7MMnZpWxQKlL79NK5EQeU2oNHiLTbgfvUu2Pd0tazVRZdDyo9TMVnWFuR3lT1iZgLdqOqYSiWriNcPVQ278V_eF7mJfmluKDzZ0-4x1t_TquTX6NR0jnp4d4VPK2-xXSOeOLYGFmewvOPgl2ZJCqQhvu_g-wtD0sUvohXbo9YkCXSIVB3us_WEuoEsmGyOFFj2oVs"
  },
  {
    id: 6,
    title: "Citrus Zest",
    price: "$55.00",
    desc: "Tangy Meyer lemon sponge with a light, zesty glaze and candied peels.",
    tag: null,
    gauge: "Light",
    gaugeVal: "w-[30%]",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9MiOU8G013CpO73S79R0UYoJSSZZKOncVhGpSdA_ytPhrvBsw6KSp5nOZq_hKVAjROaruUL-7RcxGINNrka0GlkcLwJEb98HT0pk0C1ldz3aQQtGt06mFJp3drPRJIXWSnfW80jOadJRRduuvXTA0PxOvleMsjqRkNLyk80hl4LhnUnnrgRkvSWMmGS7nhZXkKyiy0K43pqgkJbsgFhh9CokY7UBT_ZA_PIgUD4el6q2zqGAKNO7APwlqqBHH_TojkH04fGPc7hc"
  }
];
