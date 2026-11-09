import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

/**
 * -------------------------------------------------------------
 * MASTER HEALTHCARE PHARMACEUTICAL CATALOG
 * Real-world pharmaceutical formulations, therapeutic classifications,
 * brand names, generic compositions, manufacturers, and tax rates.
 * -------------------------------------------------------------
 */

// 1. MASTER THERAPEUTIC CATEGORIES
export const MASTER_CATEGORIES = [
  {
    name: 'Analgesics & Antipyretics',
    description: 'Medications indicated for acute and chronic pain management, fever reduction, and anti-inflammatory relief.'
  },
  {
    name: 'Antibiotics & Antimicrobials',
    description: 'Broad-spectrum antibacterial, antiprotozoal, and anti-infective formulations for systemic infections.'
  },
  {
    name: 'Gastrointestinal & Antacids',
    description: 'Proton pump inhibitors, H2-receptor antagonists, antiemetics, and antacids for GI acid-peptic disorders.'
  },
  {
    name: 'Cardiovascular & Antihypertensives',
    description: 'Antihypertensives, statins, antiplatelet agents, and cardioprotective formulations for cardiovascular management.'
  },
  {
    name: 'Antidiabetics & Endocrine',
    description: 'Oral hypoglycemic biguanides, sulfonylureas, SGLT2 inhibitors, and synthetic thyroid hormone therapies.'
  },
  {
    name: 'Respiratory & Anti-Allergic',
    description: 'Antihistamines, bronchodilators, leukotriene inhibitors, and inhaled corticosteroids for airway disorders.'
  },
  {
    name: 'Vitamins & Nutritional Supplements',
    description: 'Essential micronutrients, calcium salts, iron hematinics, neurotropic vitamins, and dietary supplements.'
  },
  {
    name: 'Dermatologicals & Topicals',
    description: 'Topical antiseptics, antifungal creams, antibacterial ointments, and local pain-relief formulations.'
  },
  {
    name: 'Ophthalmic & ENT Preparations',
    description: 'Sterile ocular lubricants, antimicrobial eye/ear drops, and topical nasal decongestants.'
  },
  {
    name: 'Central Nervous System',
    description: 'Anxiolytics, selective serotonin reuptake inhibitors (SSRIs), and neurological stabilization agents.'
  }
];

