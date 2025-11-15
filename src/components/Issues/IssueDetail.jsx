import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import CommentThread from "../Comments/CommentThread.jsx";

export default function IssueDetail() {
  const { id } = useParams();

  const issue = {
    title: "Sample Issue",
    description: "This is a mock issue description.",
    status: "open",
    priority: "high",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold text-text">
        Issue #{id}: {issue.title}
      </h1>

      <p className="text-text">{issue.description}</p>

      <div className="flex gap-4 text-sm text-gray-600">
        <span>Status: {issue.status}</span>
        <span>Priority: {issue.priority}</span>
      </div>

      <CommentThread issueId={id} />
    </motion.div>
  );
}
