/**
 * Utility functions for serializing MongoDB documents for client components
 */

/**
 * Serializes a tournament document for client components
 */
export function serializeTournament(tournament: any) {
  if (!tournament) return null;
  
  return {
    ...tournament,
    _id: tournament._id?.toString(),
    createdBy: tournament.createdBy?.toString() || null,
    createdAt: tournament.createdAt?.toISOString() || null,
    updatedAt: tournament.updatedAt?.toISOString() || null,
    registrationOpenAt: tournament.registrationOpenAt?.toISOString() || null,
    registrationCloseAt: tournament.registrationCloseAt?.toISOString() || null,
    startDate: tournament.startDate?.toISOString() || null,
    endDate: tournament.endDate?.toISOString() || null,
    archivedAt: tournament.archivedAt?.toISOString() || null,
  };
}

/**
 * Serializes a bracket document for client components
 */
export function serializeBracket(bracket: any) {
  return {
    ...bracket,
    _id: bracket._id?.toString(),
    createdAt: bracket.createdAt?.toISOString(),
    updatedAt: bracket.updatedAt?.toISOString(),
    matches: bracket.matches?.map((match: any) => ({
      ...match,
      _id: match._id?.toString(),
    })),
  };
}

/**
 * Serializes a registration document for client components
 */
export function serializeRegistration(registration: any) {
  return {
    ...registration,
    _id: registration._id?.toString(),
    tournamentId: registration.tournamentId?.toString(),
    userId: registration.userId?.toString() || null,
    createdAt: registration.createdAt?.toISOString(),
    updatedAt: registration.updatedAt?.toISOString(),
  };
}