// 2. MASTER MEDICINES DIRECTORY
export const MASTER_MEDICINES = [
  // --- Category: Analgesics & Antipyretics ---
  {
    name: 'Dolo 650',
    genericName: 'Paracetamol 650mg',
    categoryName: 'Analgesics & Antipyretics',
    therapeuticClasses: ['Analgesic', 'Antipyretic', 'Fever Relief', 'Pain Relief'],
    sku: 'DOLO-650-TAB',
    dosageForm: 'Tablet',
    strength: '650mg',
    packageUnit: 'Strip of 15',
    minReorderLevel: 30,
    defaultTaxRate: 12.00,
    manufacturer: 'Micro Labs Limited'
  },
  {
    name: 'Crocin 500 Advance',
    genericName: 'Paracetamol Fast-Release 500mg',
    categoryName: 'Analgesics & Antipyretics',
    therapeuticClasses: ['Analgesic', 'Antipyretic', 'Headache Relief'],
    sku: 'CROCIN-500-TAB',
    dosageForm: 'Tablet',
    strength: '500mg',
    packageUnit: 'Strip of 15',
    minReorderLevel: 25,
    defaultTaxRate: 12.00,
    manufacturer: 'GlaxoSmithKline Pharmaceuticals'
  },
  {
    name: 'Combiflam',
    genericName: 'Ibuprofen 400mg + Paracetamol 325mg',
    categoryName: 'Analgesics & Antipyretics',
    therapeuticClasses: ['NSAID', 'Analgesic', 'Anti-inflammatory', 'Dental Pain'],
    sku: 'COMBIFLAM-TAB',
    dosageForm: 'Tablet',
    strength: '400mg/325mg',
    packageUnit: 'Strip of 20',
    minReorderLevel: 25,
    defaultTaxRate: 12.00,
    manufacturer: 'Sanofi India Limited'
  },
  {
    name: 'Meftal-Spas',
    genericName: 'Mefenamic Acid 250mg + Dicyclomine HCl 10mg',
    categoryName: 'Analgesics & Antipyretics',
    therapeuticClasses: ['Antispasmodic', 'NSAID', 'Abdominal Colic', 'Dysmenorrhea'],
    sku: 'MEFTAL-SPAS-TAB',
    dosageForm: 'Tablet',
    strength: '250mg/10mg',
    packageUnit: 'Strip of 10',
    minReorderLevel: 20,
    defaultTaxRate: 12.00,
    manufacturer: 'Blue Cross Laboratories'
  },
  {
    name: 'Voveran 50 GE',
    genericName: 'Diclofenac Sodium Gastro-Resistant 50mg',
    categoryName: 'Analgesics & Antipyretics',
    therapeuticClasses: ['NSAID', 'Arthritis', 'Joint Pain', 'Musculoskeletal'],
    sku: 'VOVERAN-50-TAB',
    dosageForm: 'Tablet',
    strength: '50mg',
    packageUnit: 'Strip of 15',
    minReorderLevel: 20,
    defaultTaxRate: 12.00,
    manufacturer: 'Novartis India Limited'
  },

  // --- Category: Antibiotics & Antimicrobials ---
  {
    name: 'Augmentin 625 Duo',
    genericName: 'Amoxicillin 500mg + Potassium Clavulanate 125mg',
    categoryName: 'Antibiotics & Antimicrobials',
    therapeuticClasses: ['Antibiotic', 'Beta-Lactamase Inhibitor', 'Penicillin', 'Respiratory Infection'],
    sku: 'AUGMENTIN-625-DUO',
    dosageForm: 'Tablet',
    strength: '625mg',
    packageUnit: 'Strip of 10',
    minReorderLevel: 25,
    defaultTaxRate: 12.00,
    manufacturer: 'GlaxoSmithKline Pharmaceuticals'
  },
  {
    name: 'Azithral 500',
    genericName: 'Azithromycin Dihydrate 500mg',
    categoryName: 'Antibiotics & Antimicrobials',
    therapeuticClasses: ['Macrolide Antibiotic', 'Chest Infection', 'ENT Antibiotic'],
    sku: 'AZITHRAL-500-TAB',
    dosageForm: 'Tablet',
    strength: '500mg',
    packageUnit: 'Strip of 5',
    minReorderLevel: 20,
    defaultTaxRate: 12.00,
    manufacturer: 'Alembic Pharmaceuticals'
  },
  {
    name: 'Ciplox 500',
    genericName: 'Ciprofloxacin HCl 500mg',
    categoryName: 'Antibiotics & Antimicrobials',
    therapeuticClasses: ['Fluoroquinolone', 'Antibacterial', 'UTI Management'],
    sku: 'CIPLOX-500-TAB',
    dosageForm: 'Tablet',
    strength: '500mg',
    packageUnit: 'Strip of 10',
    minReorderLevel: 20,
    defaultTaxRate: 12.00,
    manufacturer: 'Cipla Limited'
  },
  {
    name: 'Taxim-O 200',
    genericName: 'Cefixime Trihydrate 200mg',
    categoryName: 'Antibiotics & Antimicrobials',
    therapeuticClasses: ['Cephalosporin (3rd Gen)', 'Oral Antibiotic', 'Typhoid & RTI'],
    sku: 'TAXIM-O-200-TAB',
    dosageForm: 'Tablet',
    strength: '200mg',
    packageUnit: 'Strip of 10',
    minReorderLevel: 20,
    defaultTaxRate: 12.00,
    manufacturer: 'Alkem Laboratories'
  },
  {
    name: 'Flagyl 400',
    genericName: 'Metronidazole 400mg',
    categoryName: 'Antibiotics & Antimicrobials',
    therapeuticClasses: ['Antiprotozoal', 'Anaerobic Antibacterial', 'Amoebiasis'],
    sku: 'FLAGYL-400-TAB',
    dosageForm: 'Tablet',
    strength: '400mg',
    packageUnit: 'Strip of 15',
    minReorderLevel: 20,
    defaultTaxRate: 12.00,
    manufacturer: 'Abbott Healthcare'
  },

  // --- Category: Gastrointestinal & Antacids ---
  {
    name: 'Pan 40',
    genericName: 'Pantoprazole Sodium Gastro-Resistant 40mg',
    categoryName: 'Gastrointestinal & Antacids',
    therapeuticClasses: ['Proton Pump Inhibitor (PPI)', 'Antacid', 'GERD', 'Peptic Ulcer'],
    sku: 'PAN-40-TAB',
    dosageForm: 'Tablet',
    strength: '40mg',
    packageUnit: 'Strip of 15',
    minReorderLevel: 30,
    defaultTaxRate: 12.00,
    manufacturer: 'Alkem Laboratories'
  },
  {
    name: 'Pan-D',
    genericName: 'Pantoprazole 40mg + Domperidone 30mg SR',
    categoryName: 'Gastrointestinal & Antacids',
    therapeuticClasses: ['Proton Pump Inhibitor', 'Antiemetic', 'Prokinetic', 'Acid Reflux'],
    sku: 'PAN-D-CAP',
    dosageForm: 'Capsule',
    strength: '40mg/30mg SR',
    packageUnit: 'Strip of 15',
    minReorderLevel: 25,
    defaultTaxRate: 12.00,
    manufacturer: 'Alkem Laboratories'
  },
  {
    name: 'Omez 20',
    genericName: 'Omeprazole 20mg Delayed Release',
    categoryName: 'Gastrointestinal & Antacids',
    therapeuticClasses: ['Proton Pump Inhibitor (PPI)', 'Gastritis', 'Heartburn'],
    sku: 'OMEZ-20-CAP',
    dosageForm: 'Capsule',
    strength: '20mg',
    packageUnit: 'Strip of 20',
    minReorderLevel: 25,
    defaultTaxRate: 12.00,
    manufacturer: "Dr. Reddy's Laboratories"
  },
  {
    name: 'Gelusil MPS Liquid',
    genericName: 'Aluminium Hydroxide + Magnesium Hydroxide + Simethicone',
    categoryName: 'Gastrointestinal & Antacids',
    therapeuticClasses: ['Antacid', 'Antiflatulent', 'Acidity Relief', 'Gastric Neutralizer'],
    sku: 'GELUSIL-MPS-200ML',
    dosageForm: 'Syrup',
    strength: '200ml Suspension',
    packageUnit: 'Bottle of 200ml',
    minReorderLevel: 15,
    defaultTaxRate: 12.00,
    manufacturer: 'Pfizer India'
  },
  {
    name: 'Ondem 4',
    genericName: 'Ondansetron HCl 4mg Fast-Dissolving',
    categoryName: 'Gastrointestinal & Antacids',
    therapeuticClasses: ['5-HT3 Antagonist', 'Antiemetic', 'Nausea & Vomiting'],
    sku: 'ONDEM-4-MD',
    dosageForm: 'Tablet',
    strength: '4mg MD',
    packageUnit: 'Strip of 10',
    minReorderLevel: 20,
    defaultTaxRate: 12.00,
    manufacturer: 'Alkem Laboratories'
  },
  {
    name: 'Cremaffin Syrup',
    genericName: 'Liquid Paraffin + Magnesium Hydroxide Emulsion',
    categoryName: 'Gastrointestinal & Antacids',
    therapeuticClasses: ['Laxative', 'Stool Softener', 'Constipation Management'],
    sku: 'CREMAFFIN-225ML',
    dosageForm: 'Syrup',
    strength: '225ml Emulsion',
    packageUnit: 'Bottle of 225ml',
    minReorderLevel: 10,
    defaultTaxRate: 12.00,
    manufacturer: 'Abbott Healthcare'
  },

  // --- Category: Cardiovascular & Antihypertensives ---
  {
    name: 'Telma 40',
    genericName: 'Telmisartan 40mg',
    categoryName: 'Cardiovascular & Antihypertensives',
    therapeuticClasses: ['ARB', 'Antihypertensive', 'Cardioprotective', 'Blood Pressure'],
    sku: 'TELMA-40-TAB',
    dosageForm: 'Tablet',
    strength: '40mg',
    packageUnit: 'Strip of 30',
    minReorderLevel: 20,
    defaultTaxRate: 12.00,
    manufacturer: 'Glenmark Pharmaceuticals'
  },
  {
    name: 'Telma-H',
    genericName: 'Telmisartan 40mg + Hydrochlorothiazide 12.5mg',
    categoryName: 'Cardiovascular & Antihypertensives',
    therapeuticClasses: ['ARB', 'Thiazide Diuretic', 'Combination Antihypertensive'],
    sku: 'TELMA-H-TAB',
    dosageForm: 'Tablet',
    strength: '40mg/12.5mg',
    packageUnit: 'Strip of 15',
    minReorderLevel: 15,
    defaultTaxRate: 12.00,
    manufacturer: 'Glenmark Pharmaceuticals'
  },
  {
    name: 'Amlong 5',
    genericName: 'Amlodipine Besylate 5mg',
    categoryName: 'Cardiovascular & Antihypertensives',
    therapeuticClasses: ['Calcium Channel Blocker (CCB)', 'Antihypertensive', 'Vasodilator'],
    sku: 'AMLONG-5-TAB',
    dosageForm: 'Tablet',
    strength: '5mg',
    packageUnit: 'Strip of 15',
    minReorderLevel: 20,
    defaultTaxRate: 12.00,
    manufacturer: 'Micro Labs Limited'
  },
  {
    name: 'Atorva 10',
    genericName: 'Atorvastatin Calcium 10mg',
    categoryName: 'Cardiovascular & Antihypertensives',
    therapeuticClasses: ['HMG-CoA Reductase Inhibitor', 'Statin', 'Cholesterol Lowering', 'Atherosclerosis'],
    sku: 'ATORVA-10-TAB',
    dosageForm: 'Tablet',
    strength: '10mg',
    packageUnit: 'Strip of 15',
    minReorderLevel: 20,
    defaultTaxRate: 12.00,
    manufacturer: 'Zydus Lifesciences'
  },
  {
    name: 'Rosuvas 10',
    genericName: 'Rosuvastatin Calcium 10mg',
    categoryName: 'Cardiovascular & Antihypertensives',
    therapeuticClasses: ['Statin', 'Dyslipidemia', 'Lipid-Lowering Agent'],
    sku: 'ROSUVAS-10-TAB',
    dosageForm: 'Tablet',
    strength: '10mg',
    packageUnit: 'Strip of 15',
    minReorderLevel: 20,
    defaultTaxRate: 12.00,
    manufacturer: 'Sun Pharmaceutical Industries'
  },
  {
    name: 'Ecosprin 75',
    genericName: 'Aspirin Gastro-Resistant 75mg',
    categoryName: 'Cardiovascular & Antihypertensives',
    therapeuticClasses: ['Antiplatelet', 'Antithrombotic', 'Cardioprotective', 'Stroke Prevention'],
    sku: 'ECOSPRIN-75-TAB',
    dosageForm: 'Tablet',
    strength: '75mg',
    packageUnit: 'Strip of 14',
    minReorderLevel: 30,
    defaultTaxRate: 12.00,
    manufacturer: 'USV Private Limited'
  },

  // --- Category: Antidiabetics & Endocrine ---
  {
    name: 'Glycomet 500 SR',
    genericName: 'Metformin HCl Prolonged Release 500mg',
    categoryName: 'Antidiabetics & Endocrine',
    therapeuticClasses: ['Biguanide', 'Oral Hypoglycemic', 'Type 2 Diabetes', 'Insulin Sensitizer'],
    sku: 'GLYCOMET-500-SR',
    dosageForm: 'Tablet',
    strength: '500mg SR',
    packageUnit: 'Strip of 20',
    minReorderLevel: 30,
    defaultTaxRate: 12.00,
    manufacturer: 'USV Private Limited'
  },
  {
    name: 'Glycomet-GP 1',
    genericName: 'Glimepiride 1mg + Metformin HCl 500mg PR',
    categoryName: 'Antidiabetics & Endocrine',
    therapeuticClasses: ['Dual Oral Antidiabetic', 'Sulfonylurea', 'Glycemic Control'],
    sku: 'GLYCOMET-GP1-TAB',
    dosageForm: 'Tablet',
    strength: '1mg/500mg',
    packageUnit: 'Strip of 15',
    minReorderLevel: 20,
    defaultTaxRate: 12.00,
    manufacturer: 'USV Private Limited'
  },
  {
    name: 'Januvia 100',
    genericName: 'Sitagliptin Phosphate Monohydrate 100mg',
    categoryName: 'Antidiabetics & Endocrine',
    therapeuticClasses: ['DPP-4 Inhibitor', 'Incretin Enhancer', 'Antidiabetic'],
    sku: 'JANUVIA-100-TAB',
    dosageForm: 'Tablet',
    strength: '100mg',
    packageUnit: 'Strip of 7',
    minReorderLevel: 10,
    defaultTaxRate: 12.00,
    manufacturer: 'MSD Pharmaceuticals'
  },
  {
    name: 'Thyronorm 50mcg',
    genericName: 'Thyroxine Sodium 50mcg',
    categoryName: 'Antidiabetics & Endocrine',
    therapeuticClasses: ['Thyroid Hormone Replacement', 'Hypothyroidism Management'],
    sku: 'THYRONORM-50-MCG',
    dosageForm: 'Tablet',
    strength: '50mcg',
    packageUnit: 'Bottle of 120',
    minReorderLevel: 15,
    defaultTaxRate: 12.00,
    manufacturer: 'Abbott Healthcare'
  },

  // --- Category: Respiratory & Anti-Allergic ---
  {
    name: 'Montair-LC',
    genericName: 'Montelukast Sodium 10mg + Levocetirizine HCl 5mg',
    categoryName: 'Respiratory & Anti-Allergic',
    therapeuticClasses: ['Leukotriene Receptor Antagonist', 'Antihistamine', 'Allergic Rhinitis', 'Asthma Prophylaxis'],
    sku: 'MONTAIR-LC-TAB',
    dosageForm: 'Tablet',
    strength: '10mg/5mg',
    packageUnit: 'Strip of 15',
    minReorderLevel: 25,
    defaultTaxRate: 12.00,
    manufacturer: 'Cipla Limited'
  },
  {
    name: 'Allegra 120',
    genericName: 'Fexofenadine HCl 120mg',
    categoryName: 'Respiratory & Anti-Allergic',
    therapeuticClasses: ['Non-Sedating Antihistamine', 'Seasonal Allergy', 'Hives & Urticaria'],
    sku: 'ALLEGRA-120-TAB',
    dosageForm: 'Tablet',
    strength: '120mg',
    packageUnit: 'Strip of 10',
    minReorderLevel: 20,
    defaultTaxRate: 12.00,
    manufacturer: 'Sanofi India Limited'
  },
  {
    name: 'Cetzine 10',
    genericName: 'Cetirizine Dihydrochloride 10mg',
    categoryName: 'Respiratory & Anti-Allergic',
    therapeuticClasses: ['2nd Generation Antihistamine', 'Anti-allergy', 'Sneezing & Runny Nose'],
    sku: 'CETZINE-10-TAB',
    dosageForm: 'Tablet',
    strength: '10mg',
    packageUnit: 'Strip of 10',
    minReorderLevel: 25,
    defaultTaxRate: 12.00,
    manufacturer: "Dr. Reddy's Laboratories"
  },
  {
    name: 'Asthalin Inhaler 100mcg',
    genericName: 'Salbutamol Inhalation Aerosol 100mcg / puff',
    categoryName: 'Respiratory & Anti-Allergic',
    therapeuticClasses: ['Short-Acting Beta2 Agonist (SABA)', 'Bronchodilator', 'Asthma Rescue Inhaler'],
    sku: 'ASTHALIN-INHALER',
    dosageForm: 'Inhaler',
    strength: '100mcg (200 MD)',
    packageUnit: 'Canister of 200 Puffs',
    minReorderLevel: 15,
    defaultTaxRate: 12.00,
    manufacturer: 'Cipla Limited'
  },
  {
    name: 'Ascoril D Plus Syrup',
    genericName: 'Dextromethorphan HBr 10mg + Chlorpheniramine 2mg + Phenylephrine 5mg',
    categoryName: 'Respiratory & Anti-Allergic',
    therapeuticClasses: ['Cough Suppressant', 'Nasal Decongestant', 'Antihistamine', 'Dry Cough'],
    sku: 'ASCORIL-D-100ML',
    dosageForm: 'Syrup',
    strength: '100ml Syrup',
    packageUnit: 'Bottle of 100ml',
    minReorderLevel: 20,
    defaultTaxRate: 12.00,
    manufacturer: 'Glenmark Pharmaceuticals'
  },

  // --- Category: Vitamins & Nutritional Supplements ---
  {
    name: 'Shelcal 500',
    genericName: 'Elemental Calcium 500mg + Vitamin D3 250 IU',
    categoryName: 'Vitamins & Nutritional Supplements',
    therapeuticClasses: ['Calcium Supplement', 'Vitamin D3', 'Bone Mineral Density', 'Osteoporosis'],
    sku: 'SHELCAL-500-TAB',
    dosageForm: 'Tablet',
    strength: '500mg/250 IU',
    packageUnit: 'Strip of 15',
    minReorderLevel: 30,
    defaultTaxRate: 12.00,
    manufacturer: 'Torrent Pharmaceuticals'
  },
  {
    name: 'Becosules Capsules',
    genericName: 'Vitamin B-Complex (B1, B2, B6, B12, Niacinamide) with Vitamin C',
    categoryName: 'Vitamins & Nutritional Supplements',
    therapeuticClasses: ['B-Complex', 'Vitamin C', 'Mouth Ulcer Relief', 'Energy Metabolism'],
    sku: 'BECOSULES-CAP',
    dosageForm: 'Capsule',
    strength: 'Therapeutic Multi-B',
    packageUnit: 'Strip of 20',
    minReorderLevel: 30,
    defaultTaxRate: 12.00,
    manufacturer: 'Pfizer India'
  },
  {
    name: 'Neurobion Forte',
    genericName: 'Vitamin B1 + B2 + B3 + B5 + B6 + B12',
    categoryName: 'Vitamins & Nutritional Supplements',
    therapeuticClasses: ['Neurotropic Vitamins', 'Neuropathy Support', 'Nerve Health'],
    sku: 'NEUROBION-FORTE-TAB',
    dosageForm: 'Tablet',
    strength: 'High Potency B-Vitamin',
    packageUnit: 'Strip of 30',
    minReorderLevel: 25,
    defaultTaxRate: 12.00,
    manufacturer: 'Procter & Gamble Health'
  },
  {
    name: 'Limcee 500 Orange',
    genericName: 'Ascorbic Acid (Vitamin C) 500mg Chewable',
    categoryName: 'Vitamins & Nutritional Supplements',
    therapeuticClasses: ['Vitamin C', 'Antioxidant', 'Immune Defense', 'Collagen Synthesis'],
    sku: 'LIMCEE-500-CHEW',
    dosageForm: 'Chewable Tablet',
    strength: '500mg',
    packageUnit: 'Strip of 15',
    minReorderLevel: 30,
    defaultTaxRate: 12.00,
    manufacturer: 'Abbott Healthcare'
  },
  {
    name: 'Orofer XT',
    genericName: 'Ferrous Ascorbate eq. to Elemental Iron 100mg + Folic Acid 1.5mg',
    categoryName: 'Vitamins & Nutritional Supplements',
    therapeuticClasses: ['Hematinic', 'Iron Supplement', 'Folic Acid', 'Anemia Management'],
    sku: 'OROFER-XT-TAB',
    dosageForm: 'Tablet',
    strength: '100mg/1.5mg',
    packageUnit: 'Strip of 10',
    minReorderLevel: 20,
    defaultTaxRate: 12.00,
    manufacturer: 'Emcure Pharmaceuticals'
  },

  // --- Category: Dermatologicals & Topicals ---
  {
    name: 'Betadine 10% Ointment',
    genericName: 'Povidone-Iodine 10% w/w',
    categoryName: 'Dermatologicals & Topicals',
    therapeuticClasses: ['Microbicidal Antiseptic', 'Wound Disinfectant', 'Burn & Cut Dressing'],
    sku: 'BETADINE-10-20G',
    dosageForm: 'Ointment',
    strength: '10% w/w (20g Tube)',
    packageUnit: 'Tube of 20g',
    minReorderLevel: 15,
    defaultTaxRate: 12.00,
    manufacturer: 'Win-Medicare'
  },
  {
    name: 'Candid-B Cream',
    genericName: 'Clotrimazole 1% + Beclomethasone Dipropionate 0.025%',
    categoryName: 'Dermatologicals & Topicals',
    therapeuticClasses: ['Broad Spectrum Antifungal', 'Topical Corticosteroid', 'Tinea & Ringworm'],
    sku: 'CANDID-B-20G',
    dosageForm: 'Cream',
    strength: '20g Cream',
    packageUnit: 'Tube of 20g',
    minReorderLevel: 15,
    defaultTaxRate: 12.00,
    manufacturer: 'Glenmark Pharmaceuticals'
  },
  {
    name: 'Volini Pain Relief Gel',
    genericName: 'Diclofenac Diethylamine + Methyl Salicylate + Menthol',
    categoryName: 'Dermatologicals & Topicals',
    therapeuticClasses: ['Topical NSAID', 'Counter-Irritant', 'Sprain & Back Pain'],
    sku: 'VOLINI-GEL-30G',
    dosageForm: 'Gel',
    strength: '30g Gel',
    packageUnit: 'Tube of 30g',
    minReorderLevel: 20,
    defaultTaxRate: 12.00,
    manufacturer: 'Sun Pharmaceutical Industries'
  },

  // --- Category: Ophthalmic & ENT Preparations ---
  {
    name: 'Ciplox Eye/Ear Drops',
    genericName: 'Ciprofloxacin 0.3% w/v Ophthalmic/Otic Solution',
    categoryName: 'Ophthalmic & ENT Preparations',
    therapeuticClasses: ['Ophthalmic Antibacterial', 'Conjunctivitis Treatment', 'Otitis Externa'],
    sku: 'CIPLOX-DROPS-10ML',
    dosageForm: 'Drops',
    strength: '0.3% w/v (10ml)',
    packageUnit: 'Vial of 10ml',
    minReorderLevel: 20,
    defaultTaxRate: 12.00,
    manufacturer: 'Cipla Limited'
  },
  {
    name: 'Refresh Tears 0.5%',
    genericName: 'Carboxymethylcellulose Sodium 0.5% w/v',
    categoryName: 'Ophthalmic & ENT Preparations',
    therapeuticClasses: ['Ocular Lubricant', 'Artificial Tears', 'Dry Eye Syndrome', 'Screen Fatigue'],
    sku: 'REFRESH-TEARS-10ML',
    dosageForm: 'Drops',
    strength: '0.5% w/v (10ml)',
    packageUnit: 'Vial of 10ml',
    minReorderLevel: 15,
    defaultTaxRate: 12.00,
    manufacturer: 'Allergan India'
  },
  {
    name: 'Otrivin 0.1% Adult Nasal Drops',
    genericName: 'Xylometazoline HCl 0.1% w/v',
    categoryName: 'Ophthalmic & ENT Preparations',
    therapeuticClasses: ['Topical Decongestant', 'Alpha-Adrenergic Agonist', 'Nasal Congestion'],
    sku: 'OTRIVIN-01-10ML',
    dosageForm: 'Drops',
    strength: '0.1% w/v (10ml)',
    packageUnit: 'Bottle of 10ml',
    minReorderLevel: 20,
    defaultTaxRate: 12.00,
    manufacturer: 'Haleon / GSK'
  },

  // --- Category: Central Nervous System ---
  {
    name: 'Nexito 10',
    genericName: 'Escitalopram Oxalate 10mg',
    categoryName: 'Central Nervous System',
    therapeuticClasses: ['SSRI Antidepressant', 'Anxiolytic', 'Major Depressive Disorder'],
    sku: 'NEXITO-10-TAB',
    dosageForm: 'Tablet',
    strength: '10mg',
    packageUnit: 'Strip of 10',
    minReorderLevel: 15,
    defaultTaxRate: 12.00,
    manufacturer: 'Sun Pharmaceutical Industries'
  },
  {
    name: 'Clonafit 0.5',
    genericName: 'Clonazepam 0.5mg',
    categoryName: 'Central Nervous System',
    therapeuticClasses: ['Benzodiazepine', 'Anxiolytic', 'Anticonvulsant', 'Panic Disorder'],
    sku: 'CLONAFIT-05-TAB',
    dosageForm: 'Tablet',
    strength: '0.5mg',
    packageUnit: 'Strip of 15',
    minReorderLevel: 10,
    defaultTaxRate: 12.00,
    manufacturer: 'Mankind Pharma'
  }
];

