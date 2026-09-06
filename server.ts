import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// AS Realty System Instruction for Gemini Chatbot
const AS_REALTY_SYSTEM_INSTRUCTION = `
You are the Senior Luxury Property Advisor & VIP Client Concierge at AS Realty, Nagpur's premier luxury real estate advisory firm led by founding director Amit Shivpeth.

Your Mission:
1. Convince prospective buyers and investors about the immense value, growth, and prestige of owning prime properties in Nagpur.
2. Clearly explain AS Realty's bespoke white-glove services and how we elevate the real estate acquisition experience.
3. Build deep trust and credibility by emphasizing transparency, legal due diligence, 100% MahaRERA compliance, and Amit Shivpeth's 15+ years of verified market leadership.
4. Guide clients towards booking private VIP site visits or connecting directly via WhatsApp (+91 87883 75434 / concierge@asrealty.in) and following on Instagram (@asrealty.official).

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

How to answer:
- When a user expresses doubts about buying, explain why Nagpur has superior capital appreciation and safety compared to saturated tier-1 metros.
- When they ask about our service, detail our end-to-end assistance from title verification to key handover.
- When they ask about trust, cite Amit Shivpeth's reputation, MahaRERA verification, zero hidden charges, and transparent legal vetting.
- Always conclude with a gracious invitation to schedule a private site visit or connect with Amit Shivpeth on WhatsApp (+91 87883 75434).
- Keep formatting clean, using concise bullet points and bold highlights for effortless reading.
`;

// Helper: fallback response generator if API key is not configured or in case of external network issues
function generateSmartFallback(message: string): string {
  const q = (message || '').toLowerCase();

  if (q.includes('trust') || q.includes('safe') || q.includes('rera') || q.includes('legal') || q.includes('amit')) {
    return `At AS Realty, trust is our cornerstone. Under the leadership of **Amit Shivpeth**, we have established a 15-year reputation built on uncompromising standards:

• **100% MahaRERA & Title Verification**: Every project undergoes a thorough 30-year legal search, title deed scrutiny, and statutory clearance review before entering our portfolio.
• **Zero Hidden Costs**: Complete transparency with direct developer allocations and no surprise charges.
• **Personal Executive Oversight**: Amit Shivpeth personally oversees client acquisitions to protect your capital and generational wealth.
• **Documented Track Record**: Over ₹250+ Crore in curated property transactions across Civil Lines, Ramdaspeth, MIHAN, and Nagpur's premier growth corridors.

Would you like to review our verified legal documentation or schedule a private consultation with Amit Shivpeth? You can connect directly via WhatsApp at **+91 87883 75434**.`;
  }

  if (q.includes('service') || q.includes('help') || q.includes('offer') || q.includes('visit') || q.includes('consult')) {
    return `AS Realty offers an end-to-end luxury advisory experience tailored for discerning buyers, HNIs, and NRIs:

1. **Bespoke Portfolio Matching**: We match your lifestyle and financial goals with exclusive inventory—from Civil Lines penthouses to NMRDA sanctioned plots and fertile Pench agricultural estates.
2. **VIP Chauffeur Site Visits**: Enjoy seamless, private chauffeur-driven property tours arranged at your preferred schedule.
3. **In-House Legal Due Diligence**: Scrutiny of 7/12 & 8A land records, NMRDA sanctions, non-encumbrance certificates, and RERA approvals.
4. **Preferential Banking & Pricing**: Exclusive developer rates (0% brokerage on primary units) and streamlined mortgage processing with leading banks.
5. **NRI & Out-of-State Support**: Virtual video walkthroughs, PoA coordination, and remote registration assistance.

We would be delighted to coordinate a private site visit for you. Simply message us on WhatsApp at **+91 87883 75434** or email **concierge@asrealty.in**.`;
  }

  if (q.includes('plot') || q.includes('land') || q.includes('nmrda') || q.includes('rl')) {
    return `Nagpur's plotted developments represent some of the highest capital appreciation opportunities in Maharashtra:

• **Besa Imperial Greens**: NMRDA & RL sanctioned residential plots ranging from ₹42.50 L to ₹88.00 L in Besa's high-demand residential corridor.
• **Mahalaxmi Nagar 49 Ayana (MIHAN)**: Premium plots directly adjoining the IT and aerospace corridor (₹47.60 L – ₹2.85 Cr).
• **HOABL Nagpur Marina & Karamchand Greens (Hingna)**: Modern gated township land with underground utilities and clubhouse infrastructure (₹29.75 L – ₹93.49 L).
• **Godrej Rivershore (Samruddhi Expressway)**: High-speed expressway connectivity plots (₹66 L – ₹2.83 Cr).

All plotted land in our portfolio is 100% sanctioned with clear title deeds and immediate construction demarcation. Would you like a master layout map or a site tour this week?`;
  }

  if (q.includes('farm') || q.includes('field') || q.includes('agri') || q.includes('acre') || q.includes('pench') || q.includes('katol')) {
    return `AS Realty curates exclusive agricultural farmland and countryside estates for discerning families and eco-investors:

• **Pench Agro Meadows & Orchard Estates**: Fertile 1-Acre plots near the scenic Pench buffer corridor, with clear 7/12 & 8A extracts, sweet groundwater, and gated fencing (₹45 L – ₹1.25 Cr).
• **Katol Valley Greenfields**: Ideal for organic citrus/orange groves and weekend farm retreats (₹35 L – ₹85 L).
• **Umred Countryside Ranch & Samruddhi Agri Horizons**: High-connectivity farm parcels with verified title ownership (₹28.50 L – ₹1.40 Cr).

Every farm parcel comes with verified land revenue records, direct road access, and clear ownership. Let us arrange a countryside site visit for you!`;
  }

  if (q.includes('civil lines') || q.includes('ramdaspeth') || q.includes('dharampeth') || q.includes('penthouse') || q.includes('luxury')) {
    return `For luxury living in Nagpur's most prestigious pin codes, we offer access to elite residences:

• **Civil Lines Crown Towers**: Exclusive high-rise penthouses in Nagpur's administrative and diplomatic enclave.
• **Orchid Gokul Residences (Dharampeth)**: 4 BHK super-luxury residences with Italian marble finishes and private elevators (₹2.55 Cr).
• **Maxx Shrila & Landmarks Shivneri**: Architectural landmarks in Dharampeth and Gandhi Nagar (₹1.46 Cr – ₹1.98 Cr).
• **Mittal Atlantis (Seminary Hills)**: Panoramic forest and city views with 3 & 4 BHK penthouses (₹1.71 Cr – ₹4.56 Cr).

These residences offer private floor layouts, three-tier security, and unmatched neighborhood prestige. Shall we arrange an exclusive private walkthrough for you?`;
  }

  // Default welcome response
  return `Welcome to **AS Realty**. Guided by founding director **Amit Shivpeth**, we are Nagpur's most trusted luxury real estate advisory firm.

Here is how we can assist you today:
• **Curated Nagpur Properties**: Discover handpicked penthouses in Civil Lines & Dharampeth, NMRDA sanctioned plots in Besa & MIHAN, and fertile farm estates in Pench.
• **Comprehensive Due Diligence**: 100% MahaRERA compliance, verified 7/12 land titles, and zero hidden charges.
• **White-Glove Concierge**: Complimentary chauffeur-driven site visits, bespoke legal consultation, and personalized negotiation.

What type of property or investment are you exploring in Nagpur? You can also connect directly with our concierge team on WhatsApp at **+91 87883 75434**.`;
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'AS Realty AI Concierge' });
});

