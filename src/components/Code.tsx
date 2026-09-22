import { codeToHtml } from 'shiki';
export default async function Code({
  code,
  lang,
  theme,
}: {
  code: string;
  lang: string;
  theme: string;
}) {
  const html = await codeToHtml(code, { lang, theme });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
