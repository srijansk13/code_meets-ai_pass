/**
 * CODE MEETS AI - Registration Validation Rules
 * Centralized client & server validation for participant fields.
 */

export type AcademicYear = '1st Year' | '2nd Year';

export const ALLOWED_BRANCHES = ['CSE', 'AIML', 'DS', 'CIVIL', 'MECH', 'ECE', 'EEE'] as const;
export type BranchType = (typeof ALLOWED_BRANCHES)[number];

export const ALLOWED_SECTIONS = ['A', 'B', 'C', 'D', 'E'] as const;
export type SectionType = (typeof ALLOWED_SECTIONS)[number];

export interface FieldErrors {
  full_name?: string;
  roll_number?: string;
  section?: string;
  branch?: string;
  year?: string;
  phone_number?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  fieldErrors: FieldErrors;
  derivedYear?: AcademicYear;
}

/**
 * Derives academic year from roll number prefix.
 * Rules:
 * - 25 -> 1st Year
 * - 26 -> 2nd Year
 * - Roll number must be exactly 10 characters
 * - Any other prefix -> invalid
 */
export function deriveYearFromRollNumber(rollNumber: string): {
  isValid: boolean;
  year?: AcademicYear;
  error?: string;
} {
  const trimmed = (rollNumber || '').trim();
  if (!trimmed) {
    return { isValid: false, error: 'Roll number is required' };
  }

  const prefix = trimmed.slice(0, 2);
  if (prefix !== '25' && prefix !== '26') {
    return {
      isValid: false,
      error: 'Roll number must start with 25 or 26',
    };
  }

  if (trimmed.length !== 10) {
    return {
      isValid: false,
      error: 'Roll number must be exactly 10 characters',
    };
  }

  // Validate remaining 8 characters are alphanumeric
  const rollRegex = /^(25|26)[A-Za-z0-9]{8}$/;
  if (!rollRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Roll number contains invalid characters',
    };
  }

  const year: AcademicYear = prefix === '25' ? '1st Year' : '2nd Year';
  return { isValid: true, year };
}

/**
 * Validates all required participant fields for client and server.
 */
export function validateParticipantData(data: {
  full_name?: string;
  roll_number?: string;
  section?: string;
  branch?: string;
  year?: string;
  phone_number?: string;
}): ValidationResult {
  const fieldErrors: FieldErrors = {};

  // 1. Full Name
  const name = (data.full_name || '').trim();
  if (!name) {
    fieldErrors.full_name = 'Name is required';
  }

  // 2. Roll Number & Academic Year derivation
  const roll = (data.roll_number || '').trim();
  let derivedYear: AcademicYear | undefined;

  if (!roll) {
    fieldErrors.roll_number = 'Roll number is required';
  } else {
    const rollResult = deriveYearFromRollNumber(roll);
    if (!rollResult.isValid) {
      fieldErrors.roll_number = rollResult.error || 'Roll number must be exactly 10 characters starting with 25 or 26';
    } else {
      derivedYear = rollResult.year;
    }
  }

  // 3. Branch
  const branch = (data.branch || '').trim().toUpperCase();
  if (!branch) {
    fieldErrors.branch = 'Please select your branch';
  } else if (!ALLOWED_BRANCHES.includes(branch as any)) {
    fieldErrors.branch = 'Please select a valid branch';
  }

  // 4. Section
  const section = (data.section || '').trim().toUpperCase();
  if (!section) {
    fieldErrors.section = 'Please select your section';
  } else if (!ALLOWED_SECTIONS.includes(section as any)) {
    fieldErrors.section = 'Please select a valid section';
  }

  // 5. Year synchronization
  const submittedYear = (data.year || '').trim();
  if (!submittedYear) {
    fieldErrors.year = 'Year is required';
  } else if (derivedYear && submittedYear !== derivedYear) {
    fieldErrors.year = 'Year does not match roll number';
  }

  // 6. Phone Number
  const phoneRaw = (data.phone_number || '').toString().trim();
  const cleanPhone = phoneRaw.replace(/\D/g, '');
  if (!phoneRaw) {
    fieldErrors.phone_number = 'Phone number is required';
  } else if (cleanPhone.length !== 10) {
    fieldErrors.phone_number = 'Please enter a valid 10-digit phone number';
  }

  // Determine first error message for top-level toast reporting
  const firstErrorKey = (['full_name', 'roll_number', 'branch', 'section', 'year', 'phone_number'] as const).find(
    (key) => !!fieldErrors[key]
  );
  const firstError = firstErrorKey ? fieldErrors[firstErrorKey] : undefined;

  return {
    isValid: Object.keys(fieldErrors).length === 0,
    error: firstError,
    fieldErrors,
    derivedYear,
  };
}
