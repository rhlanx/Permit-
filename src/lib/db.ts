import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "db", "permits.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  const tableExists = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='permits'"
    )
    .get();

  if (!tableExists) {
    initializeDatabase(db);
  }

  return db;
}

function initializeDatabase(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS business_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      description TEXT,
      typical_cost_low INTEGER,
      typical_cost_high INTEGER,
      typical_timeline_weeks_low INTEGER,
      typical_timeline_weeks_high INTEGER
    );

    CREATE TABLE IF NOT EXISTS permits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      agency TEXT NOT NULL,
      agency_phone TEXT,
      agency_address TEXT,
      agency_url TEXT,
      level TEXT NOT NULL CHECK (level IN ('federal', 'state', 'county', 'city')),
      fee_low REAL,
      fee_high REAL,
      fee_notes TEXT,
      timeline_weeks_low INTEGER,
      timeline_weeks_high INTEGER,
      renewal_period TEXT,
      renewal_fee REAL,
      phase INTEGER DEFAULT 1,
      phase_label TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS business_permits (
      business_type_id TEXT REFERENCES business_types(id),
      permit_id TEXT REFERENCES permits(id),
      required TEXT CHECK (required IN ('required', 'conditional', 'recommended')),
      condition_description TEXT,
      condition_field TEXT,
      condition_value TEXT,
      filing_order INTEGER,
      PRIMARY KEY (business_type_id, permit_id)
    );

    CREATE TABLE IF NOT EXISTS location_permits (
      permit_id TEXT REFERENCES permits(id),
      location TEXT CHECK (location IN ('annapolis', 'anne_arundel', 'both')),
      PRIMARY KEY (permit_id, location)
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      phone TEXT,
      business_type TEXT,
      service_tier TEXT,
      message TEXT,
      roadmap_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedDatabase(db);
}

