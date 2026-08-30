/** Props required on every link that opens in a new tab. */
export const externalLinkProps = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

export function externalLinkPropsIf(isExternal: boolean) {
  return isExternal ? externalLinkProps : {};
}
