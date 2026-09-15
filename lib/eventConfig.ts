/**
 * CODE MEETS AI + A LITTLE BIT OF CHAOS 💀
 * Centralized Event Configuration
 */

export const EVENT_CONFIG = {
  name: 'CODE MEETS AI',
  tagline: '+ A LITTLE BIT OF CHAOS 💀',
  fullTitle: 'CODE MEETS AI + A LITTLE BIT OF CHAOS 💀',
  date: '17 September 2026',
  dateShort: '17 SEPT 2026',
  time: '09:00 AM IST',
  timezone: 'Asia/Kolkata',
  venue: 'GLOBAL INSTITUTE OF ENGINEERING AND TECHNOLOGY',
  websiteUrl: 'https://code-meets-ai.vercel.app/',
  logoUrl: '/logo.jpeg',
  posterUrl: '/poster.jpg',

  // Target timestamp: 17 September 2026 09:00 AM IST (03:30 AM UTC)
  // Expressed cleanly via Date.UTC(year, monthIndex, day, hours, minutes, seconds)
  targetTimestamp: Date.UTC(2026, 8, 17, 3, 30, 0),

  // Kept for any legacy callers — delegates to generateLinkedInCaption
  linkedInCaption: (name: string) => generateLinkedInCaption({ full_name: name }),

  // Social card canonical resolution — matches iam_iam_attending_card_updated.png (853x1280)
  socialCard: {
    width: 853,
    height: 1280,
    aspectRatio: '853 / 1280',
  },
};

/**
 * Canonical LinkedIn caption generator.
 * Single source of truth — used by both "COPY CAPTION" and "POST ON LINKEDIN".
 *
 * NEVER includes: phone, backup code, QR token, registration ID, or any private field.
 * Safe for public sharing.
 */
export function generateLinkedInCaption(participant: {
  full_name?: string;
  branch?: string;
  year?: string;
}): string {
  const { branch, year } = participant;

  // Build the personalized student-context sentence only when both values are real strings
  const hasBranch = branch && branch.trim().length > 0;
  const hasYear   = year   && year.trim().length   > 0;

  let studentLine = '';
  if (hasBranch && hasYear) {
    studentLine = `As a ${branch} student in my ${year}, I'm looking forward to a day built around coding, AI, problem-solving, and a healthy amount of competition.\n\n`;
  } else if (hasBranch) {
    studentLine = `As a ${branch} student, I'm looking forward to a day built around coding, AI, problem-solving, and a healthy amount of competition.\n\n`;
  } else if (hasYear) {
    studentLine = `In my ${year}, I'm looking forward to a day built around coding, AI, problem-solving, and a healthy amount of competition.\n\n`;
  }

  return `I'm attending CODE MEETS AI — A LITTLE BIT OF CHAOS 💀

${studentLine}What I'm most looking forward to is getting out of the usual classroom environment and actually putting what I know to the test — solving problems, experimenting with ideas, learning from others, and seeing how different people approach the same challenge.

Events like this are a great opportunity to learn by doing, meet other students who are equally interested in technology, and push myself a little further.

📅 17 September 2026
⏰ 9:00 AM
📍 Global Institute of Engineering and Technology

Looking forward to the challenges, the learning, the competition, and of course, a little bit of chaos. 💀

See you at CODE MEETS AI.

#CodeMeetsAI #AI #ArtificialIntelligence #Coding #ComputerScience #TechEvent #StudentDevelopers #EngineeringStudents #Technology #Innovation`;
}

/**
 * Mask phone number for public display.
 * Displays first 2 digits followed by masking (e.g. 98••••••••).
 * Never exposes the remaining 8 digits publicly.
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone || typeof phone !== 'string') return '98••••••••';
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 2) return '98••••••••';
  const firstTwo = clean.slice(0, 2);
  const remainingCount = Math.max(8, clean.length - 2);
  return `${firstTwo}${'•'.repeat(remainingCount)}`;
}
