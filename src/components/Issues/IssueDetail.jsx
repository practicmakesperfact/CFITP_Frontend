
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import CommentThread from "../Comments/CommentThread.jsx";

const mockIssue = {
  id: 1,
  title: "Sample Issue",
  description: "This is a mock issue description.",
  status: "open",
  priority: "high",
};

export default function IssueDetail() {
  const { id } = useParams();
  // Mock fetch by ID
  const issue = mockIssue;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold text-text">
        Issue #{id}: {issue.title}
      </h1>
      <p className="text-text">{issue.description}</p>
      <div className="flex gap-4 text-sm">
        <span>Status: {issue.status}</span>
        <span>Priority: {issue.priority}</span>
      </div>
      <CommentThread issueId={id} />
    </motion.div>
  );
}
