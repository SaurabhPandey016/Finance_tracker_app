export const todayDateOnly = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateOnly = (value: string, pattern: "dd MMM yyyy" | "yyyy-MM-dd" = "dd MMM yyyy"): string => {
  const dateOnly = value.slice(0, 10);
  const [year, month, day] = dateOnly.split("-").map(Number);
  if (!year || !month || !day) return dateOnly;
  if (pattern === "yyyy-MM-dd") return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${String(day).padStart(2, "0")} ${names[month - 1]} ${year}`;
};
