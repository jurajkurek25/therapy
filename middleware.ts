import { withAuth } from 'next-auth/middleware';

export default withAuth({ pages: { signIn: '/prihlasenie' } });

export const config = {
  matcher: ['/dashboard', '/poukazky', '/dokup', '/ai', '/nastavenia'],
};
