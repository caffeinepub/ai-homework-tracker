import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Assignment {
    id: bigint;
    status: Status;
    title: string;
    subject: string;
    owner: Principal;
    createdAt: Time;
    dueDate: Time;
    updatedAt: Time;
    notes?: string;
    priority: Priority;
}
export interface DashboardStats {
    total: bigint;
    pending: bigint;
    completed: bigint;
    overdue: bigint;
}
export interface UserProfile {
    name: string;
}
export enum Priority {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum Status {
    pending = "pending",
    completed = "completed",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAssignment(title: string, subject: string, dueDate: Time, priority: Priority, notes: string | null): Promise<bigint>;
    deleteAssignment(id: bigint): Promise<void>;
    filterByStatus(status: Status): Promise<Array<Assignment>>;
    filterBySubject(subject: string): Promise<Array<Assignment>>;
    getAIStudyTips(id: bigint): Promise<string>;
    getAllAssignments(): Promise<Array<Assignment>>;
    getAssignment(id: bigint): Promise<Assignment>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getUniqueStatuses(): Promise<Array<Status>>;
    getUniqueSubjects(): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeSeedData(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    markAssignmentComplete(id: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateAssignment(id: bigint, title: string, subject: string, dueDate: Time, priority: Priority, status: Status, notes: string | null): Promise<void>;
}
