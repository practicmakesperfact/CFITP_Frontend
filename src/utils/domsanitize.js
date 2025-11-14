
import DOMPurify from "dompurify";

export const sanitizeHTML = (html) => {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
};
