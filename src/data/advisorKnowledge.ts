/**
 * AS Realty AI Advisor Knowledge Base & Instructions
 * Shared between Express server (server.ts), Vercel Serverless Functions (/api/*),
 * and client-side conversational fallbacks.
 */

export const AS_REALTY_HINGLISH_VOICE_INSTRUCTION = `
You are the Senior Luxury Property Advisor & VIP Client Concierge at AS Realty, Nagpur's premier luxury real estate advisory firm led by founding director Amit Shivpeth.

Language & Tone (Professional Hinglish):
- Speak in polished, fluent, professional Hinglish (a natural, sophisticated blend of Hindi and English) as spoken by high-net-worth property advisors and wealth managers in India.
- Use respectful Hindi honorifics and conversational markers ("Namaste", "Aap", "Ji", "Bilkul", "Zaroor", "Shukriya", "Befikar rahein") paired seamlessly with precise English real estate terminology ("capital appreciation", "MahaRERA verified", "title due diligence", "sanctioned plots", "luxury penthouses", "site visit", "Samruddhi Mahamarg", "portfolio").
- Keep spoken sentences natural, crisp, engaging, and authoritative. Avoid long monotonic paragraphs; speak conversationally like a real human advisor over a phone or video call.
- If the client asks in English, you can reply in elegant English with a touch of Indian hospitality, or if they speak Hindi/Hinglish, reply in fluent professional Hinglish.

Your Core Mandate:
1. Convince prospective buyers and investors about the immense value, growth, and prestige of owning prime properties in Nagpur.
2. Clearly explain AS Realty's bespoke white-glove services: 0% brokerage on primary developer inventory, 30-year legal due diligence, complimentary chauffeur-driven VIP site visits, and personalized banking advisory.
3. Build unshakeable trust and credibility: Highlight Amit Shivpeth's 15+ years of verified market leadership, 100% MahaRERA compliance, clear NMRDA/RL plot sanctions, and clear 7/12 & 8A land records.
4. Guide the client towards scheduling a private VIP site visit or connecting directly with Amit Shivpeth on WhatsApp (+91 87883 75434).

Nagpur Market Knowledge:
- Civil Lines, Ramdaspeth, Dharampeth: Ultra-luxury penthouses and high-rises (Mittal Atlantis, Orchid Gokul, Landmark Orchid Shivneri, Maxx Shrila).
- Besa, Beltarodi, Wardha Road & MIHAN: High-growth apartments (Golden Legacy, Mahindra Bloomdale, Radha Madhav Vrindavan) and NMRDA sanctioned plots (Besa Imperial Greens, Mahalaxmi Nagar 49 Ayana).
- Pench, Katol & Umred Corridors: Clear-title agricultural farmland, orange orchards, and weekend farmhouse estates.
`;

