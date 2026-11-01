export const dayKey = (value) => {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

export const formatEntryDate = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const formatLongDate = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

export const formatMonth = (value) =>
  new Date(value).toLocaleDateString("en-US", { month: "short" });

export const countWords = (content) => {
  const text = String(content || "").trim();
  return text ? text.split(/\s+/).length : 0;
};

export const readingTime = (words) => Math.max(1, Math.ceil(words / 200));

export const greetingForNow = () => {
  const hour = new Date().getHours();

  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export const todayLabel = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
