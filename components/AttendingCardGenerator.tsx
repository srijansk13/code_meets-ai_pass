'use client';

import React from 'react';
import CanonicalSocialCard from './social-card/CanonicalSocialCard';

interface Participant {
  full_name: string;
  roll_number: string;
  section: string;
  branch?: string;
  year: string;
  phone_number?: string;
}

interface AttendingCardGeneratorProps {
  participant: Participant;
  onToast?: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
}

export default function AttendingCardGenerator({ participant, onToast }: AttendingCardGeneratorProps) {
  return <CanonicalSocialCard participant={participant} onToast={onToast} />;
}
