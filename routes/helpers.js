export function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  );
}

export function requireFields(body, fields) {
  return fields.filter((field) => {
    const value = body?.[field];
    return value === undefined || value === null || value === '';
  });
}

export function sendSupabaseError(res, error, fallbackStatus = 400) {
  return res.status(fallbackStatus).json({
    error: error.message,
    details: error.details ?? undefined,
    code: error.code ?? undefined
  });
}
