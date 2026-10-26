/** False for content still marked "[fill in: …]", so the UI can hide it. */
export function isFilled(value: string | undefined): value is string {
  return Boolean(value) && !value!.startsWith("[fill in");
}
