/** Replace `{name}` placeholders in dashboard translation strings. */
export function dashTemplate(str, vars = {}) {
  if (!str) return str;
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
    str
  );
}
