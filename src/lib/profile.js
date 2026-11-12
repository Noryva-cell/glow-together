const NUMERIC_FIELDS = ['age', 'height_cm', 'weight_kg', 'target_weight_kg', 'monthly_budget', 'free_minutes_per_day', 'tidy_minutes'];

export function cleanProfile(form) {
  const { id, created_by_id, created_by, created_date, updated_date, ...fields } = form;
  NUMERIC_FIELDS.forEach((key) => {
    const value = fields[key];
    if (value === '' || value === null || value === undefined || Number.isNaN(Number(value))) {
      delete fields[key];
    } else {
      fields[key] = Number(value);
    }
  });
  return fields;
}