/**
 * Auto-Classification Engine for Course Data
 * Detects mainCategory, courseType (UG/PG), degreeType, specialization, and entrance exam
 * from a course name string.
 */

interface ClassificationResult {
  mainCategory: string;
  courseType: string;
  degreeType: string;
  specialization: string;
  entranceExam: string;
  confidence: number;
}

// ── Master Course Mappings ──
const DEGREE_MAPPINGS: {
  keywords: string[];
  category: string;
  level: string;
  degree: string;
  entrance?: string;
}[] = [
  // Engineering
  { keywords: ['B.Tech', 'BTech', 'B Tech'], category: 'Engineering', level: 'UG', degree: 'B.Tech', entrance: 'JEE/KCET' },
  { keywords: ['B.E', 'BE '], category: 'Engineering', level: 'UG', degree: 'B.E', entrance: 'JEE/KCET' },
  { keywords: ['M.Tech', 'MTech', 'M Tech'], category: 'Engineering', level: 'PG', degree: 'M.Tech', entrance: 'GATE' },
  { keywords: ['M.E', 'ME '], category: 'Engineering', level: 'PG', degree: 'M.E', entrance: 'GATE' },
  { keywords: ['Polytechnic'], category: 'Engineering', level: 'Diploma', degree: 'Polytechnic' },

  // Medical
  { keywords: ['MBBS'], category: 'Medical', level: 'UG', degree: 'MBBS', entrance: 'NEET' },
  { keywords: ['BDS'], category: 'Medical', level: 'UG', degree: 'BDS', entrance: 'NEET' },
  { keywords: ['BAMS'], category: 'Medical', level: 'UG', degree: 'BAMS', entrance: 'NEET' },
  { keywords: ['BHMS'], category: 'Medical', level: 'UG', degree: 'BHMS', entrance: 'NEET' },
  { keywords: ['MD '], category: 'Medical', level: 'PG', degree: 'MD', entrance: 'NEET PG' },
  { keywords: ['MS '], category: 'Medical', level: 'PG', degree: 'MS', entrance: 'NEET PG' },

  // Management
  { keywords: ['BBA'], category: 'Management', level: 'UG', degree: 'BBA' },
  { keywords: ['BMS'], category: 'Management', level: 'UG', degree: 'BMS' },
  { keywords: ['MBA'], category: 'Management', level: 'PG', degree: 'MBA', entrance: 'CAT/MAT' },
  { keywords: ['PGDM'], category: 'Management', level: 'PG', degree: 'PGDM', entrance: 'CAT/MAT' },

  // Commerce
  { keywords: ['B.Com', 'BCom', 'B Com'], category: 'Commerce', level: 'UG', degree: 'B.Com' },
  { keywords: ['M.Com', 'MCom', 'M Com'], category: 'Commerce', level: 'PG', degree: 'M.Com' },
  { keywords: ['CA Foundation', 'CA Inter'], category: 'Commerce', level: 'Certificate', degree: 'CA' },

  // Computer Applications
  { keywords: ['BCA'], category: 'Computer Applications', level: 'UG', degree: 'BCA' },
  { keywords: ['MCA'], category: 'Computer Applications', level: 'PG', degree: 'MCA' },

  // Law
  { keywords: ['BA LLB', 'BA LL.B', 'BALLB'], category: 'Law', level: 'UG', degree: 'BA LLB', entrance: 'CLAT' },
  { keywords: ['BBA LLB', 'BBALLB'], category: 'Law', level: 'UG', degree: 'BBA LLB', entrance: 'CLAT' },
  { keywords: ['LLB', 'LL.B'], category: 'Law', level: 'UG', degree: 'LLB', entrance: 'CLAT' },
  { keywords: ['LLM', 'LL.M'], category: 'Law', level: 'PG', degree: 'LLM' },

  // Pharmacy
  { keywords: ['B.Pharm', 'BPharm', 'B Pharm'], category: 'Pharmacy', level: 'UG', degree: 'B.Pharm' },
  { keywords: ['D.Pharm', 'DPharm', 'D Pharm'], category: 'Pharmacy', level: 'Diploma', degree: 'D.Pharm' },
  { keywords: ['M.Pharm', 'MPharm', 'M Pharm'], category: 'Pharmacy', level: 'PG', degree: 'M.Pharm' },
  { keywords: ['Pharm.D', 'PharmD'], category: 'Pharmacy', level: 'UG', degree: 'Pharm.D' },

  // Nursing
  { keywords: ['BSc Nursing', 'B.Sc Nursing', 'B.Sc. Nursing'], category: 'Nursing', level: 'UG', degree: 'BSc Nursing', entrance: 'NEET' },
  { keywords: ['GNM'], category: 'Nursing', level: 'Diploma', degree: 'GNM' },
  { keywords: ['ANM'], category: 'Nursing', level: 'Diploma', degree: 'ANM' },
  { keywords: ['MSc Nursing', 'M.Sc Nursing'], category: 'Nursing', level: 'PG', degree: 'MSc Nursing' },

  // Allied Health
  { keywords: ['BPT', 'Physiotherapy'], category: 'Allied Health Sciences', level: 'UG', degree: 'BPT' },
  { keywords: ['BOT'], category: 'Allied Health Sciences', level: 'UG', degree: 'BOT' },
  { keywords: ['BSc MLT', 'BMLT', 'Medical Lab'], category: 'Allied Health Sciences', level: 'UG', degree: 'BSc MLT' },
  { keywords: ['BSc Radiology', 'Radiology'], category: 'Allied Health Sciences', level: 'UG', degree: 'BSc Radiology' },

  // Science
  { keywords: ['BSc', 'B.Sc', 'B Sc'], category: 'Science', level: 'UG', degree: 'BSc' },
  { keywords: ['MSc', 'M.Sc', 'M Sc'], category: 'Science', level: 'PG', degree: 'MSc' },

  // Arts
  { keywords: ['BA ', 'B.A '], category: 'Arts', level: 'UG', degree: 'BA' },
  { keywords: ['MA ', 'M.A '], category: 'Arts', level: 'PG', degree: 'MA' },

  // Design
  { keywords: ['B.Des', 'BDes', 'B Des'], category: 'Design', level: 'UG', degree: 'B.Des' },
  { keywords: ['M.Des', 'MDes', 'M Des'], category: 'Design', level: 'PG', degree: 'M.Des' },

  // Agriculture
  { keywords: ['BSc Agriculture', 'B.Sc Agriculture', 'BAg'], category: 'Agriculture', level: 'UG', degree: 'BSc Agriculture' },

  // Hotel Management
  { keywords: ['BHM', 'BHMCT', 'Hotel Management'], category: 'Hotel Management', level: 'UG', degree: 'BHM' },

  // Aviation
  { keywords: ['Aviation', 'Pilot', 'AME', 'Aircraft'], category: 'Aviation', level: 'UG', degree: 'Aviation' },

  // Paramedical
  { keywords: ['DMLT'], category: 'Paramedical', level: 'Diploma', degree: 'DMLT' },
  { keywords: ['BSc Cardiac', 'Cardiac Care'], category: 'Paramedical', level: 'UG', degree: 'BSc Cardiac Care' },
  { keywords: ['OT Technology', 'Operation Theatre'], category: 'Paramedical', level: 'UG', degree: 'BSc OT Technology' },

  // Education
  { keywords: ['B.Ed', 'BEd', 'B Ed'], category: 'Education', level: 'UG', degree: 'B.Ed' },
  { keywords: ['D.Ed', 'DEd'], category: 'Education', level: 'Diploma', degree: 'D.Ed' },
  { keywords: ['M.Ed', 'MEd'], category: 'Education', level: 'PG', degree: 'M.Ed' },

  // Diploma (generic)
  { keywords: ['Diploma'], category: 'Engineering', level: 'Diploma', degree: 'Diploma' },
];

