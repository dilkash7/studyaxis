/**
 * OCR Text Normalizer — The MOST CRITICAL piece
 * Cleans garbage OCR output into structured, usable text
 */

// ===== 4. OCR TEXT CLEANING =====

/** Remove garbage symbols, invisible chars, fix spacing */
export function cleanRawText(raw: string): string {
  let t = raw;
  // Remove invisible / zero-width characters
  t = t.replace(/[\u200B\u200C\u200D\uFEFF\u00AD]/g, '');
  // Remove control characters except newline/tab
  t = t.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  // Normalize various dash types to standard hyphen
  t = t.replace(/[–—―‐‑⁃]/g, '-');
  // Normalize quotes
  t = t.replace(/[""'']/g, '"').replace(/['']/g, "'");
  // Remove duplicate spaces
  t = t.replace(/[ \t]+/g, ' ');
  // Merge broken lines (single newline within a word)
  t = t.replace(/(\w)\n(\w)/g, '$1 $2');
  // Remove duplicate blank lines
  t = t.replace(/\n{3,}/g, '\n\n');
  // Standardize common OCR punctuation errors
  t = t.replace(/\s*[,]\s*/g, ', ');
  t = t.replace(/\s*[:]\s*/g, ': ');
  // Trim each line
  t = t.split('\n').map(l => l.trim()).join('\n');
  return t.trim();
}

// ===== 5. OCR ERROR CORRECTION DICTIONARY =====

/** Common OCR character misreads */
const OCR_CHAR_FIXES: [RegExp, string][] = [
  // Number/letter confusion
  [/\b8\.E\b/gi, 'B.E'],
  [/\b8\.Tech\b/gi, 'B.Tech'],
  [/\b8Tech\b/gi, 'BTech'],
  [/\bM\.8\b/gi, 'M.B'],
  [/\bM8BS\b/gi, 'MBBS'],
  [/\bM88S\b/gi, 'MBBS'],
  [/\bM\.8\.8\.S\b/gi, 'M.B.B.S'],
  [/\bC5E\b/gi, 'CSE'],
  [/\bC5€\b/gi, 'CSE'],
  [/\bCSc\b/g, 'CSE'],
  [/\bECc\b/gi, 'ECE'],
  [/\bE[C|c]E\b/g, 'ECE'],
  // AI/ML confusion (l→I, 1→I, 0→O)
  [/\bAl\b/g, 'AI'],            // lowercase L → I
  [/\bA1\b/g, 'AI'],            // one → I
  [/\bM1\b/g, 'ML'],            // one → L
  [/\bMl\b/g, 'ML'],            // lowercase l → L
  [/\bAI\s*&\s*Ml\b/gi, 'AI & ML'],
  [/\bAl\s*&\s*M[l1]\b/gi, 'AI & ML'],
  [/\bAIML\b/gi, 'AI & ML'],
  // Common degree fixes
  [/\b8\.Com\b/gi, 'B.Com'],
  [/\b8\.Sc\b/gi, 'B.Sc'],
  [/\b8\.A\b/gi, 'B.A'],
  [/\b8\.8\.A\b/gi, 'B.B.A'],
  [/\b8CA\b/gi, 'BCA'],
  [/\b88A\b/gi, 'BBA'],
  [/\b8DS\b/gi, 'BDS'],
  [/\b8HMS\b/gi, 'BHMS'],
  [/\b8AMS\b/gi, 'BAMS'],
  [/\b8PT\b/gi, 'BPT'],
  [/\bPGDM\b/gi, 'PGDM'],
  [/\bM8A\b/gi, 'MBA'],
  [/\bMCA\b/gi, 'MCA'],
  // Common word fixes
  [/\bEngg\b/gi, 'Engineering'],
  [/\bEngineenng\b/gi, 'Engineering'],
  [/\bEngineering\b/gi, 'Engineering'],
  [/\bComputar\b/gi, 'Computer'],
  [/\bComputer\b/gi, 'Computer'],
  [/\bScience\b/gi, 'Science'],
  [/\bMechanical\b/gi, 'Mechanical'],
  [/\bElectrical\b/gi, 'Electrical'],
  [/\bElectronics\b/gi, 'Electronics'],
  [/\bCommunication\b/gi, 'Communication'],
  [/\bInformation\b/gi, 'Information'],
  [/\bTechnology\b/gi, 'Technology'],
  [/\bManagement\b/gi, 'Management'],
  [/\bPharmacy\b/gi, 'Pharmacy'],
  [/\bNursing\b/gi, 'Nursing'],
  [/\bMedicine\b/gi, 'Medicine'],
  // Currency symbols
  [/\bRs\.?\s*/gi, '₹'],
  [/\bINR\s*/gi, '₹'],
  [/\bRupees\s*/gi, '₹'],
];

