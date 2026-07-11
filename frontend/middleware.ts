import { createProxy } from 'next-i18next/proxy';
import i18nConfig from './i18n.config';

export default createProxy(i18nConfig);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
