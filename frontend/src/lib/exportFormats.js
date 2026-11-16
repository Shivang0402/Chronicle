export const EXPORT_FORMATS = [
  {
    id: "pdf",
    label: "Styled PDF",
    description: "A typeset keepsake ready to print",
    extension: "pdf",
  },
  {
    id: "pdf-print",
    label: "Print-friendly PDF",
    description: "Plain text and images with page numbers",
    extension: "pdf",
  },
  {
    id: "json",
    label: "JSON",
    description: "A structured data backup of your entries",
    extension: "json",
  },
];

export const getExportFormat = (id) =>
  EXPORT_FORMATS.find((format) => format.id === id) || EXPORT_FORMATS[0];

export const exportFileName = (id, date) => {
  const format = getExportFormat(id);
  const suffix = id === "pdf-print" ? "-print" : "";

  return `chronicles-${date}${suffix}.${format.extension}`;
};

export const exportNotice = (id) => `${getExportFormat(id).label} is ready.`;