/** Apply OCR error corrections */
export function correctOCRErrors(text: string): string {
  let fixed = text;
  for (const [pattern, replacement] of OCR_CHAR_FIXES) {
    fixed = fixed.replace(pattern, replacement);
  }
  return fixed;
}

// ===== 6. COURSE ALIAS ENGINE =====

/** Canonical course name mappings */
const COURSE_ALIASES: Record<string, string[]> = {
  'BTech': ['B.Tech', 'B Tech', 'B.E', 'B.E.', 'BE', 'Bachelor of Technology', 'Bachelor of Engineering'],
  'MTech': ['M.Tech', 'M Tech', 'M.E', 'M.E.', 'ME', 'Master of Technology', 'Master of Engineering'],
  'MBBS': ['M.B.B.S', 'M.B.B.S.', 'Bachelor of Medicine'],
  'BDS': ['B.D.S', 'B.D.S.', 'Bachelor of Dental Surgery'],
  'MBA': ['M.B.A', 'M.B.A.', 'Master of Business Administration'],
  'BBA': ['B.B.A', 'B.B.A.', 'Bachelor of Business Administration'],
  'BCA': ['B.C.A', 'B.C.A.', 'Bachelor of Computer Applications'],
  'MCA': ['M.C.A', 'M.C.A.', 'Master of Computer Applications'],
  'BCom': ['B.Com', 'B Com', 'B.Commerce', 'Bachelor of Commerce'],
  'MCom': ['M.Com', 'M Com', 'Master of Commerce'],
  'BSc': ['B.Sc', 'B Sc', 'B.Science', 'Bachelor of Science'],
  'MSc': ['M.Sc', 'M Sc', 'Master of Science'],
  'BA': ['B.A', 'B A', 'Bachelor of Arts'],
  'MA': ['M.A', 'M A', 'Master of Arts'],
  'LLB': ['L.L.B', 'LL.B', 'Bachelor of Law'],
  'LLM': ['L.L.M', 'LL.M', 'Master of Law'],
  'BPharm': ['B.Pharm', 'B Pharm', 'Bachelor of Pharmacy'],
  'MPharm': ['M.Pharm', 'M Pharm', 'Master of Pharmacy'],
  'DPharm': ['D.Pharm', 'D Pharm', 'Diploma in Pharmacy'],
  'PharmD': ['Pharm.D', 'Doctor of Pharmacy'],
  'BEd': ['B.Ed', 'B Ed', 'Bachelor of Education'],
  'MEd': ['M.Ed', 'M Ed', 'Master of Education'],
  'BAMS': ['B.A.M.S', 'Bachelor of Ayurvedic Medicine'],
  'BHMS': ['B.H.M.S', 'Bachelor of Homeopathic Medicine'],
  'BPT': ['B.P.T', 'Bachelor of Physiotherapy'],
  'GNM': ['General Nursing & Midwifery'],
  'ANM': ['Auxiliary Nursing & Midwifery'],
  'PGDM': ['P.G.D.M', 'Post Graduate Diploma in Management'],
  'Diploma': ['Dip.', 'Dip'],
};