// Gemini Multi-Turn Chatbot API
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], modelSpeed = 'general' } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required and must be a string.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Determine model according to prompt specifications:
    // "Use gemini-3.1-pro-preview for particularly complex tasks, gemini-3.5-flash for general tasks, and gemini-3.1-flash-lite for tasks that should happen fast."
    let model = 'gemini-3.5-flash';
    if (modelSpeed === 'complex') {
      model = 'gemini-3.1-pro-preview';
    } else if (modelSpeed === 'fast') {
      model = 'gemini-3.1-flash-lite';
    } else {
      model = 'gemini-3.5-flash';
    }

    // If no API key is available or placeholder, use smart fallback
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      const fallbackReply = generateSmartFallback(message);
      res.json({
        reply: fallbackReply,
        modelUsed: 'as-realty-expert-engine',
        status: 'fallback',
        note: 'Configure GEMINI_API_KEY in AI Studio Settings > Secrets for live Gemini model streaming.',
      });
      return;
    }

    // Initialize Gemini client on the server side
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Format chat history into contents array
    const contents = [];

    if (Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-10)) {
        if (item && item.text && (item.role === 'user' || item.role === 'model' || item.role === 'assistant')) {
          contents.push({
            role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user',
            parts: [{ text: String(item.text) }],
          });
        }
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
          systemInstruction: AS_REALTY_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const replyText = response.text || generateSmartFallback(message);
      res.json({
        reply: replyText,
        modelUsed: model,
        status: 'success',
      });
    } catch (apiError: any) {
      console.error('Gemini API call failed, falling back to expert knowledge base:', apiError?.message);
      const fallbackReply = generateSmartFallback(message);
      res.json({
        reply: fallbackReply,
        modelUsed: 'as-realty-fallback',
        status: 'fallback',
        errorDetails: apiError?.message || 'API request error',
      });
    }
  } catch (err: any) {
    console.error('Server error handling /api/chat:', err);
    res.status(500).json({
      error: 'Failed to process chat message.',
      details: err?.message,
    });
  }
});

// Vite middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AS Realty luxury portal running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
