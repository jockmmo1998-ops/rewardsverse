import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getSeoPage, normalizeSeoPath, SEO_SITE_ORIGIN, SEO_SOCIAL_IMAGE } from '@shared/seo';

export function RouteSeo() {
  const { pathname } = useLocation();
  const path = normalizeSeoPath(pathname);
  const page = getSeoPage(path);
  const canonicalUrl = `${SEO_SITE_ORIGIN}${path}`;
  const socialImageUrl = `${SEO_SITE_ORIGIN}${SEO_SOCIAL_IMAGE}`;

  return (
    <Helmet>
      <title>{page.title}</title>
      <meta name="description" content={page.description} />
      <meta name="robots" content={page.indexable ? 'index,follow' : 'noindex,nofollow'} />
      {page.indexable && (
        <>
          <link rel="canonical" href={canonicalUrl} />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={page.title} />
          <meta property="og:description" content={page.description} />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:image" content={socialImageUrl} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={page.title} />
          <meta name="twitter:description" content={page.description} />
          <meta name="twitter:image" content={socialImageUrl} />
        </>
      )}
    </Helmet>
  );
}