// Specialization detection keywords
const SPECIALIZATION_KEYWORDS: { keywords: string[]; name: string }[] = [
  { keywords: ['Computer Science', 'CSE', 'CS '], name: 'Computer Science' },
  { keywords: ['AI & ML', 'AI/ML', 'Artificial Intelligence', 'Machine Learning'], name: 'AI & ML' },
  { keywords: ['Data Science', 'Data Analytics'], name: 'Data Science' },
  { keywords: ['Cyber Security', 'Cyber', 'Information Security'], name: 'Cyber Security' },
  { keywords: ['Mechanical'], name: 'Mechanical' },
  { keywords: ['Civil'], name: 'Civil' },
  { keywords: ['Electrical'], name: 'Electrical' },
  { keywords: ['Electronics', 'ECE', 'EEE', 'E&C'], name: 'Electronics' },
  { keywords: ['Information Technology', 'IT '], name: 'Information Technology' },
  { keywords: ['Robotics'], name: 'Robotics' },
  { keywords: ['Aerospace', 'Aeronautical'], name: 'Aerospace' },
  { keywords: ['Biomedical'], name: 'Biomedical' },
  { keywords: ['Chemical'], name: 'Chemical' },
  { keywords: ['Finance'], name: 'Finance' },
  { keywords: ['Marketing'], name: 'Marketing' },
  { keywords: ['Human Resource', 'HR'], name: 'HR' },
  { keywords: ['Operations'], name: 'Operations' },
  { keywords: ['Business Analytics'], name: 'Business Analytics' },
  { keywords: ['International Business'], name: 'International Business' },
  { keywords: ['Healthcare Management', 'Hospital Admin'], name: 'Healthcare Management' },
  { keywords: ['Accounting', 'Accounts'], name: 'Accounting' },
  { keywords: ['Banking', 'Insurance'], name: 'Banking & Insurance' },
  { keywords: ['Taxation', 'Tax'], name: 'Taxation' },
  { keywords: ['Constitutional Law'], name: 'Constitutional Law' },
  { keywords: ['Corporate Law'], name: 'Corporate Law' },
  { keywords: ['Criminal Law'], name: 'Criminal Law' },
  { keywords: ['Physics'], name: 'Physics' },
  { keywords: ['Chemistry'], name: 'Chemistry' },
  { keywords: ['Mathematics', 'Maths'], name: 'Mathematics' },
  { keywords: ['Biology'], name: 'Biology' },
  { keywords: ['Biotechnology', 'Biotech'], name: 'Biotechnology' },
  { keywords: ['Microbiology'], name: 'Microbiology' },
  { keywords: ['Psychology'], name: 'Psychology' },
  { keywords: ['Sociology'], name: 'Sociology' },
  { keywords: ['Economics'], name: 'Economics' },
  { keywords: ['Journalism', 'Media'], name: 'Journalism & Media' },
  { keywords: ['Fashion Design'], name: 'Fashion Design' },
  { keywords: ['Interior Design'], name: 'Interior Design' },
  { keywords: ['Graphic Design'], name: 'Graphic Design' },
  { keywords: ['UI/UX', 'UI UX'], name: 'UI/UX Design' },
  { keywords: ['Cloud Computing'], name: 'Cloud Computing' },
  { keywords: ['Full Stack', 'Web Development'], name: 'Full Stack Development' },
  { keywords: ['IoT', 'Internet of Things'], name: 'IoT' },
  { keywords: ['VLSI'], name: 'VLSI' },
  { keywords: ['Pediatrics'], name: 'Pediatrics' },
  { keywords: ['Dermatology'], name: 'Dermatology' },
  { keywords: ['Orthopedics'], name: 'Orthopedics' },
  { keywords: ['Gynecology', 'OBG'], name: 'Gynecology' },
  { keywords: ['Radiology'], name: 'Radiology' },
  { keywords: ['ENT'], name: 'ENT' },
  { keywords: ['Ophthalmology'], name: 'Ophthalmology' },
  { keywords: ['General Surgery'], name: 'General Surgery' },
  { keywords: ['General Medicine'], name: 'General Medicine' },
  { keywords: ['Horticulture'], name: 'Horticulture' },
  { keywords: ['Agronomy'], name: 'Agronomy' },
];