async function seedMasterCatalog() {
  console.log('📦 Starting Master Catalog Seeding...\n');

  try {
    // Phase 1: Seed Categories
    console.log(`1. Processing ${MASTER_CATEGORIES.length} Master Categories...`);
    const categoryMap = new Map();

    for (const cat of MASTER_CATEGORIES) {
      const savedCat = await prisma.category.upsert({
        where: { name: cat.name.trim() },
        update: {
          description: cat.description ? cat.description.trim() : null
        },
        create: {
          name: cat.name.trim(),
          description: cat.description ? cat.description.trim() : null
        }
      });
      categoryMap.set(savedCat.name.trim().toLowerCase(), savedCat);
    }
    console.log(`✅ Categories synced: ${categoryMap.size}`);

    // Phase 2: Seed Medicines
    console.log(`\n2. Processing ${MASTER_MEDICINES.length} Master Medicines...`);
    let createdCount = 0;
    let updatedCount = 0;

    for (const med of MASTER_MEDICINES) {
      const catKey = med.categoryName.trim().toLowerCase();
      let category = categoryMap.get(catKey);

      // Auto-create category if missing
      if (!category) {
        category = await prisma.category.create({
          data: {
            name: med.categoryName.trim(),
            description: null
          }
        });
        categoryMap.set(catKey, category);
      }

      const existingMed = await prisma.medicine.findUnique({
        where: { sku: med.sku.trim().toUpperCase() }
      });

      const medData = {
        name: med.name.trim(),
        genericName: med.genericName.trim(),
        categoryId: category.id,
        dosageForm: med.dosageForm.trim(),
        strength: med.strength.trim(),
        packageUnit: med.packageUnit.trim(),
        minReorderLevel: med.minReorderLevel || 20,
        defaultTaxRate: med.defaultTaxRate !== undefined ? med.defaultTaxRate : 12.00,
        therapeuticClasses: Array.isArray(med.therapeuticClasses) ? med.therapeuticClasses : [],
        manufacturer: med.manufacturer ? med.manufacturer.trim() : null,
        isActive: true
      };

      if (existingMed) {
        await prisma.medicine.update({
          where: { sku: med.sku.trim().toUpperCase() },
          data: medData
        });
        updatedCount++;
      } else {
        await prisma.medicine.create({
          data: {
            ...medData,
            sku: med.sku.trim().toUpperCase()
          }
        });
        createdCount++;
      }
    }

    console.log(`✅ Master Medicines Seeding Completed!`);
    console.log(`   - Created: ${createdCount} new formulations`);
    console.log(`   - Updated: ${updatedCount} existing formulations`);
    console.log(`   - Total in Master Catalog: ${MASTER_MEDICINES.length}\n`);

  } catch (error) {
    console.error('❌ Error during Master Catalog Seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedMasterCatalog();
