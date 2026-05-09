import { createProxy } from 'next-i18next/proxy';
import config from './i18n.config';

export default createProxy(config);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
