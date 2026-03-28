export function addYears(
  date: Date,
  years: number
) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}
