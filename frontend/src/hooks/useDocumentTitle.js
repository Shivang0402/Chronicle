import { useEffect } from "react";

export default function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `Chronicle - ${title}` : "Chronicle";
    return () => {
      document.title = previous;
    };
  }, [title]);
}
