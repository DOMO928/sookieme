// Stable IDs keep route identity independent of menu order and page depth.
export const forms = [
  { id: 0, key: 'home', label: 'Folded field' },
  { id: 1, key: 'renderer', label: 'Layered surfaces' },
  { id: 2, key: 'interactive', label: 'Open shell' },
  { id: 3, key: 'study', label: 'Repeated cells' },
  { id: 4, key: 'content', label: 'Nested shells' },
  { id: 5, key: 'game', label: 'Woven loop' },
  { id: 6, key: 'web', label: 'Spatial frames' },
  { id: 7, key: 'xr', label: 'Crossing orbits' },
  { id: 8, key: 'lab', label: 'Pleated fan' },
  { id: 9, key: 'about', label: 'Braided ribbons' },
] as const;
export const formId = Object.fromEntries(forms.map((form) => [form.key, form.id])) as Record<
  (typeof forms)[number]['key'],
  number
>;
export function validForm(value: number) {
  return Number.isInteger(value) && value >= 0 && value < forms.length ? value : 0;
}
