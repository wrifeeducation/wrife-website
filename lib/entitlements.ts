export type MembershipTier = 'free' | 'standard' | 'full' | 'school';

export interface Entitlements {
  tier: MembershipTier;
  allowedFileTypes: string[];
  canManageClasses: boolean;
  canAssignWork: boolean;
  canViewProgress: boolean;
  canAccessAllComponents: boolean;
}

const FREE_FILE_TYPES = [
  'teacher_guide',
  'presentation',
  'worksheet_core',
];

const STANDARD_FILE_TYPES = [
  ...FREE_FILE_TYPES,
  'worksheet_support',
  'worksheet_challenge',
  'progress_tracker',
  'assessment',
  'interactive_practice',
];

const FULL_FILE_TYPES = [...STANDARD_FILE_TYPES];

export function getEntitlements(
  membershipTier: string | null | undefined,
  schoolTier?: string | null
): Entitlements {
  const effectiveTier = resolveEffectiveTier(membershipTier, schoolTier);

  switch (effectiveTier) {
    case 'school':
    case 'full':
      return {
        tier: effectiveTier,
        allowedFileTypes: FULL_FILE_TYPES,
        canManageClasses: true,
        canAssignWork: true,
        canViewProgress: true,
        canAccessAllComponents: true,
      };

    case 'standard':
      return {
        tier: 'standard',
        allowedFileTypes: STANDARD_FILE_TYPES,
        canManageClasses: false,
        canAssignWork: false,
        canViewProgress: false,
        canAccessAllComponents: true,
      };

    case 'free':
    default:
      return {
        tier: 'free',
        allowedFileTypes: FREE_FILE_TYPES,
        canManageClasses: false,
        canAssignWork: false,
        canViewProgress: false,
        canAccessAllComponents: false,
      };
  }
}

function resolveEffectiveTier(
  membershipTier: string | null | undefined,
  schoolTier?: string | null
): MembershipTier {
  const tierPriority: Record<string, number> = {
    'free': 0,
    'trial': 0,
    'basic': 1,
    'standard': 1,
    'pro': 2,
    'full': 2,
    'enterprise': 3,
    'school': 3,
  };

  const personalTier = membershipTier || 'free';
  const orgTier = schoolTier || 'free';

  const personalPriority = tierPriority[personalTier] ?? 0;
  const schoolPriority = tierPriority[orgTier] ?? 0;

  if (schoolPriority >= 3) return 'school';
  if (personalPriority >= 2 || schoolPriority >= 2) return 'full';
  if (personalPriority >= 1 || schoolPriority >= 1) return 'standard';

  return 'free';
}

export function filterFilesByEntitlements<T extends { file_type: string }>(
  files: T[],
  entitlements: Entitlements
): T[] {
  return files.filter((file) => {
    const baseType = file.file_type.replace(/_core|_support|_challenge/g, '');
    return (
      entitlements.allowedFileTypes.includes(file.file_type) ||
      entitlements.allowedFileTypes.includes(baseType)
    );
  });
}

export function isFileTypeAllowed(
  fileType: string,
  entitlements: Entitlements
): boolean {
  const baseType = fileType.replace(/_core|_support|_challenge/g, '');
  return (
    entitlements.allowedFileTypes.includes(fileType) ||
    entitlements.allowedFileTypes.includes(baseType)
  );
}

export function getUpgradeMessage(tier: MembershipTier): string {
  switch (tier) {
    case 'free':
      return 'Upgrade to Standard to access all lesson materials, or Full to manage classes and track progress.';
    case 'standard':
      return 'Upgrade to Full Teacher to create classes, assign work, and monitor pupil progress.';
    default:
      return '';
  }
}

export const TIER_DISPLAY_NAMES: Record<MembershipTier, string> = {
  free: 'Free',
  standard: 'Standard Teacher',
  full: 'Full Teacher',
  school: 'School License',
};
