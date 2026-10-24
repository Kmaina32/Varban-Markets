'use client';

import { useMemo } from 'react';
import { useFirestore, useDoc } from '@/firebase';
import { DEFAULT_COMPANY, mergeCompany, type CompanyProfile } from './company';

/**
 * Live company profile (public Firestore doc `site_profile/company`).
 * Falls back to DEFAULT_COMPANY while loading, offline, or if rules block it,
 * so public pages always render sensible content.
 */
export function useCompanyProfile(): CompanyProfile {
  const db = useFirestore();
  const { data } = useDoc<any>(db, 'site_profile/company');
  return useMemo(() => (data ? mergeCompany(data) : DEFAULT_COMPANY), [data]);
}