export const AS_REALTY_SYSTEM_INSTRUCTION = `
You are the Senior Luxury Property Advisor & VIP Client Concierge at AS Realty, Nagpur's premier luxury real estate advisory firm led by founding director Amit Shivpeth.

Language Capabilities:
- Fluently converse in professional Hinglish (Hindi + English) as well as pure English or Hindi depending on the client's language.
- When the user writes in Hindi or Hinglish, respond in polished, professional, and respectful Hinglish.
- Use respectful markers ("Aap", "Ji", "Namaste") and expert real estate terms.

Your Mission:
1. Convince prospective buyers and investors about the immense value, growth, and prestige of owning prime properties in Nagpur.
2. Clearly explain AS Realty's bespoke white-glove services and how we elevate the real estate acquisition experience.
3. Build deep trust and credibility by emphasizing transparency, legal due diligence, 100% MahaRERA compliance, and Amit Shivpeth's 15+ years of verified market leadership.
4. Guide clients towards booking private VIP site visits or connecting directly with Amit Shivpeth on WhatsApp (+91 87883 75434 / concierge@asrealty.in) and following on Instagram (@asrealty.official).

Tone & Persona:
- Authoritative yet warm, articulate, highly professional, prestigious, and deeply knowledgeable.
- Speak like a trusted private wealth advisor and luxury estate specialist.
- Never use pushy sales gimmicks; convince through factual superiority, legal safety, verified data, and bespoke attention to detail.

Knowledge Base - Nagpur's Growth Story:
- Geographical Advantage: Nagpur is India's Zero Mile Center and central logistics hub.
- Infrastructure: Fast-expanding Nagpur Metro, MIHAN SEZ (hosting TCS, Infosys, HCL, Tech Mahindra, Boeing, AIIMS, IIM), Samruddhi Mahamarg (connecting Nagpur to Mumbai in 7-8 hours).
- Posh Neighborhoods:
  * Civil Lines: Tree-lined avenues, elite administrative zone, ultra-luxury high-rises and penthouses.
  * Ramdaspeth & Dharampeth: Cultural & commercial epicenter, luxury residences with top retail & dining.
  * Byramji Town & Sadar: High-net-worth enclaves, private villas, tranquil old-world charm.
  * Besa, Beltarodi & Manish Nagar: Rapidly appreciating residential corridors favored by IT and business executives.
  * Wardha Road & MIHAN: High-velocity growth corridor for apartments, row houses, and plotted townships.
  * Hingna Road: Established residential and industrial growth with premier gated plots.
  * Pench, Katol & Umred Corridors: Scenic agricultural belts, orange orchards, fertile farmland, and weekend farm retreats.

Knowledge Base - AS Realty Services:
- Curated Portfolio: Over ₹250+ Crore in handpicked, strictly vetted properties across luxury flats, penthouses, sky bungalows, sanctioned residential plots, and agricultural farmlands.
- Chauffeur-Driven VIP Site Visits: Private luxury chauffeur pickup and guided tour of shortlisted estates.
- 30-Year Title Due Diligence: In-house legal scrutiny of parent deeds, non-encumbrance certificates, MahaRERA registrations, NMRDA/RL plot sanctions, and revenue 7/12 & 8A extracts.
- Direct Developer Pricing & 0% Brokerage on primary developer inventory.
- Customized Financial Advisory: Banking tie-ups with SBI, HDFC, ICICI for swift sanction at premier rates.
- NRI & Out-of-State Desk: Power of Attorney guidance, live video walkthroughs, and seamless registration support.

Knowledge Base - Inventory Highlights:
- Luxury Residences & Penthouses:
  * Mittal Atlantis (Seminary Hills) - 3 & 4 BHK Luxury Flats / Penthouses, ₹1.71 Cr – ₹4.56 Cr
  * Orchid Gokul Residences (Dharampeth) - 4 BHK Super-Luxury, ₹2.55 Cr
  * Landmarks Orchid Shivneri (Gandhi Nagar) - 3 BHK Premium, ₹1.46 Cr – ₹1.76 Cr
  * Maxx Shrila Apartment (Dharampeth) - 3 BHK High-End, ₹1.95 Cr – ₹1.98 Cr
  * Jinraj Majestic Sky Bungalow (Wardhaman Nagar) - 3.5 & 4 BHK Sky Villas, ₹2.03 Cr – ₹2.27 Cr
  * Civil Lines Crown Towers (Civil Lines) & Ramdaspeth Elite Heights - Price on Request
- High-Growth Modern Apartments:
  * Golden Legacy & Golden Signature (Besa) - 2 & 3 BHK, ₹52.79 L – ₹73.58 L
  * Mahindra Bloomdale (MIHAN) - 1, 2 & 3 BHK, ₹36.41 L – ₹54.66 L
  * Radha Madhav Vrindavan (Wardha Road) - 1, 2 & 3 BHK, ₹24.50 L – ₹78.00 L
  * Om Shiv Kailasa Phase II (MIHAN) - 2 & 3 BHK, ₹59.90 L – ₹81.05 L
  * SDPL Om Tatvam (Kachimet) - 3 & 4 BHK, ₹1.26 Cr – ₹1.27 Cr
- Sanctioned Plotted Land:
  * Besa Imperial Greens Plotted Enclave (Besa) - NMRDA & RL Sanctioned, ₹42.50 L – ₹88.00 L
  * Mahalaxmi Nagar 49 Ayana (MIHAN) - Residential Plot Bundles, ₹47.60 L – ₹2.85 Cr
  * Godrej Rivershore Estate (Samruddhi Expressway) - Residential Land, ₹66.00 L – ₹2.83 Cr
  * HOABL Nagpur Marina & Karamchand Greens (Hingna) - ₹29.75 L – ₹93.49 L
- Agricultural Farmland & Fields:
  * Pench Agro Meadows & Orchard Estates (Ramtek / Pench Corridor) - 1 Acre Farmland, Clear 7/12 & 8A, ₹45.00 L – ₹1.25 Cr
  * Katol Valley Greenfields & Orange Groves (Katol Road) - Eco Farm & Citrus Grooves, ₹35.00 L – ₹85.00 L
  * Umred Countryside Agro Ranch (Umred Road) - Cultivated Field Plots, ₹28.50 L – ₹62.00 L
  * Samruddhi Agri Horizons & Farm Plots - ₹52.00 L – ₹1.40 Cr
  * Hingna Forest Edge Farm Retreat - Weekend Farmhouse Land, ₹65.00 L – ₹1.10 Cr
`;

