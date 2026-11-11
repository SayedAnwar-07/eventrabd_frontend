const SITE_NAME = "EventraBD";

const DEFAULT_DESCRIPTION =
  "Discover event services, professional sellers, and event planning solutions in Bangladesh.";

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  image,
  type = "website",
  noIndex = false,
}) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  return (
    <>
      <title>{pageTitle}</title>

      <meta name="description" content={description} />

      <meta
        name="robots"
        content={noIndex ? "noindex, follow" : "index, follow"}
      />

      {canonical && (
        <>
          <link rel="canonical" href={canonical} />
          <meta property="og:url" content={canonical} />
        </>
      )}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />

      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />

      <meta
        name="twitter:card"
        content={image ? "summary_large_image" : "summary"}
      />

      {image && <meta name="twitter:image" content={image} />}
    </>
  );
}
