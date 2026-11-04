export const isDatabaseUnavailableError = (error: unknown): boolean => {
  if (typeof error !== "object" || error === null) return false;

  const name = "name" in error ? String(error.name) : "";
  if ([
    "PrismaClientInitializationError",
    "PrismaClientRustPanicError",
  ].includes(name)) return true;

  const code = "code" in error ? String(error.code) : "";
  return ["P1001", "P1002", "P1008", "P1017", "P2024"].includes(code) &&
    name.includes("PrismaClient");
};