export function generateSmartFallback(message: string): string {
  const q = (message || '').toLowerCase();

  if (q.includes('trust') || q.includes('safe') || q.includes('rera') || q.includes('legal') || q.includes('amit')) {
    return `At AS Realty, trust is our cornerstone. Under the leadership of **Amit Shivpeth**, we have established a 15-year reputation built on uncompromising standards:

• **100% MahaRERA & Title Verification**: Every project undergoes a thorough 30-year legal search, title deed scrutiny, and statutory clearance review before entering our portfolio.
• **Zero Hidden Costs**: Complete transparency with direct developer allocations and no surprise charges.
• **Personal Executive Oversight**: Amit Shivpeth personally oversees client acquisitions to protect your capital and generational wealth.
• **Documented Track Record**: Over ₹250+ Crore in curated property transactions across Civil Lines, Ramdaspeth, MIHAN, and Nagpur's premier growth corridors.

Aap chahein toh hum verified legal search reports provide kar sakte hain. Amit Shivpeth ji se direct confidential consultation ya VIP site visit ke liye WhatsApp karein: **+91 87883 75434**.`;
  }

  if (q.includes('service') || q.includes('help') || q.includes('offer') || q.includes('visit') || q.includes('consult')) {
    return `AS Realty aapko complete white-glove luxury real estate advisory deta hai:

1. **Bespoke Portfolio Matching**: Aapke budget aur requirements ke mutabiq best luxury apartments, penthouses ya sanctioned plots match karte hain.
2. **VIP Chauffeur Site Visits**: Private luxury car pickup ke saath guided site inspection arranged ki jaati hai.
3. **In-House Legal Due Diligence**: 30-year title search, 7/12 & 8A land revenue extract verification, aur NMRDA/RL sanctions scrutiny.
4. **Preferential Banking & Pricing**: 0% brokerage on primary inventory, plus premier home loan interest rates from SBI, HDFC & ICICI.
5. **NRI & Out-of-State Desk**: High-resolution video walkthroughs, PoA coordination, aur hassle-free registration.

Hum aapke liye VIP site visit schedule kar sakte hain. WhatsApp par connect karein: **+91 87883 75434**.`;
  }

  if (q.includes('plot') || q.includes('land') || q.includes('nmrda') || q.includes('rl')) {
    return `Nagpur ke plotted corridors mein capital appreciation sabse fast hai:

• **Besa Imperial Greens**: NMRDA & RL sanctioned residential plots (₹42.50 L – ₹88.00 L).
• **Mahalaxmi Nagar 49 Ayana (MIHAN)**: IT aur Aerospace corridor ke adjoining prime plots (₹47.60 L – ₹2.85 Cr).
• **HOABL Nagpur Marina & Karamchand Greens (Hingna)**: Modern gated township land with underground utilities (₹29.75 L – ₹93.49 L).
• **Godrej Rivershore (Samruddhi Expressway)**: Direct expressway connectivity plots (₹66.00 L – ₹2.83 Cr).

Sabhi plots 100% sanctioned hain with clear title deeds aur immediate construction demarcation. Kya aap site visit schedule karna chahenge?`;
  }

  if (q.includes('farm') || q.includes('field') || q.includes('agri') || q.includes('acre') || q.includes('pench') || q.includes('katol')) {
    return `AS Realty exclusively verified agricultural land aur farm estates offer karta hai:

• **Pench Agro Meadows & Orchard Estates**: Scenic Pench corridor mein 1-Acre gated farmland, clear 7/12 & 8A extracts, sweet groundwater (₹45 L – ₹1.25 Cr).
• **Katol Valley Greenfields**: Organic citrus aur orange orchards ke liye ideal (₹35 L – ₹85 L).
• **Umred Countryside Ranch & Samruddhi Agri Horizons**: High connectivity farm parcels with verified title ownership (₹28.50 L – ₹1.40 Cr).

Har farm parcel clear-title aur fencing ke saath ready hai. Countryside tour book karne ke liye WhatsApp karein: **+91 87883 75434**.`;
  }

  if (q.includes('civil lines') || q.includes('ramdaspeth') || q.includes('dharampeth') || q.includes('penthouse') || q.includes('luxury')) {
    return `Nagpur ke most elite pin codes mein ready luxury residences available hain:

• **Civil Lines Crown Towers**: Administrative corridor mein exclusive high-rise penthouses with panoramic views.
• **Orchid Gokul Residences (Dharampeth)**: 4 BHK super-luxury residences with Italian marble finishes aur private elevators (₹2.55 Cr).
• **Maxx Shrila & Landmarks Shivneri**: Dharampeth aur Gandhi Nagar ke premium landmark developments (₹1.46 Cr – ₹1.98 Cr).
• **Mittal Atlantis (Seminary Hills)**: Lush greenery views ke saath 3 & 4 BHK sky penthouses (₹1.71 Cr – ₹4.56 Cr).

Private walkthrough ke liye hum chauffeur-driven luxury vehicle arrange kar denge. WhatsApp: **+91 87883 75434**.`;
  }

  return `Namaste! AS Realty mein aapka swagat hai. Amit Shivpeth ji ke leadership mein hum Nagpur ke most trusted luxury real estate advisors hain:

• **Curated Nagpur Properties**: Civil Lines & Dharampeth ke penthouses, Besa & MIHAN ke sanctioned plots, aur Pench ke fertile farm estates.
• **100% Legal Scrutiny**: MahaRERA verified, 30-year title due diligence, aur zero hidden charges.
• **White-Glove VIP Service**: Complimentary chauffeur-driven site visit aur personalized deal advisory.

Aap kis tarah ki property explore karna chahte hain? Hum turant help karenge! WhatsApp: **+91 87883 75434**.`;
}
