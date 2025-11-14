
import { format, formatDistanceToNow } from "date-fns";

export const formatDate = (date) => format(new Date(date), "PPP");
export const timeAgo = (date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true });
export const currency = (amount) => `$${amount.toFixed(2)}`;
