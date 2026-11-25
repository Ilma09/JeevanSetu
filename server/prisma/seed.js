import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const schemes = [
  {
    slug: 'ayushman-bharat-pm-jay',
    name: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (AB PM-JAY)',
    authority: 'National Health Authority, Government of India',
    category: 'Health insurance',
    summary: 'A publicly funded health assurance scheme providing cashless secondary and tertiary hospitalisation to eligible beneficiary families at empanelled hospitals.',
    benefits: 'Health cover up to ₹5 lakh per eligible family per year for covered hospitalisation at empanelled hospitals. Eligibility must be checked against the official beneficiary database.',
    eligibility: [
      'Eligibility is determined using the official PM-JAY beneficiary identification process and applicable government expansion rules.',
      'A general profile match in this app is not an official eligibility decision.',
      'Check beneficiary status through the official PM-JAY portal or helpline before relying on coverage.'
    ],
    documents: ['Government-approved identity document', 'Ration/family identity documents where applicable', 'Any documents requested by the empanelled hospital or beneficiary identification system'],
    officialUrl: 'https://beneficiary.nha.gov.in/',
    sourceUrl: 'https://nha.gov.in/',
    sourceName: 'National Health Authority',
    verifiedAt: new Date('2026-11-25T00:00:00.000Z'),
    isVerified: true
  },
  {
    slug: 'pradhan-mantri-suraksha-bima-yojana',
    name: 'Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
    authority: 'Department of Financial Services, Ministry of Finance',
    category: 'Accident insurance',
    summary: 'A one-year renewable personal accident insurance scheme for eligible bank or post-office account holders.',
    benefits: '₹2 lakh for accidental death or permanent total disability and ₹1 lakh for specified permanent partial disability. Official page states an annual premium of ₹20; confirm current premium at enrolment.',
    eligibility: [
      'Individual (single or joint) account holder of a participating bank or post office.',
      'Age 18 to 70 years.',
      'Consent to join and enable premium auto-debit from the designated account.',
      'Multiple accounts do not provide multiple enrolments.'
    ],
    documents: ['Participating bank or post-office account details', 'Enrolment consent and KYC as required by the participating institution'],
    officialUrl: 'https://www.financialservices.gov.in/pmsby',
    sourceUrl: 'https://www.financialservices.gov.in/pmsby',
    sourceName: 'Department of Financial Services',
    verifiedAt: new Date('2026-11-25T00:00:00.000Z'),
    isVerified: true
  },
  {
    slug: 'pradhan-mantri-matru-vandana-yojana',
    name: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
    authority: 'Ministry of Women and Child Development',
    category: 'Maternity benefit',
    summary: 'A maternity benefit scheme providing conditional cash assistance through Direct Benefit Transfer to eligible pregnant women and lactating mothers.',
    benefits: '₹5,000 for the first living child in two instalments; ₹6,000 for the second child if the second child is a girl, subject to scheme conditions and required health-service milestones.',
    eligibility: [
      'Pregnant women and lactating mothers meeting the scheme rules and belonging to an eligible disadvantaged category.',
      'Published eligible categories include SC/ST, BPL ration-card holders, persons with specified disability, PM-JAY beneficiaries, e-Shram card holders, MGNREGA job-card holders, eligible women farmers, NFSA ration-card holders, and women with net family income below ₹8 lakh per annum.',
      'Second-child benefit is applicable only when the second child is a girl and prescribed conditions are met.',
      'Government/PSU employees and those receiving similar maternity benefits are excluded as specified in scheme rules.'
    ],
    documents: ['Beneficiary Aadhaar details as required by the portal', 'Bank or post-office account details', 'Pregnancy and antenatal-care records', 'Birth registration and immunisation records where applicable', 'Proof of an eligible category'],
    officialUrl: 'https://pmmvy.wcd.gov.in/',
    sourceUrl: 'https://www.wcd.gov.in/public/women/pradhan-mantri-matru-vandana-yojna',
    sourceName: 'Ministry of Women and Child Development',
    verifiedAt: new Date('2026-11-25T00:00:00.000Z'),
    isVerified: true
  }
];

for (const scheme of schemes) {
  await prisma.scheme.upsert({
    where: { slug: scheme.slug },
    update: scheme,
    create: scheme
  });
}

console.log(`Seeded ${schemes.length} government schemes.`);
await prisma.$disconnect();
