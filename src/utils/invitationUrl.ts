export const INVITATION_BASE_URL =
  'https://modowedding.moserver.cfd/invite' as const;

export function buildInvitationUrl(guestName?: string | null): string {
  const normalizedName = guestName?.trim();

  if (!normalizedName) {
    return INVITATION_BASE_URL;
  }

  return `${INVITATION_BASE_URL}#guest=${encodeURIComponent(normalizedName)}`;
}
