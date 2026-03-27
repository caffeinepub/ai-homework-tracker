import type { Priority, Status } from "@/backend";
import { useActor } from "@/hooks/useActor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type { Priority, Status };

export function useAllAssignments() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["assignments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAssignments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUniqueSubjects() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["uniqueSubjects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUniqueSubjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAIStudyTips(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["aiTips", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return "";
      return actor.getAIStudyTips(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useInitSeedData() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await actor.initializeSeedData();
    },
  });
}

export function useCreateAssignment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      subject: string;
      dueDate: bigint;
      priority: Priority;
      notes: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createAssignment(
        data.title,
        data.subject,
        data.dueDate,
        data.priority,
        data.notes,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
      qc.invalidateQueries({ queryKey: ["uniqueSubjects"] });
    },
  });
}

export function useUpdateAssignment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      subject: string;
      dueDate: bigint;
      priority: Priority;
      status: Status;
      notes: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateAssignment(
        data.id,
        data.title,
        data.subject,
        data.dueDate,
        data.priority,
        data.status,
        data.notes,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useDeleteAssignment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteAssignment(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
      qc.invalidateQueries({ queryKey: ["uniqueSubjects"] });
    },
  });
}

export function useMarkComplete() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.markAssignmentComplete(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}
