import { Status } from "@/backend";
import type { Assignment } from "@/backend";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAllAssignments,
  useCreateAssignment,
  useDashboardStats,
  useDeleteAssignment,
  useInitSeedData,
  useMarkComplete,
  useUniqueSubjects,
  useUpdateAssignment,
} from "@/hooks/useQueries";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Plus,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AppDetailsQR from "./AppDetailsQR";
import AssignmentCard from "./AssignmentCard";
import AssignmentModal from "./AssignmentModal";
import SubscriptionSection from "./SubscriptionSection";

const SEED_KEY = "homework_tracker_seeded_v1";

const statusFilters: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: Status.pending },
  { label: "In Progress", value: Status.inProgress },
  { label: "Completed", value: Status.completed },
];

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  const { data: assignments = [], isLoading: assignmentsLoading } =
    useAllAssignments();
  const { data: stats } = useDashboardStats();
  const { data: subjects = [] } = useUniqueSubjects();
  const initSeed = useInitSeedData();
  const createAssignment = useCreateAssignment();
  const updateAssignment = useUpdateAssignment();
  const deleteAssignment = useDeleteAssignment();
  const markComplete = useMarkComplete();

  // Initialize seed data once on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once
  useEffect(() => {
    if (!localStorage.getItem(SEED_KEY)) {
      initSeed.mutate(undefined, {
        onSuccess: () => {
          localStorage.setItem(SEED_KEY, "1");
        },
      });
    }
  }, []);

  const filteredAssignments = assignments.filter((a) => {
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchSubject = subjectFilter === "all" || a.subject === subjectFilter;
    return matchStatus && matchSubject;
  });

  const handleOpenAdd = () => {
    setEditingAssignment(null);
    setModalOpen(true);
  };

  const handleEdit = (a: Assignment) => {
    setEditingAssignment(a);
    setModalOpen(true);
  };

  const handleDelete = (id: bigint) => {
    deleteAssignment.mutate(id, {
      onSuccess: () => toast.success("Assignment deleted"),
      onError: () => toast.error("Failed to delete"),
    });
  };

  const handleMarkComplete = (id: bigint) => {
    markComplete.mutate(id, {
      onSuccess: () => toast.success("Marked as complete! 🎉"),
      onError: () => toast.error("Failed to update"),
    });
  };

  const handleModalSubmit = async (data: {
    title: string;
    subject: string;
    dueDate: bigint;
    priority: import("@/backend").Priority;
    status: Status;
    notes: string | null;
  }) => {
    if (editingAssignment) {
      await updateAssignment.mutateAsync(
        { id: editingAssignment.id, ...data },
        {
          onSuccess: () => {
            toast.success("Assignment updated");
            setModalOpen(false);
          },
          onError: () => toast.error("Failed to update"),
        },
      );
    } else {
      await createAssignment.mutateAsync(data, {
        onSuccess: () => {
          toast.success("Assignment added! 📚");
          setModalOpen(false);
        },
        onError: () => toast.error("Failed to create"),
      });
    }
  };

  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold leading-none">
                StudyTrack
              </h1>
              <p className="text-xs text-muted-foreground">
                AI Homework Tracker
              </p>
            </div>
          </div>
          <Button
            onClick={handleOpenAdd}
            className="gap-1.5"
            data-ocid="assignment.open_modal_button"
          >
            <Plus className="h-4 w-4" />
            Add Assignment
          </Button>
        </div>
      </header>

      <main className="container mx-auto flex-1 py-8 px-4 md:px-8 max-w-4xl">
        {/* Stats row */}
        <section
          className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
          aria-label="Dashboard statistics"
        >
          {[
            {
              label: "Total",
              value: stats?.total,
              icon: BookOpen,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Completed",
              value: stats?.completed,
              icon: CheckCircle2,
              color: "text-[oklch(var(--priority-low))]",
              bg: "bg-[oklch(var(--priority-low-bg))]",
            },
            {
              label: "Pending",
              value: stats?.pending,
              icon: Clock,
              color: "text-[oklch(var(--priority-medium))]",
              bg: "bg-[oklch(var(--priority-medium-bg))]",
            },
            {
              label: "Overdue",
              value: stats?.overdue,
              icon: AlertTriangle,
              color: "text-[oklch(var(--priority-high))]",
              bg: "bg-[oklch(var(--priority-high-bg))]",
            },
          ].map(({ label, value, icon: Icon, color, bg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              data-ocid="stats.card"
            >
              <Card className="shadow-card">
                <CardContent className="flex items-center gap-3 p-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}
                  >
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div>
                    <div className="font-heading text-2xl font-bold leading-none">
                      {value === undefined ? (
                        <Skeleton className="h-7 w-10" />
                      ) : (
                        Number(value)
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {label}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>

        {/* Subscription section */}
        <SubscriptionSection />

        {/* Filter bar */}
        <section
          className="mb-5 flex flex-wrap items-center gap-3"
          aria-label="Filters"
        >
          <div className="flex gap-1.5 flex-wrap">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                data-ocid="assignment.tab"
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === f.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger
              className="h-8 w-auto min-w-[130px] text-xs"
              data-ocid="assignment.select"
            >
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        {/* Assignment list */}
        <section aria-label="Assignments">
          {assignmentsLoading ? (
            <div className="space-y-3" data-ocid="assignment.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredAssignments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 text-center"
              data-ocid="assignment.empty_state"
            >
              <BookOpen className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="font-medium text-muted-foreground">
                No assignments found
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                {statusFilter === "all" && subjectFilter === "all"
                  ? "Add your first assignment to get started"
                  : "Try adjusting your filters"}
              </p>
              {statusFilter === "all" && subjectFilter === "all" && (
                <Button
                  variant="outline"
                  onClick={handleOpenAdd}
                  className="mt-4 gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  Add Assignment
                </Button>
              )}
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-3">
                {filteredAssignments.map((a, i) => (
                  <AssignmentCard
                    key={a.id.toString()}
                    assignment={a}
                    index={i}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onMarkComplete={handleMarkComplete}
                    isDeleting={
                      deleteAssignment.isPending &&
                      deleteAssignment.variables === a.id
                    }
                    isMarkingComplete={
                      markComplete.isPending && markComplete.variables === a.id
                    }
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </section>

        {/* App Details QR */}
        <AppDetailsQR />
      </main>

      {/* Footer */}
      <footer className="border-t py-5 text-center text-xs text-muted-foreground">
        © {year}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>

      {/* Add/Edit Modal */}
      <AssignmentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        assignment={editingAssignment}
        onSubmit={handleModalSubmit}
        isPending={createAssignment.isPending || updateAssignment.isPending}
      />
    </div>
  );
}
