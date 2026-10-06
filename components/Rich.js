// Renders authored copy from lib/content.js that carries inline <em>/<code>/<br> markup.
export default function Rich({ as: Tag = "span", html, ...rest }) {
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: html }} />;
}
