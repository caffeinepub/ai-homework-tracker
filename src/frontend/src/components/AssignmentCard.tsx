import type { Assignment } from "@/backend";
import { Priority, Status } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAIStudyTips } from "@/hooks/useQueries";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface Props {
  assignment: Assignment;
  index: number;
  onEdit: (a: Assignment) => void;
  onDelete: (id: bigint) => void;
  onMarkComplete: (id: bigint) => void;
  isDeleting: boolean;
  isMarkingComplete: boolean;
}

function formatDate(time: bigint): string {
  const ms = Number(time) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(time: bigint, status: Status): boolean {
  if (status === Status.completed) return false;
  return Number(time) / 1_000_000 < Date.now();
}

const priorityStyles: Record<
  Priority,
  { label: string; className: string; dot: string }
> = {
  [Priority.high]: {
    label: "High",
    className:
      "bg-[oklch(var(--priority-high-bg))] text-[oklch(var(--priority-high))] border-[oklch(var(--priority-high)/0.3)]",
    dot: "bg-[oklch(var(--priority-high))]",
  },
  [Priority.medium]: {
    label: "Medium",
    className:
      "bg-[oklch(var(--priority-medium-bg))] text-[oklch(var(--priority-medium))] border-[oklch(var(--priority-medium)/0.3)]",
    dot: "bg-[oklch(var(--priority-medium))]",
  },
  [Priority.low]: {
    label: "Low",
    className:
      "bg-[oklch(var(--priority-low-bg))] text-[oklch(var(--priority-low))] border-[oklch(var(--priority-low)/0.3)]",
    dot: "bg-[oklch(var(--priority-low))]",
  },
};

const statusStyles: Record<Status, string> = {
  [Status.pending]: "bg-muted text-muted-foreground",
  [Status.inProgress]: "bg-primary/10 text-primary",
  [Status.completed]:
    "bg-[oklch(var(--priority-low-bg))] text-[oklch(var(--priority-low))]",
};

const statusLabels: Record<Status, string> = {
  [Status.pending]: "Pending",
  [Status.inProgress]: "In Progress",
  [Status.completed]: "Completed",
};

export default function AssignmentCard({
  assignment,
  index,
  onEdit,
  onDelete,
  onMarkComplete,
  isDeleting,
  isMarkingComplete,
}: Props) {
  const [showTips, setShowTips] = useState(false);
  const [fetchTips, setFetchTips] = useState(false);

  const { data: tips, isLoading: tipsLoading } = useAIStudyTips(
    fetchTips ? assignment.id : null,
  );

  const overdue = isOverdue(assignment.dueDate, assignment.status);
  const completed = assignment.status === Status.completed;
  const p = priorityStyles[assignment.priority];

  const handleTipsClick = () => {
    if (!fetchTips) setFetchTips(true);
    setShowTips((prev) => !prev);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      data-ocid={`assignment.item.${index + 1}`}
    >
      <Card
        className={`shadow-card transition-shadow hover:shadow-card-hover ${
          overdue
            ? "border-[oklch(var(--overdue-border))] bg-[oklch(var(--overdue-bg))]"
            : ""
        } ${completed ? "opacity-70" : ""}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Priority dot */}
            <div
              className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${p.dot}`}
            />

            <div className="min-w-0 flex-1">
              {/* Title row */}
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className={`font-heading text-base font-semibold leading-snug ${
                    completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {assignment.title}
                </h3>
                {overdue && (
                  <span className="flex items-center gap-1 text-xs font-medium text-[oklch(var(--priority-high))]">
                    <AlertTriangle className="h-3 w-3" />
                    Overdue
                  </span>
                )}
              </div>

              {/* Meta row */}
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="outline" className="text-xs font-medium">
                  {assignment.subject}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs font-medium border ${p.className}`}
                >
                  {p.label}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs ${statusStyles[assignment.status]}`}
                >
                  {statusLabels[assignment.status]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Due {formatDate(assignment.dueDate)}
                </span>
              </div>

              {assignment.notes && (
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                  {assignment.notes}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-shrink-0 items-center gap-1">
              {!completed && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-[oklch(var(--priority-low))] hover:bg-[oklch(var(--priority-low-bg))]"
                  onClick={() => onMarkComplete(assignment.id)}
                  disabled={isMarkingComplete}
                  title="Mark complete"
                  data-ocid={`assignment.toggle.${index + 1}`}
                >
                  {isMarkingComplete ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={handleTipsClick}
                title="AI Study Tips"
                data-ocid={`assignment.button.${index + 1}`}
              >
                {showTips ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4 text-primary" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => onEdit(assignment)}
                title="Edit"
                data-ocid={`assignment.edit_button.${index + 1}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(assignment.id)}
                disabled={isDeleting}
                title="Delete"
                data-ocid={`assignment.delete_button.${index + 1}`}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* AI Tips panel */}
          <AnimatePresence>
            {showTips && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 rounded-md bg-primary/5 border border-primary/20 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary">
                      AI Study Tips
                    </span>
                  </div>
                  {tipsLoading ? (
                    <div
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                      data-ocid="assignment.loading_state"
                    >
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Generating personalized tips...
                    </div>
                  ) : (
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      {tips}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