/**
 * Auto-classify a course name into structured fields.
 * Returns classification result with confidence score.
 */
export function classifyCourse(courseName: string): ClassificationResult {
  const input = ` ${courseName} `; // pad for word boundary matching
  const inputUpper = input.toUpperCase();

  let result: ClassificationResult = {
    mainCategory: '',
    courseType: '',
    degreeType: '',
    specialization: '',
    entranceExam: '',
    confidence: 0,
  };

  let matchedDegree = false;

  // 1. Match degree type (longest match first for accuracy)
  const sortedMappings = [...DEGREE_MAPPINGS].sort(
    (a, b) => Math.max(...b.keywords.map(k => k.length)) - Math.max(...a.keywords.map(k => k.length))
  );

  for (const mapping of sortedMappings) {
    for (const keyword of mapping.keywords) {
      if (input.includes(keyword) || inputUpper.includes(keyword.toUpperCase())) {
        result.mainCategory = mapping.category;
        result.courseType = mapping.level;
        result.degreeType = mapping.degree;
        result.entranceExam = mapping.entrance || '';
        result.confidence += 40;
        matchedDegree = true;
        break;
      }
    }
    if (matchedDegree) break;
  }

  // 2. Match specialization
  for (const spec of SPECIALIZATION_KEYWORDS) {
    for (const keyword of spec.keywords) {
      if (input.includes(keyword) || inputUpper.includes(keyword.toUpperCase())) {
        result.specialization = spec.name;
        result.confidence += 30;
        break;
      }
    }
    if (result.specialization) break;
  }

  // 3. Fallback category detection from generic keywords
  if (!result.mainCategory) {
    const categoryKeywords: Record<string, string[]> = {
      Engineering: ['Engineering', 'Technology', 'Technical'],
      Medical: ['Medical', 'Medicine', 'Surgery', 'Health'],
      Management: ['Management', 'Business', 'Admin'],
      Commerce: ['Commerce', 'Accounting', 'Finance'],
      Law: ['Law', 'Legal', 'Jurisprudence'],
      Nursing: ['Nursing', 'Midwifery'],
      Pharmacy: ['Pharma', 'Pharmacy'],
      Science: ['Science', 'Scientific'],
      Arts: ['Arts', 'Humanities', 'Liberal'],
      Design: ['Design', 'Creative'],
      Education: ['Education', 'Teaching', 'Pedagogy'],
    };

    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(k => inputUpper.includes(k.toUpperCase()))) {
        result.mainCategory = cat;
        result.confidence += 20;
        break;
      }
    }
  }

  // 4. Fallback level detection
  if (!result.courseType) {
    if (/\bUG\b|Undergraduate|Bachelor/i.test(courseName)) result.courseType = 'UG';
    else if (/\bPG\b|Postgraduate|Master/i.test(courseName)) result.courseType = 'PG';
    else if (/\bDiploma\b/i.test(courseName)) result.courseType = 'Diploma';
    else if (/\bPh\.?D|Doctorate\b/i.test(courseName)) result.courseType = 'Doctorate';
    else if (/\bCertificate\b/i.test(courseName)) result.courseType = 'Certificate';

    if (result.courseType) result.confidence += 10;
  }

  // Cap confidence at 100
  result.confidence = Math.min(result.confidence, 100);

  return result;
}

