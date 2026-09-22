// Bilingual (English + Filipino/Tagalog) health lexicon for the Step 0 gate.
//
// This is the single place to grow health coverage — just add terms to the
// arrays below. Filipino terms are drawn from Tagalog health-vocabulary
// references (ling-app.com, tagaloglang.com) plus common Taglish usage; English
// terms cover standard consumer disease/symptom/treatment vocabulary.
//
// Matching rules (see health.ts):
//   - HEALTH_TERMS are matched case-INSENSITIVELY on word boundaries.
//   - HEALTH_ACRONYMS are matched case-SENSITIVELY, because their lowercase
//     forms are ordinary words ("who", "aids", "doh", "tb") that would cause
//     false positives.
//
// Deliberately EXCLUDED to avoid false positives: bare ambiguous words like
// "bato" (rock/kidney), "buto" (seed/bone), "pasta" (food/filling), "puso"
// (romantic heart), "sugar"/"fat"/"cold" (everyday words). Prefer specific
// phrases ("blood sugar", "sakit sa puso") over ambiguous single words.

// Case-insensitive terms. Multi-word phrases match across their internal space.
export const HEALTH_TERMS: string[] = [
  // ── English — diseases & conditions ──
  "cancer", "tumor", "carcinoma", "diabetes", "diabetic", "hypertension",
  "cholesterol", "stroke", "heart attack", "heart disease", "cardiac", "asthma",
  "tuberculosis", "pneumonia", "bronchitis", "dengue", "malaria", "typhoid",
  "hepatitis", "leptospirosis", "influenza", "measles", "chickenpox", "mumps",
  "arthritis", "migraine", "ulcer", "gastritis", "anemia", "allergy", "allergic",
  "infection", "infected", "virus", "viral", "bacteria", "bacterial", "epilepsy",
  "seizure", "goiter", "thyroid", "vertigo", "dehydration",
  // ── English — symptoms ──
  "symptom", "symptoms", "fever", "cough", "colds", "headache", "diarrhea",
  "vomiting", "nausea", "rash", "fatigue", "insomnia", "dizziness", "swelling",
  // ── English — general health words ──
  "disease", "illness", "syndrome", "chronic", "obesity", "overweight",
  "malnutrition", "health", "healthy", "healthcare", "unhealthy", "medical",
  "patient", "caregiver", "wellness",
  // ── English — treatments, medicine & procedures ──
  "medicine", "medication", "drug", "antibiotic", "antibiotics", "antiviral",
  "vaccine", "vaccinated", "vaccination", "booster", "immunization", "supplement",
  "supplements", "vitamin", "vitamins", "herbal", "remedy", "remedies", "cure",
  "treatment", "therapy", "surgery", "operation", "prescription", "painkiller",
  "pain reliever", "paracetamol", "ibuprofen", "aspirin", "insulin",
  "antihistamine", "chemotherapy", "chemo", "dialysis", "detox", "dosage",
  "capsule", "tablet", "ointment",
  // ── English — nutrition, wellness & mental health ──
  "diet", "nutrition", "nutrient", "calories", "protein", "immune system",
  "immunity", "immune", "weight loss", "fat loss", "metabolism", "blood pressure",
  "blood sugar", "glucose", "mental health", "depression", "anxiety",
  // ── English — actors & institutions ──
  "doctor", "doctors", "physician", "nurse", "hospital", "clinic", "pharmacy",
  // ── English — reproductive & maternal ──
  "pregnant", "pregnancy", "breastfeeding", "contraceptive", "fertility",
  "menstruation", "miscarriage",
  // ── English — misinfo-adjacent health topics ──
  "coronavirus", "covid", "immune booster", "natural remedy", "home remedy",
  "miracle cure",

  // ── Filipino/Tagalog — general health ──
  "kalusugan", "sakit", "masakit", "karamdaman", "nagkasakit", "may sakit",
  "kagalingan", "nutrisyon", "ehersisyo", "diyeta", "resistensya",
  "kalusugang pangkaisipan",
  // ── Filipino — diseases & conditions ──
  "kanser", "diyabetes", "dyabetis", "altapresyon", "alta presyon", "istroke",
  "sakit sa puso", "tuberkulosis", "pulmonya", "tigdas", "hika", "pasma",
  "katabaan", "obesidad",
  // ── Filipino — symptoms ──
  "sintomas", "lagnat", "ubo", "sipon", "trangkaso", "pagtatae", "pagsusuka",
  "pagduduwal", "pantal", "pamamaga", "pagkahilo", "hirap sa paghinga",
  "pananakit", "kati",
  // ── Filipino — treatments, medicine & care ──
  "gamot", "lunas", "bakuna", "pagbabakuna", "bitamina", "antibayotiko",
  "halamang gamot", "pampagaling", "nakakagamot", "pampapayat", "paggamot",
  "operasyon", "reseta", "konsulta", "botika", "laboratoryo",
  // ── Filipino — actors & institutions ──
  "doktor", "duktor", "manggagamot", "ospital", "klinika", "nars", "pasyente",
  // ── Filipino — reproductive & maternal ──
  "buntis", "regla",
  // ── Taglish / colloquial ──
  "checkup", "check up", "confined", "swab", "antigen",
];

// Case-sensitive acronyms (must appear uppercase to match). Their lowercase
// forms are ordinary English/Tagalog words, so matching them case-insensitively
// would flag unrelated posts.
export const HEALTH_ACRONYMS: string[] = [
  "WHO", "DOH", "FDA", "CDC", "HIV", "AIDS", "TB", "PCR", "UTI", "STD", "STI",
];
