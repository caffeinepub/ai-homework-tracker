import { Priority, Status } from "@/backend";
import type { Assignment } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment?: Assignment | null;
  onSubmit: (data: {
    title: string;
    subject: string;
    dueDate: bigint;
    priority: Priority;
    status: Status;
    notes: string | null;
  }) => Promise<void>;
  isPending: boolean;
}

function formatDateForInput(time: bigint): string {
  const ms = Number(time) / 1_000_000;
  const d = new Date(ms);
  return d.toISOString().slice(0, 10);
}

export default function AssignmentModal({
  open,
  onOpenChange,
  assignment,
  onSubmit,
  isPending,
}: Props) {
  const isEdit = !!assignment;

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>(Priority.medium);
  const [status, setStatus] = useState<Status>(Status.pending);
  const [notes, setNotes] = useState("");

  // Reset form when modal opens or assignment changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: open is intentional reset trigger
  useEffect(() => {
    if (assignment) {
      setTitle(assignment.title);
      setSubject(assignment.subject);
      setDueDate(formatDateForInput(assignment.dueDate));
      setPriority(assignment.priority);
      setStatus(assignment.status);
      setNotes(assignment.notes ?? "");
    } else {
      setTitle("");
      setSubject("");
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(tomorrow.toISOString().slice(0, 10));
      setPriority(Priority.medium);
      setStatus(Status.pending);
      setNotes("");
    }
  }, [assignment, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dueDateMs = new Date(dueDate).getTime();
    const dueDateNs = BigInt(dueDateMs) * 1_000_000n;
    await onSubmit({
      title: title.trim(),
      subject: subject.trim(),
      dueDate: dueDateNs,
      priority,
      status,
      notes: notes.trim() || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-ocid="assignment.dialog">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {isEdit ? "Edit Assignment" : "Add New Assignment"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              data-ocid="assignment.input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 5 Essay"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              data-ocid="assignment.input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Biology"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              data-ocid="assignment.input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as Priority)}
              >
                <SelectTrigger data-ocid="assignment.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Priority.low}>🟢 Low</SelectItem>
                  <SelectItem value={Priority.medium}>🟡 Medium</SelectItem>
                  <SelectItem value={Priority.high}>🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isEdit && (
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as Status)}
                >
                  <SelectTrigger data-ocid="assignment.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Status.pending}>Pending</SelectItem>
                    <SelectItem value={Status.inProgress}>
                      In Progress
                    </SelectItem>
                    <SelectItem value={Status.completed}>Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              data-ocid="assignment.textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any extra details..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-ocid="assignment.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="assignment.submit_button"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Add Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