// ── Duration Detection ──
const DURATION_MAP: Record<string, string> = {
  'MBBS': '5.5 Years', 'BDS': '5 Years', 'BAMS': '5.5 Years', 'BHMS': '5.5 Years',
  'B.Tech': '4 Years', 'B.E': '4 Years', 'M.Tech': '2 Years', 'M.E': '2 Years',
  'MBA': '2 Years', 'PGDM': '2 Years', 'BBA': '3 Years', 'BCA': '3 Years', 'MCA': '2 Years',
  'B.Com': '3 Years', 'M.Com': '2 Years', 'BSc': '3 Years', 'MSc': '2 Years',
  'BA': '3 Years', 'MA': '2 Years', 'LLB': '3 Years', 'BA LLB': '5 Years', 'BBA LLB': '5 Years',
  'B.Pharm': '4 Years', 'D.Pharm': '2 Years', 'M.Pharm': '2 Years', 'Pharm.D': '6 Years',
  'BSc Nursing': '4 Years', 'GNM': '3 Years', 'ANM': '2 Years', 'MSc Nursing': '2 Years',
  'BPT': '4.5 Years', 'BOT': '4.5 Years', 'B.Ed': '2 Years', 'D.Ed': '2 Years',
  'B.Des': '4 Years', 'M.Des': '2 Years', 'BHM': '4 Years', 'MD': '3 Years', 'MS': '3 Years',
  'Polytechnic': '3 Years', 'Diploma': '3 Years', 'DMLT': '2 Years',
};

export function detectDuration(degreeType: string): string {
  return DURATION_MAP[degreeType] || '';
}

// ── Eligibility Detection ──
const ELIGIBILITY_MAP: Record<string, string> = {
  'UG': '10+2 / PUC passed',
  'PG': "Bachelor's degree in relevant field",
  'Diploma': '10th / SSLC passed',
  'Doctorate': "Master's degree in relevant field",
  'Certificate': '10+2 / PUC passed',
};

export function detectEligibility(courseType: string, category: string): string {
  const base = ELIGIBILITY_MAP[courseType] || '';
  if (category === 'Medical' && courseType === 'UG') return '10+2 with PCB, NEET qualified';
  if (category === 'Engineering' && courseType === 'UG') return '10+2 with PCM, JEE/KCET';
  if (category === 'Nursing' && courseType === 'UG') return '10+2 with PCB, NEET qualified';
  if (category === 'Law' && courseType === 'UG') return '10+2 passed, CLAT/MH-CET';
  return base;
}

// ── Slug + SEO Generator ──
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function generateSEO(collegeName: string, courseName?: string) {
  const base = collegeName;
  if (courseName) {
    return {
      slug: generateSlug(`${collegeName}-${courseName}`),
      metaTitle: `${courseName} at ${collegeName} - Fees, Admission, Placements | StudyAxis`,
      metaDescription: `Get complete details of ${courseName} at ${collegeName}. Check fees, eligibility, admission process, placements, and more on StudyAxis.`,
      keywords: `${courseName}, ${collegeName}, admission, fees, placements, eligibility`,
    };
  }
  return {
    slug: generateSlug(collegeName),
    metaTitle: `${collegeName} - Courses, Fees, Admission, Reviews | StudyAxis`,
    metaDescription: `Explore ${collegeName} - courses offered, fee structure, admission process, placements, reviews and more on StudyAxis.`,
    keywords: `${collegeName}, admission, fees, courses, placements, reviews`,
  };
}

// ── Full Classification with all fields ──
export function fullClassify(courseName: string) {
  const base = classifyCourse(courseName);
  const duration = detectDuration(base.degreeType);
  const eligibility = detectEligibility(base.courseType, base.mainCategory);
  return { ...base, duration, eligibility };
}
