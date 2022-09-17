export const isValidParam = (id: string) => /^\d+$/.test(id);

export const responseIs404 = (error: string | null) =>
  error === null ? false : error.startsWith("[404 Not Found]");