function seedDatabase(db: Database.Database) {
  const insertBusinessType = db.prepare(`
    INSERT OR REPLACE INTO business_types (id, name, icon, description, typical_cost_low, typical_cost_high, typical_timeline_weeks_low, typical_timeline_weeks_high)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const businessTypes = [
    ["food_truck", "Food Truck", "🚚", "Mobile food service vehicle", 600, 1500, 3, 6],
    ["restaurant", "Restaurant / Café", "🍔", "Permanent food service establishment", 2000, 5000, 6, 12],
    ["hvac", "HVAC Contractor", "🔧", "Heating, ventilation, and air conditioning services", 600, 2000, 7, 12],
    ["salon", "Hair / Beauty Salon", "💇", "Cosmetology and beauty services", 300, 1000, 4, 10],
    ["home_improvement", "Home Improvement Contractor", "🏠", "General contracting and home renovation", 500, 1500, 4, 8],
    ["bnb", "Bed & Breakfast / Short-Term Rental", "🛏️", "Lodging and hospitality", 1000, 3000, 6, 12],
    ["retail", "Retail Store", "🏪", "Brick-and-mortar retail sales", 200, 1000, 2, 6],
    ["pet_services", "Pet Services", "🐕", "Pet sitting, grooming, boarding", 200, 800, 2, 6],
    ["photography", "Photography Business", "📸", "Professional photography services", 100, 500, 1, 4],
    ["massage", "Massage Therapy", "💆", "Licensed massage therapy practice", 300, 1000, 4, 8],
    ["landscaping", "Landscaping", "🌿", "Lawn care and landscaping services", 200, 800, 2, 6],
    ["handyman", "Handyman", "🔨", "General repair and maintenance services", 200, 600, 2, 4],
  ];

  const insertBT = db.transaction(() => {
    for (const bt of businessTypes) {
      insertBusinessType.run(...bt);
    }
  });
  insertBT();

  const insertPermit = db.prepare(`
    INSERT OR REPLACE INTO permits (id, name, description, agency, agency_phone, agency_address, agency_url, level, fee_low, fee_high, fee_notes, timeline_weeks_low, timeline_weeks_high, renewal_period, renewal_fee, phase, phase_label, notes)
    VALUES (@id, @name, @description, @agency, @agency_phone, @agency_address, @agency_url, @level, @fee_low, @fee_high, @fee_notes, @timeline_weeks_low, @timeline_weeks_high, @renewal_period, @renewal_fee, @phase, @phase_label, @notes)
  `);

  const permits = [
    { id: "ein", name: "Employer Identification Number (EIN)", description: "Your business's federal tax ID — like a Social Security number for your company. You need this before you can open a bank account, hire employees, or apply for most other permits.", agency: "IRS", agency_phone: null, agency_address: null, agency_url: "https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online", level: "federal", fee_low: 0, fee_high: 0, fee_notes: "Free", timeline_weeks_low: 0, timeline_weeks_high: 0, renewal_period: null, renewal_fee: null, phase: 1, phase_label: "Set Up Your Business", notes: "Apply online at IRS.gov — takes about 5 minutes. Required for LLCs, corporations, and anyone with employees." },
    { id: "md_business_reg", name: "Maryland Business Registration (LLC/Corporation)", description: "Officially register your business entity with the State of Maryland. This makes your LLC or corporation a legal entity.", agency: "State Department of Assessments and Taxation (SDAT)", agency_phone: null, agency_address: null, agency_url: "https://businessexpress.maryland.gov", level: "state", fee_low: 100, fee_high: 120, fee_notes: "$100 for LLC, $120 for Corporation", timeline_weeks_low: 1, timeline_weeks_high: 2, renewal_period: "Annual report required", renewal_fee: 300, phase: 1, phase_label: "Set Up Your Business", notes: "File online through Maryland Business Express. Annual report ($300) due every year to keep your entity in good standing." },
    { id: "md_sales_tax", name: "Sales & Use Tax License (Seller's Permit)", description: "Lets you collect Maryland's 6% sales tax on taxable goods and services. Required before your first sale.", agency: "Comptroller of Maryland", agency_phone: null, agency_address: null, agency_url: "https://businessexpress.maryland.gov", level: "state", fee_low: 0, fee_high: 0, fee_notes: "Free", timeline_weeks_low: 0, timeline_weeks_high: 0, renewal_period: "No renewal — keep current with tax filings", renewal_fee: null, phase: 1, phase_label: "Set Up Your Business", notes: "Apply online through Maryland Business Express or bFile. Maryland has no local sales taxes — just the 6% state rate." },
    { id: "traders_license", name: "Trader's License (General Business License)", description: "Maryland's equivalent of a general business license. Required for anyone buying goods and selling them to customers.", agency: "Circuit Court Clerk, Anne Arundel County", agency_phone: "(410) 222-1434", agency_address: null, agency_url: null, level: "state", fee_low: 15, fee_high: 800, fee_notes: "Based on inventory value — most small businesses pay $15–$100", timeline_weeks_low: 1, timeline_weeks_high: 2, renewal_period: "Annual (May 1 – April 30)", renewal_fee: null, phase: 1, phase_label: "Set Up Your Business", notes: "Apply through the Anne Arundel County Clerk of the Circuit Court. Fee is scaled to your inventory value." },
    { id: "food_manager_cert", name: "Food Service Manager Certification (ServSafe)", description: "Proves you know how to handle food safely. At least one certified manager must be on site at all times during food prep.", agency: "Accredited exam provider (ServSafe, NRFSP, etc.)", agency_phone: null, agency_address: null, agency_url: "https://www.servsafe.com", level: "state", fee_low: 80, fee_high: 150, fee_notes: "Exam + study course", timeline_weeks_low: 0, timeline_weeks_high: 1, renewal_period: "Every 5 years", renewal_fee: null, phase: 2, phase_label: "Get Licensed", notes: "Required for moderate and high-priority food facilities including food trucks. Take the class and exam — usually 1-2 days." },
    { id: "aa_food_license_high", name: "Food Service Facility License — High Priority", description: "Your license to operate a food business. 'High priority' means you're cooking, cooling, or reheating food — like a full-service restaurant.", agency: "Anne Arundel County Department of Health", agency_phone: "(410) 222-7192", agency_address: "3 Harry S. Truman Parkway, Annapolis, MD 21401", agency_url: "https://www.aahealth.org/node/156", level: "county", fee_low: 590, fee_high: 590, fee_notes: "$395 if operating less than 4 months", timeline_weeks_low: 2, timeline_weeks_high: 4, renewal_period: "Annual", renewal_fee: null, phase: 3, phase_label: "Get Permitted", notes: "Submit building plans to the Permit Center. Health department fees assessed upon receipt of plans." },
    { id: "aa_food_license_mod", name: "Food Service Facility License — Moderate Priority", description: "For food businesses that do some cooking but less complex prep — like a sandwich shop or coffee bar with heated food.", agency: "Anne Arundel County Department of Health", agency_phone: "(410) 222-7192", agency_address: null, agency_url: "https://www.aahealth.org/node/156", level: "county", fee_low: 395, fee_high: 395, fee_notes: "$195 if operating less than 6 months", timeline_weeks_low: 2, timeline_weeks_high: 4, renewal_period: "Annual", renewal_fee: null, phase: 3, phase_label: "Get Permitted", notes: "Moderate priority = some cooking or hot holding, but not complex multi-step food prep." },
    { id: "aa_food_license_low", name: "Food Service Facility License — Low Priority", description: "For food businesses with minimal prep — like a pre-packaged snack shop or beverage-only establishment.", agency: "Anne Arundel County Department of Health", agency_phone: "(410) 222-7192", agency_address: null, agency_url: "https://www.aahealth.org/node/156", level: "county", fee_low: 195, fee_high: 195, fee_notes: null, timeline_weeks_low: 2, timeline_weeks_high: 4, renewal_period: "Annual", renewal_fee: null, phase: 3, phase_label: "Get Permitted", notes: "Low priority = pre-packaged food, beverages only, or very minimal food prep." },
    { id: "structural_plan_review", name: "Structural Plan Review", description: "The health department reviews your kitchen/facility blueprints to make sure they meet food safety standards before you build.", agency: "Anne Arundel County Department of Health", agency_phone: "(410) 222-7192", agency_address: null, agency_url: "https://www.aahealth.org/node/156", level: "county", fee_low: 500, fee_high: 750, fee_notes: "$750 for high/moderate priority, $500 for low", timeline_weeks_low: 2, timeline_weeks_high: 4, renewal_period: null, renewal_fee: null, phase: 3, phase_label: "Get Permitted", notes: "Required for new construction or remodeling of food facilities. Submit plans to Permit Center at 2664 Riva Road." },
    { id: "haccp_review", name: "HACCP Plan Review", description: "A review of your food safety plan — how you'll prevent contamination, control temperatures, and handle allergens.", agency: "Anne Arundel County Department of Health", agency_phone: "(410) 222-7192", agency_address: null, agency_url: "https://www.aahealth.org/node/156", level: "county", fee_low: 750, fee_high: 750, fee_notes: null, timeline_weeks_low: 2, timeline_weeks_high: 4, renewal_period: null, renewal_fee: null, phase: 3, phase_label: "Get Permitted", notes: "Required for high and moderate priority food facilities only. HACCP = Hazard Analysis Critical Control Points." },
    { id: "mobile_food_license", name: "Mobile Food Service Facility License", description: "Your license to operate a food truck in Anne Arundel County. Your truck will be inspected before the license is issued.", agency: "Anne Arundel County Department of Health", agency_phone: "(410) 222-7192", agency_address: "3 Harry S. Truman Parkway, Annapolis, MD 21401", agency_url: "https://www.aahealth.org/node/147", level: "county", fee_low: 395, fee_high: 395, fee_notes: null, timeline_weeks_low: 2, timeline_weeks_high: 4, renewal_period: "Annual", renewal_fee: null, phase: 3, phase_label: "Get Permitted", notes: "Vehicle inspection at 3 Harry S. Truman Parkway. Separate license needed for each county you operate in." },
    { id: "commissary_auth", name: "Commissary / Base of Operation Authorization", description: "Proof that your food truck has an approved 'home base' with water, waste disposal, storage, and a place to wash equipment.", agency: "Anne Arundel County Department of Health", agency_phone: "(410) 222-7192", agency_address: null, agency_url: null, level: "county", fee_low: 0, fee_high: 0, fee_notes: "Free (county form) — commissary rental is a separate private cost", timeline_weeks_low: 0, timeline_weeks_high: 1, renewal_period: null, renewal_fee: null, phase: 3, phase_label: "Get Permitted", notes: "Your commissary must be within 90 miles of the licensing county. The commissary operator signs the authorization form." },
    { id: "alcohol_license", name: "Alcoholic Beverage License", description: "Required to sell beer, wine, or liquor. Class A = off-premises (liquor store), Class B = on-premises (bar/restaurant).", agency: "MD Alcohol, Tobacco & Cannabis Commission + Anne Arundel County Board of License Commissioners", agency_phone: "(410) 222-1148", agency_address: null, agency_url: null, level: "state", fee_low: 110, fee_high: 3000, fee_notes: "Varies widely by license class", timeline_weeks_low: 4, timeline_weeks_high: 12, renewal_period: "Annual", renewal_fee: null, phase: 3, phase_label: "Get Permitted", notes: "Involves both state and county approval. The County Board of License Commissioners handles Anne Arundel County. Plan for a longer timeline." },
    { id: "certificate_of_use", name: "Certificate of Use", description: "Confirms your business location is properly zoned for your type of business. Required before you open your doors.", agency: "City of Annapolis Planning & Zoning", agency_phone: "(410) 263-7946", agency_address: "145 Gorman Street, Third Floor, Annapolis, MD 21401", agency_url: null, level: "city", fee_low: 0, fee_high: 100, fee_notes: "Varies", timeline_weeks_low: 1, timeline_weeks_high: 2, renewal_period: null, renewal_fee: null, phase: 4, phase_label: "Final Steps", notes: "Required when opening in a commercial space in Annapolis. Not needed for mobile-only operations." },
    { id: "sign_permit", name: "Sign Permit", description: "Permission to put up your business sign. Annapolis has specific rules about sign size, placement, and lighting — especially in the Historic District.", agency: "City of Annapolis Planning & Zoning", agency_phone: "(410) 263-7946", agency_address: null, agency_url: null, level: "city", fee_low: 0, fee_high: 100, fee_notes: null, timeline_weeks_low: 1, timeline_weeks_high: 2, renewal_period: null, renewal_fee: null, phase: 4, phase_label: "Final Steps", notes: "New rules for sidewalk signs as of 2019. Historic District has additional restrictions." },
    { id: "city_vendor_license", name: "City Vendor License", description: "May be required for street vending within Annapolis city limits.", agency: "Annapolis Office of the City Clerk", agency_phone: null, agency_address: null, agency_url: null, level: "city", fee_low: 0, fee_high: 100, fee_notes: "Confirm with Clerk's office", timeline_weeks_low: 1, timeline_weeks_high: 2, renewal_period: null, renewal_fee: null, phase: 4, phase_label: "Final Steps", notes: "Confirm requirement with the City Clerk's office. Applies to food trucks and mobile vendors operating on city streets." },
    { id: "fire_use_occupancy", name: "Fire Department Use & Occupancy Permit", description: "The Fire Marshal inspects your space to make sure it's safe for customers and employees — exits, fire suppression, occupancy limits.", agency: "Anne Arundel County Fire Marshal", agency_phone: null, agency_address: null, agency_url: null, level: "county", fee_low: 0, fee_high: 200, fee_notes: null, timeline_weeks_low: 1, timeline_weeks_high: 3, renewal_period: "Annual inspection", renewal_fee: null, phase: 4, phase_label: "Final Steps", notes: "Needed for businesses open to the public. Annual fire safety inspections typically required." },
    { id: "epa_608", name: "EPA Section 608 Technician Certification", description: "Federal certification required for anyone who purchases or handles refrigerants (like Freon). Types I, II, III, or Universal.", agency: "U.S. EPA (exam via ESCO Institute or NATE)", agency_phone: null, agency_address: null, agency_url: "https://www.epa.gov/section608", level: "federal", fee_low: 20, fee_high: 60, fee_notes: null, timeline_weeks_low: 1, timeline_weeks_high: 2, renewal_period: "No expiration", renewal_fee: null, phase: 2, phase_label: "Get Licensed", notes: "Required before you can legally purchase or work with refrigerants. Universal certification covers all equipment types." },
    { id: "md_hvacr_license", name: "Maryland HVACR License", description: "State license to perform HVAC work in Maryland. Tiered: Apprentice, Journeyman, Master, or Limited.", agency: "Maryland State Board of HVACR Contractors, Department of Labor", agency_phone: null, agency_address: null, agency_url: "https://labor.maryland.gov/license/hvacr/", level: "state", fee_low: 100, fee_high: 500, fee_notes: "Varies by license tier", timeline_weeks_low: 6, timeline_weeks_high: 10, renewal_period: "Every 2 years", renewal_fee: null, phase: 2, phase_label: "Get Licensed", notes: "Requires general liability insurance ($300K+) and property damage coverage ($100K+) with the Board named as certificate holder." },
    { id: "mhic_contractor", name: "MHIC Contractor License (Home Improvement)", description: "Required for anyone doing home improvement work in Maryland — renovations, additions, roofing, siding, windows, etc.", agency: "Maryland Home Improvement Commission", agency_phone: "(410) 230-6309", agency_address: null, agency_url: "https://labor.maryland.gov/license/mhic/", level: "state", fee_low: 403, fee_high: 404, fee_notes: "$281.25 application + $100 Guaranty Fund + $22.50 processing", timeline_weeks_low: 2, timeline_weeks_high: 4, renewal_period: "Every 2 years", renewal_fee: 456.25, phase: 2, phase_label: "Get Licensed", notes: "Renewal: $281.25 + $175 Guaranty Fund. Requires liability insurance. MHIC salesperson license ($135) needed for employees who sell." },
    { id: "aa_trade_license", name: "Anne Arundel County Trade License", description: "County-level license for electrical, plumbing, or mechanical/HVAC work. You must already have the matching State of Maryland license.", agency: "Anne Arundel County Licensing Division, Dept. of Inspections and Permits", agency_phone: "(410) 222-7788", agency_address: "2664 Riva Road, Annapolis, MD 21401", agency_url: null, level: "county", fee_low: 50, fee_high: 200, fee_notes: null, timeline_weeks_low: 1, timeline_weeks_high: 3, renewal_period: "Annual — renew online via Land Use Navigator", renewal_fee: null, phase: 2, phase_label: "Get Licensed", notes: "Requires a valid State of Maryland license first. Apply by mail to 2664 Riva Rd, Annapolis, MD 21401." },
    { id: "annapolis_mech_permit", name: "Annapolis Mechanical Building Permit", description: "Required for each HVAC, plumbing, or electrical job you do within Annapolis city limits.", agency: "City of Annapolis Inspections and Permits", agency_phone: "(410) 263-7946", agency_address: "145 Gorman Street, Third Floor, Annapolis, MD 21401", agency_url: null, level: "city", fee_low: 125, fee_high: 150, fee_notes: "$125 for jobs up to $7K, $150 for $7K–$10K, $100 + 0.6% over $10K", timeline_weeks_low: 0, timeline_weeks_high: 1, renewal_period: "Per project", renewal_fee: null, phase: 3, phase_label: "Get Permitted", notes: "Must notify department when permitted work is complete for inspection. $100 reinspection fee (residential) if inspection fails." },
    { id: "cosmetologist_license", name: "Cosmetologist License (Per Stylist)", description: "Each stylist in your salon must hold their own state cosmetologist license. Requires schooling and a board exam.", agency: "Maryland Board of Cosmetologists, Dept. of Labor", agency_phone: null, agency_address: null, agency_url: "https://labor.maryland.gov/license/cosmet/", level: "state", fee_low: 25, fee_high: 75, fee_notes: "$25 application + exam fee (paid to vendor)", timeline_weeks_low: 4, timeline_weeks_high: 8, renewal_period: "Every 2 years ($28)", renewal_fee: 28, phase: 2, phase_label: "Get Licensed", notes: "Requires 1,500 hours of cosmetology school OR 24-month registered apprenticeship. 6 hours continuing education required starting January 2026." },
    { id: "cosmetology_establishment", name: "Cosmetology Establishment License", description: "Licenses your salon as a physical location. The Board inspects your space before issuing it.", agency: "Maryland Board of Cosmetologists", agency_phone: null, agency_address: null, agency_url: "https://labor.maryland.gov/license/cosmet/", level: "state", fee_low: 225, fee_high: 225, fee_notes: null, timeline_weeks_low: 4, timeline_weeks_high: 8, renewal_period: "Every 2 years ($56)", renewal_fee: 56, phase: 2, phase_label: "Get Licensed", notes: "Facility inspection required before license is issued. Apply before you build out the space." },
    { id: "mdl", name: "Multiple Dwelling License", description: "Required for properties with 2+ units available for occupancy — apartments, B&Bs, hotels, rooming houses.", agency: "Anne Arundel County Inspections and Permits", agency_phone: "(410) 222-7788", agency_address: null, agency_url: null, level: "county", fee_low: 100, fee_high: 500, fee_notes: null, timeline_weeks_low: 2, timeline_weeks_high: 6, renewal_period: "Annual", renewal_fee: null, phase: 3, phase_label: "Get Permitted", notes: "Requires: Zoning Certificate of Use (call 410-222-7446), health department inspection, fire marshal inspection (if applicable), and lead risk law compliance. Nonresident owners must designate a county resident agent." },
    { id: "bnb_facility_license", name: "Bed & Breakfast Facility License", description: "Specific license for operating a B&B. The health department inspects your kitchen and food service areas.", agency: "Anne Arundel County Department of Health", agency_phone: "(410) 222-7192", agency_address: null, agency_url: null, level: "county", fee_low: 195, fee_high: 395, fee_notes: null, timeline_weeks_low: 4, timeline_weeks_high: 8, renewal_period: "Annual", renewal_fee: null, phase: 3, phase_label: "Get Permitted", notes: "Facility inspection required. If serving food beyond continental breakfast, you may need a higher-priority food service license." },
    { id: "historic_district", name: "Historic District Approval", description: "If your business is in the Annapolis Historic District, any exterior changes need approval from the Historic Preservation Commission.", agency: "Annapolis Historic Preservation Commission", agency_phone: null, agency_address: null, agency_url: null, level: "city", fee_low: 0, fee_high: 200, fee_notes: null, timeline_weeks_low: 2, timeline_weeks_high: 6, renewal_period: null, renewal_fee: null, phase: 3, phase_label: "Get Permitted", notes: "Applies to exterior changes only — signage, facade, paint colors, structural alterations. Interior changes don't require approval." },
    { id: "lead_risk", name: "Lead Risk Compliance", description: "Maryland law requires properties built before 1978 to meet lead paint safety standards when rented or used as lodging.", agency: "Maryland Department of the Environment", agency_phone: null, agency_address: null, agency_url: null, level: "state", fee_low: 0, fee_high: 500, fee_notes: null, timeline_weeks_low: 1, timeline_weeks_high: 4, renewal_period: null, renewal_fee: null, phase: 3, phase_label: "Get Permitted", notes: "Required for housing and lodging. Includes lead inspection/risk assessment and any required remediation." },
    { id: "zoning_cert", name: "Zoning Certificate of Use", description: "Confirms your property is zoned to allow your type of business or use.", agency: "Anne Arundel County Zoning Enforcement", agency_phone: "(410) 222-7446", agency_address: null, agency_url: null, level: "county", fee_low: 0, fee_high: 100, fee_notes: null, timeline_weeks_low: 1, timeline_weeks_high: 2, renewal_period: null, renewal_fee: null, phase: 3, phase_label: "Get Permitted", notes: "Required before a Multiple Dwelling License. Contact Zoning Enforcement at (410) 222-7446." },
    { id: "building_permit", name: "Building Permit", description: "Required for new construction, major renovations, additions, and most structural work.", agency: "Anne Arundel County Inspections and Permits OR City of Annapolis Inspections and Permits", agency_phone: "(410) 222-7730", agency_address: null, agency_url: null, level: "county", fee_low: 100, fee_high: 1000, fee_notes: "Varies by project scope and value", timeline_weeks_low: 2, timeline_weeks_high: 6, renewal_period: null, renewal_fee: null, phase: 3, phase_label: "Get Permitted", notes: "County: 2664 Riva Rd, (410) 222-7730. City of Annapolis: 145 Gorman St, (410) 263-7946. Submit architectural/engineering plans." },
    { id: "short_term_rental", name: "Short-Term Rental License", description: "Required for Airbnb, VRBO, and similar short-term rental operations in Anne Arundel County.", agency: "Anne Arundel County Inspections and Permits", agency_phone: "(410) 222-7788", agency_address: null, agency_url: null, level: "county", fee_low: 100, fee_high: 300, fee_notes: null, timeline_weeks_low: 2, timeline_weeks_high: 4, renewal_period: "Annual", renewal_fee: null, phase: 3, phase_label: "Get Permitted", notes: "Separate from the B&B license. For properties rented for short stays through platforms like Airbnb." },
    { id: "special_event", name: "Special Events Permit", description: "Required for public events — festivals, outdoor markets, pop-up events, etc.", agency: "Anne Arundel County OR City of Annapolis", agency_phone: null, agency_address: null, agency_url: null, level: "county", fee_low: 50, fee_high: 500, fee_notes: null, timeline_weeks_low: 2, timeline_weeks_high: 6, renewal_period: "Per event", renewal_fee: null, phase: 3, phase_label: "Get Permitted", notes: "Apply well in advance. County and city have separate processes." },
    { id: "hucksters_license", name: "Huckster's License", description: "Required for selling products door-to-door or from a vehicle (not food trucks — this is for non-food products).", agency: "Anne Arundel County Licensing Division", agency_phone: "(410) 222-7788", agency_address: null, agency_url: null, level: "county", fee_low: 25, fee_high: 100, fee_notes: null, timeline_weeks_low: 1, timeline_weeks_high: 2, renewal_period: "Annual", renewal_fee: null, phase: 2, phase_label: "Get Licensed", notes: "For mobile non-food vendors and door-to-door sales." },
    { id: "dog_license", name: "Dog License", description: "Required for all dogs 6 months and older residing in Anne Arundel County.", agency: "Anne Arundel County Animal Services", agency_phone: "(410) 222-8900", agency_address: null, agency_url: null, level: "county", fee_low: 10, fee_high: 25, fee_notes: null, timeline_weeks_low: 0, timeline_weeks_high: 1, renewal_period: "Annual", renewal_fee: null, phase: 2, phase_label: "Get Licensed", notes: "Can be purchased online. Relevant for pet service businesses that need to ensure client dogs are licensed." },
    { id: "commercial_kennel", name: "Commercial Kennel License", description: "Required for businesses that buy, sell, breed, or board animals.", agency: "Anne Arundel County Animal Services", agency_phone: "(410) 222-8900", agency_address: null, agency_url: null, level: "county", fee_low: 50, fee_high: 200, fee_notes: null, timeline_weeks_low: 2, timeline_weeks_high: 4, renewal_period: "Annual", renewal_fee: null, phase: 2, phase_label: "Get Licensed", notes: "Required for any animal boarding, breeding, or sales operation." },
    { id: "fda_food_reg", name: "FDA Food Facility Registration", description: "Federal registration for facilities that manufacture, process, pack, or hold food for consumption in the US.", agency: "U.S. Food and Drug Administration", agency_phone: null, agency_address: null, agency_url: "https://www.fda.gov/food/registration-food-facilities-and-other-submissions/food-facility-registration", level: "federal", fee_low: 0, fee_high: 0, fee_notes: "Free", timeline_weeks_low: 0, timeline_weeks_high: 1, renewal_period: "Biennial renewal (even-numbered years)", renewal_fee: 0, phase: 1, phase_label: "Set Up Your Business", notes: "Required for food manufacturing/processing. NOT required for restaurants that serve food directly to consumers." },
  ];

  const insertP = db.transaction(() => {
    for (const p of permits) {
      insertPermit.run(p);
    }
  });
  insertP();

  const insertBP = db.prepare(`
    INSERT OR REPLACE INTO business_permits (business_type_id, permit_id, required, condition_description, condition_field, condition_value, filing_order)
    VALUES (@business_type_id, @permit_id, @required, @condition_description, @condition_field, @condition_value, @filing_order)
  `);

  const businessPermits = [
    { business_type_id: "food_truck", permit_id: "ein", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 1 },
    { business_type_id: "food_truck", permit_id: "md_sales_tax", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 2 },
    { business_type_id: "food_truck", permit_id: "food_manager_cert", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 3 },
    { business_type_id: "food_truck", permit_id: "commissary_auth", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 4 },
    { business_type_id: "food_truck", permit_id: "mobile_food_license", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 5 },
    { business_type_id: "food_truck", permit_id: "haccp_review", required: "conditional", condition_description: "Required for moderate/high priority food trucks", condition_field: null, condition_value: null, filing_order: 6 },
    { business_type_id: "food_truck", permit_id: "traders_license", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 7 },
    { business_type_id: "food_truck", permit_id: "city_vendor_license", required: "conditional", condition_description: "If street vending within Annapolis city limits", condition_field: "location", condition_value: "annapolis", filing_order: 8 },
    { business_type_id: "restaurant", permit_id: "ein", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 1 },
    { business_type_id: "restaurant", permit_id: "md_business_reg", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 2 },
    { business_type_id: "restaurant", permit_id: "md_sales_tax", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 3 },
    { business_type_id: "restaurant", permit_id: "traders_license", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 4 },
    { business_type_id: "restaurant", permit_id: "food_manager_cert", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 5 },
    { business_type_id: "restaurant", permit_id: "structural_plan_review", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 6 },
    { business_type_id: "restaurant", permit_id: "haccp_review", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 7 },
    { business_type_id: "restaurant", permit_id: "aa_food_license_high", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 8 },
    { business_type_id: "restaurant", permit_id: "certificate_of_use", required: "conditional", condition_description: "If located within Annapolis city limits", condition_field: "location", condition_value: "annapolis", filing_order: 9 },
    { business_type_id: "restaurant", permit_id: "alcohol_license", required: "conditional", condition_description: "If serving alcohol", condition_field: "serves_alcohol", condition_value: "yes", filing_order: 10 },
    { business_type_id: "restaurant", permit_id: "sign_permit", required: "conditional", condition_description: "If located within Annapolis city limits", condition_field: "location", condition_value: "annapolis", filing_order: 11 },
    { business_type_id: "restaurant", permit_id: "fire_use_occupancy", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 12 },
    { business_type_id: "restaurant", permit_id: "building_permit", required: "conditional", condition_description: "If doing new construction or major renovation", condition_field: "new_construction", condition_value: "yes", filing_order: 13 },
    { business_type_id: "hvac", permit_id: "ein", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 1 },
    { business_type_id: "hvac", permit_id: "epa_608", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 2 },
    { business_type_id: "hvac", permit_id: "md_hvacr_license", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 3 },
    { business_type_id: "hvac", permit_id: "mhic_contractor", required: "conditional", condition_description: "If doing residential home improvement work", condition_field: "home_improvement", condition_value: "yes", filing_order: 4 },
    { business_type_id: "hvac", permit_id: "aa_trade_license", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 5 },
    { business_type_id: "hvac", permit_id: "annapolis_mech_permit", required: "conditional", condition_description: "Per-job permit for work within Annapolis city limits", condition_field: "location", condition_value: "annapolis", filing_order: 6 },
    { business_type_id: "hvac", permit_id: "traders_license", required: "recommended", condition_description: null, condition_field: null, condition_value: null, filing_order: 7 },
    { business_type_id: "salon", permit_id: "ein", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 1 },
    { business_type_id: "salon", permit_id: "cosmetologist_license", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 2 },
    { business_type_id: "salon", permit_id: "cosmetology_establishment", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 3 },
    { business_type_id: "salon", permit_id: "md_sales_tax", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 4 },
    { business_type_id: "salon", permit_id: "traders_license", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 5 },
    { business_type_id: "salon", permit_id: "certificate_of_use", required: "conditional", condition_description: "If located within Annapolis city limits", condition_field: "location", condition_value: "annapolis", filing_order: 6 },
    { business_type_id: "home_improvement", permit_id: "ein", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 1 },
    { business_type_id: "home_improvement", permit_id: "md_business_reg", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 2 },
    { business_type_id: "home_improvement", permit_id: "mhic_contractor", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 3 },
    { business_type_id: "home_improvement", permit_id: "traders_license", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 4 },
    { business_type_id: "home_improvement", permit_id: "aa_trade_license", required: "conditional", condition_description: "If doing electrical, plumbing, or HVAC work", condition_field: null, condition_value: null, filing_order: 5 },
    { business_type_id: "home_improvement", permit_id: "building_permit", required: "conditional", condition_description: "Per-job permit for construction work", condition_field: null, condition_value: null, filing_order: 6 },
    { business_type_id: "bnb", permit_id: "ein", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 1 },
    { business_type_id: "bnb", permit_id: "md_business_reg", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 2 },
    { business_type_id: "bnb", permit_id: "bnb_facility_license", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 3 },
    { business_type_id: "bnb", permit_id: "mdl", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 4 },
    { business_type_id: "bnb", permit_id: "zoning_cert", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 5 },
    { business_type_id: "bnb", permit_id: "historic_district", required: "conditional", condition_description: "If in the Annapolis Historic District", condition_field: "historic_district", condition_value: "yes", filing_order: 6 },
    { business_type_id: "bnb", permit_id: "certificate_of_use", required: "conditional", condition_description: "If located within Annapolis city limits", condition_field: "location", condition_value: "annapolis", filing_order: 7 },
    { business_type_id: "bnb", permit_id: "lead_risk", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 8 },
    { business_type_id: "bnb", permit_id: "short_term_rental", required: "conditional", condition_description: "If operating as a short-term rental (Airbnb/VRBO) rather than traditional B&B", condition_field: null, condition_value: null, filing_order: 9 },
    { business_type_id: "retail", permit_id: "ein", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 1 },
    { business_type_id: "retail", permit_id: "md_business_reg", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 2 },
    { business_type_id: "retail", permit_id: "md_sales_tax", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 3 },
    { business_type_id: "retail", permit_id: "traders_license", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 4 },
    { business_type_id: "retail", permit_id: "certificate_of_use", required: "conditional", condition_description: "If located within Annapolis city limits", condition_field: "location", condition_value: "annapolis", filing_order: 5 },
    { business_type_id: "retail", permit_id: "sign_permit", required: "conditional", condition_description: "If located within Annapolis city limits", condition_field: "location", condition_value: "annapolis", filing_order: 6 },
    { business_type_id: "retail", permit_id: "fire_use_occupancy", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 7 },
    { business_type_id: "pet_services", permit_id: "ein", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 1 },
    { business_type_id: "pet_services", permit_id: "md_business_reg", required: "recommended", condition_description: null, condition_field: null, condition_value: null, filing_order: 2 },
    { business_type_id: "pet_services", permit_id: "md_sales_tax", required: "conditional", condition_description: "If selling taxable goods", condition_field: null, condition_value: null, filing_order: 3 },
    { business_type_id: "pet_services", permit_id: "traders_license", required: "conditional", condition_description: "If selling pet products", condition_field: null, condition_value: null, filing_order: 4 },
    { business_type_id: "pet_services", permit_id: "commercial_kennel", required: "conditional", condition_description: "If boarding, breeding, or selling animals", condition_field: null, condition_value: null, filing_order: 5 },
    { business_type_id: "pet_services", permit_id: "certificate_of_use", required: "conditional", condition_description: "If operating from a commercial location in Annapolis", condition_field: "location", condition_value: "annapolis", filing_order: 6 },
    { business_type_id: "photography", permit_id: "ein", required: "recommended", condition_description: null, condition_field: null, condition_value: null, filing_order: 1 },
    { business_type_id: "photography", permit_id: "md_business_reg", required: "recommended", condition_description: null, condition_field: null, condition_value: null, filing_order: 2 },
    { business_type_id: "photography", permit_id: "md_sales_tax", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 3 },
    { business_type_id: "photography", permit_id: "traders_license", required: "conditional", condition_description: "If selling prints or products", condition_field: null, condition_value: null, filing_order: 4 },
    { business_type_id: "photography", permit_id: "certificate_of_use", required: "conditional", condition_description: "If operating a studio in Annapolis", condition_field: "location", condition_value: "annapolis", filing_order: 5 },
    { business_type_id: "massage", permit_id: "ein", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 1 },
    { business_type_id: "massage", permit_id: "md_business_reg", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 2 },
    { business_type_id: "massage", permit_id: "md_sales_tax", required: "conditional", condition_description: "If selling products", condition_field: null, condition_value: null, filing_order: 3 },
    { business_type_id: "massage", permit_id: "traders_license", required: "conditional", condition_description: "If selling products", condition_field: null, condition_value: null, filing_order: 4 },
    { business_type_id: "massage", permit_id: "certificate_of_use", required: "conditional", condition_description: "If in Annapolis", condition_field: "location", condition_value: "annapolis", filing_order: 5 },
    { business_type_id: "landscaping", permit_id: "ein", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 1 },
    { business_type_id: "landscaping", permit_id: "md_business_reg", required: "recommended", condition_description: null, condition_field: null, condition_value: null, filing_order: 2 },
    { business_type_id: "landscaping", permit_id: "mhic_contractor", required: "conditional", condition_description: "If doing hardscaping or structural work on homes", condition_field: null, condition_value: null, filing_order: 3 },
    { business_type_id: "landscaping", permit_id: "traders_license", required: "conditional", condition_description: "If selling plants or materials", condition_field: null, condition_value: null, filing_order: 4 },
    { business_type_id: "handyman", permit_id: "ein", required: "required", condition_description: null, condition_field: null, condition_value: null, filing_order: 1 },
    { business_type_id: "handyman", permit_id: "md_business_reg", required: "recommended", condition_description: null, condition_field: null, condition_value: null, filing_order: 2 },
    { business_type_id: "handyman", permit_id: "mhic_contractor", required: "conditional", condition_description: "Required if any single job exceeds $500 in labor and materials", condition_field: null, condition_value: null, filing_order: 3 },
    { business_type_id: "handyman", permit_id: "traders_license", required: "conditional", condition_description: "If selling materials", condition_field: null, condition_value: null, filing_order: 4 },
  ];

  const insertBPT = db.transaction(() => {
    for (const bp of businessPermits) {
      insertBP.run(bp);
    }
  });
  insertBPT();

  const insertLP = db.prepare(`
    INSERT OR REPLACE INTO location_permits (permit_id, location) VALUES (?, ?)
  `);

  const locationPermits = [
    ["certificate_of_use", "annapolis"], ["sign_permit", "annapolis"], ["city_vendor_license", "annapolis"],
    ["annapolis_mech_permit", "annapolis"], ["historic_district", "annapolis"],
    ["aa_trade_license", "both"], ["mobile_food_license", "both"], ["aa_food_license_high", "both"],
    ["aa_food_license_mod", "both"], ["aa_food_license_low", "both"], ["structural_plan_review", "both"],
    ["haccp_review", "both"], ["commissary_auth", "both"], ["fire_use_occupancy", "both"],
    ["mdl", "both"], ["bnb_facility_license", "both"], ["zoning_cert", "both"],
    ["building_permit", "both"], ["short_term_rental", "both"], ["special_event", "both"],
    ["hucksters_license", "both"], ["commercial_kennel", "both"], ["ein", "both"],
    ["md_business_reg", "both"], ["md_sales_tax", "both"], ["traders_license", "both"],
    ["food_manager_cert", "both"], ["alcohol_license", "both"], ["epa_608", "both"],
    ["md_hvacr_license", "both"], ["mhic_contractor", "both"], ["cosmetologist_license", "both"],
    ["cosmetology_establishment", "both"], ["lead_risk", "both"], ["fda_food_reg", "both"],
    ["dog_license", "both"],
  ];

  const insertLPT = db.transaction(() => {
    for (const [permit_id, location] of locationPermits) {
      insertLP.run(permit_id, location);
    }
  });
  insertLPT();
}

export interface BusinessType {
  id: string;
  name: string;
  icon: string;
  description: string;
  typical_cost_low: number;
  typical_cost_high: number;
  typical_timeline_weeks_low: number;
  typical_timeline_weeks_high: number;
}

export interface Permit {
  id: string;
  name: string;
  description: string;
  agency: string;
  agency_phone: string | null;
  agency_address: string | null;
  agency_url: string | null;
  level: string;
  fee_low: number;
  fee_high: number;
  fee_notes: string | null;
  timeline_weeks_low: number;
  timeline_weeks_high: number;
  renewal_period: string | null;
  renewal_fee: number | null;
  phase: number;
  phase_label: string;
  notes: string | null;
}

export interface PermitResult extends Permit {
  required: string;
  condition_description: string | null;
  filing_order: number;
}

export function getBusinessTypes(): BusinessType[] {
  const db = getDb();
  return db.prepare("SELECT * FROM business_types ORDER BY name").all() as BusinessType[];
}

export function getBusinessType(id: string): BusinessType | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM business_types WHERE id = ?").get(id) as BusinessType | undefined;
}

export function getPermitsForBusiness(
  businessTypeId: string,
  location: string,
  conditions: Record<string, string> = {}
): PermitResult[] {
  const db = getDb();

  const permits = db.prepare(`
    SELECT p.*, bp.required, bp.condition_description, bp.condition_field, bp.condition_value, bp.filing_order
    FROM business_permits bp
    JOIN permits p ON bp.permit_id = p.id
    JOIN location_permits lp ON p.id = lp.permit_id
    WHERE bp.business_type_id = ?
      AND (lp.location = 'both' OR lp.location = ? OR (? = 'both' AND lp.location IN ('annapolis', 'anne_arundel', 'both')))
    ORDER BY bp.filing_order
  `).all(businessTypeId, location, location) as (PermitResult & { condition_field: string | null; condition_value: string | null })[];

  const seen = new Set<string>();
  const results: PermitResult[] = [];

  for (const permit of permits) {
    if (seen.has(permit.id)) continue;
    seen.add(permit.id);

    if (permit.required === "conditional" && permit.condition_field && permit.condition_value) {
      const userValue = conditions[permit.condition_field];
      if (userValue && userValue !== permit.condition_value && location !== permit.condition_value) {
        continue;
      }
    }

    results.push(permit);
  }

  return results;
}

export function saveLead(data: {
  name?: string;
  email: string;
  phone?: string;
  business_type?: string;
  service_tier?: string;
  message?: string;
  roadmap_data?: string;
}) {
  const db = getDb();
  return db.prepare(`
    INSERT INTO leads (name, email, phone, business_type, service_tier, message, roadmap_data)
    VALUES (@name, @email, @phone, @business_type, @service_tier, @message, @roadmap_data)
  `).run({
    name: data.name || null,
    email: data.email,
    phone: data.phone || null,
    business_type: data.business_type || null,
    service_tier: data.service_tier || null,
    message: data.message || null,
    roadmap_data: data.roadmap_data || null,
  });
}