const SPECIALIZATION_ALIASES: Record<string, string[]> = {
  'CSE': ['Computer Science & Engineering', 'Computer Science Engineering', 'Computer Science', 'CS', 'Comp Sci'],
  'AI & ML': ['Artificial Intelligence & Machine Learning', 'AIML', 'AI/ML', 'AI and ML', 'Artificial Intelligence and Machine Learning'],
  'ECE': ['Electronics & Communication Engineering', 'Electronics & Communication', 'Electronics Communication'],
  'EEE': ['Electrical & Electronics Engineering', 'Electrical & Electronics', 'Electrical Electronics'],
  'ME': ['Mechanical Engineering', 'Mechanical'],
  'CE': ['Civil Engineering', 'Civil'],
  'IT': ['Information Technology', 'Information Tech'],
  'Data Science': ['DS', 'Data Sci'],
  'Cyber Security': ['Cybersecurity', 'Cyber Sec'],
  'IoT': ['Internet of Things'],
  'Robotics': ['Robotics & Automation', 'Robotics Engineering'],
};

/** Normalize a course name to its canonical form */
export function normalizeCourse(raw: string): string {
  let name = raw.trim();
  // First apply OCR error corrections
  name = correctOCRErrors(name);

  // Try to match degree alias
  for (const [canonical, aliases] of Object.entries(COURSE_ALIASES)) {
    for (const alias of aliases) {
      const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (regex.test(name)) {
        name = name.replace(regex, canonical);
        break;
      }
    }
  }

  // Try to match specialization alias
  for (const [canonical, aliases] of Object.entries(SPECIALIZATION_ALIASES)) {
    for (const alias of aliases) {
      const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (regex.test(name)) {
        name = name.replace(regex, canonical);
        break;
      }
    }
  }

  return name.replace(/\s+/g, ' ').trim();
}

/** Normalize a fee string to a clean number */
export function normalizeFee(raw: string): { amount: number; display: string } {
  let cleaned = raw.replace(/[₹,\s]/g, '').replace(/Rs\.?/gi, '').replace(/INR/gi, '').trim();
  // Handle lakh notation
  if (/(\d+(?:\.\d+)?)\s*(?:L|Lakh|Lakhs)/i.test(cleaned)) {
    const m = cleaned.match(/(\d+(?:\.\d+)?)\s*(?:L|Lakh|Lakhs)/i);
    const num = parseFloat(m![1]) * 100000;
    return { amount: num, display: `₹${num.toLocaleString('en-IN')}` };
  }
  // Handle crore notation
  if (/(\d+(?:\.\d+)?)\s*(?:Cr|Crore)/i.test(cleaned)) {
    const m = cleaned.match(/(\d+(?:\.\d+)?)\s*(?:Cr|Crore)/i);
    const num = parseFloat(m![1]) * 10000000;
    return { amount: num, display: `₹${num.toLocaleString('en-IN')}` };
  }
  // Handle K notation
  if (/(\d+(?:\.\d+)?)\s*K/i.test(cleaned)) {
    const m = cleaned.match(/(\d+(?:\.\d+)?)\s*K/i);
    const num = parseFloat(m![1]) * 1000;
    return { amount: num, display: `₹${num.toLocaleString('en-IN')}` };
  }
  // Indian number format: 2,45,000
  const num = parseFloat(cleaned.replace(/,/g, ''));
  return { amount: isNaN(num) ? 0 : num, display: isNaN(num) ? raw : `₹${num.toLocaleString('en-IN')}` };
}

// ===== FULL NORMALIZE PIPELINE =====

/** Full normalization pipeline: clean → correct → normalize */
export function normalizeOCRText(raw: string): string {
  let text = cleanRawText(raw);
  text = correctOCRErrors(text);
  return text;
}
