// Wraps useSeoMeta: titles get the name as a suffix (or are just the name when
// omitted) and ogImage is a path on the site domain, e.g. "/social-card.jpg".
export function useSiteSeoMeta({
  title,
  ogTitle,
  ogImage,
  ...rest
}: {
  title?: MaybeRefOrGetter<string>;
  ogTitle?: string;
  description?: string;
  ogDescription?: string;
  ogImage?: string;
}) {
  const fullName = useFullName();
  const { siteDomain } = useAppConfig();
  const withSuffix = (pageTitle?: string) =>
    pageTitle ? `${pageTitle} - ${fullName}` : fullName;

  useSeoMeta({
    ...rest,
    title: () => withSuffix(toValue(title)),
    ogTitle: withSuffix(ogTitle),
    ...(ogImage && { ogImage: `https://${siteDomain}${ogImage}` }),
  });
}
