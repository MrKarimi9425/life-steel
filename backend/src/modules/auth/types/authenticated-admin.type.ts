export type AuthenticatedAdmin = {
  adminId: string;
  sessionId: string;
  isOwner: boolean;
  mustChangePassword: boolean;
};
