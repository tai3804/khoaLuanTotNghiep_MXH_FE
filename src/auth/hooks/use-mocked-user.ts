

import { useAuthContext } from './use-auth-context';



export function useMockedUser() {
  const { user } = useAuthContext();

  return {
    user: user
      ? {
        ...user,
        displayName: user.fullName || user.displayName || user.userName,
        email: user.email || '',
        photoURL: user.avatar || user.photoURL || '',
        role: user.role || 'admin',
      }
      : undefined,
  };
}
