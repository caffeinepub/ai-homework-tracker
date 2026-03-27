import Set "mo:core/Set";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Type Definitions
  type Priority = { #low; #medium; #high };
  type Status = { #pending; #inProgress; #completed };

  public type UserProfile = {
    name : Text;
  };

  type Assignment = {
    id : Nat;
    owner : Principal;
    title : Text;
    subject : Text;
    dueDate : Time.Time;
    priority : Priority;
    status : Status;
    notes : ?Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type DashboardStats = {
    total : Nat;
    completed : Nat;
    pending : Nat;
    overdue : Nat;
  };

  // Module for Assignment comparison
  module Assignment {
    public func compare(a : Assignment, b : Assignment) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  // State variables
  var nextAssignmentId = 1;
  let assignments = Map.empty<Nat, Assignment>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Assignment Management Functions
  public shared ({ caller }) func createAssignment(title : Text, subject : Text, dueDate : Time.Time, priority : Priority, notes : ?Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can create assignments");
    };
    let id = nextAssignmentId;
    let now = Time.now();
    let assignment : Assignment = {
      id;
      owner = caller;
      title;
      subject;
      dueDate;
      priority;
      status = #pending;
      notes;
      createdAt = now;
      updatedAt = now;
    };
    assignments.add(id, assignment);
    nextAssignmentId += 1;
    id;
  };

  public shared ({ caller }) func updateAssignment(id : Nat, title : Text, subject : Text, dueDate : Time.Time, priority : Priority, status : Status, notes : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can update assignments");
    };
    switch (assignments.get(id)) {
      case (null) { Runtime.trap("Assignment not found") };
      case (?existing) {
        if (existing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own assignments");
        };
        let updated : Assignment = {
          id;
          owner = existing.owner;
          title;
          subject;
          dueDate;
          priority;
          status;
          notes;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        assignments.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteAssignment(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can delete assignments");
    };
    switch (assignments.get(id)) {
      case (null) { Runtime.trap("Assignment not found") };
      case (?existing) {
        if (existing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own assignments");
        };
        assignments.remove(id);
      };
    };
  };

  public shared ({ caller }) func markAssignmentComplete(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can mark assignments as complete");
    };
    switch (assignments.get(id)) {
      case (null) { Runtime.trap("Assignment not found") };
      case (?assignment) {
        if (assignment.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only mark your own assignments as complete");
        };
        let updated : Assignment = {
          id = assignment.id;
          owner = assignment.owner;
          title = assignment.title;
          subject = assignment.subject;
          dueDate = assignment.dueDate;
          priority = assignment.priority;
          status = #completed;
          notes = assignment.notes;
          createdAt = assignment.createdAt;
          updatedAt = Time.now();
        };
        assignments.add(id, updated);
      };
    };
  };

  public query ({ caller }) func getAssignment(id : Nat) : async Assignment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view assignments");
    };
    switch (assignments.get(id)) {
      case (null) { Runtime.trap("Assignment not found") };
      case (?assignment) {
        if (assignment.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own assignments");
        };
        assignment;
      };
    };
  };

  public query ({ caller }) func getAllAssignments() : async [Assignment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view all assignments");
    };
    let userAssignments = if (AccessControl.isAdmin(accessControlState, caller)) {
      assignments.values().toArray();
    } else {
      assignments.values().toArray().filter(func(a : Assignment) : Bool { a.owner == caller });
    };
    userAssignments.sort();
  };

  public query ({ caller }) func filterBySubject(subject : Text) : async [Assignment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view assignments by subject");
    };
    let userAssignments = if (AccessControl.isAdmin(accessControlState, caller)) {
      assignments.values().toArray();
    } else {
      assignments.values().toArray().filter(func(a : Assignment) : Bool { a.owner == caller });
    };
    userAssignments.filter(func(a : Assignment) : Bool { a.subject == subject });
  };

  public query ({ caller }) func filterByStatus(status : Status) : async [Assignment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view assignments by status");
    };
    let userAssignments = if (AccessControl.isAdmin(accessControlState, caller)) {
      assignments.values().toArray();
    } else {
      assignments.values().toArray().filter(func(a : Assignment) : Bool { a.owner == caller });
    };
    userAssignments.filter(func(a : Assignment) : Bool { a.status == status });
  };

  public query ({ caller }) func getUniqueSubjects() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view unique subjects");
    };
    let subjectSet = Set.empty<Text>();
    let userAssignments = if (AccessControl.isAdmin(accessControlState, caller)) {
      assignments.values();
    } else {
      assignments.values().filter(func(a : Assignment) : Bool { a.owner == caller });
    };
    for (assignment in userAssignments) {
      subjectSet.add(assignment.subject);
    };
    subjectSet.toArray();
  };

  public query ({ caller }) func getUniqueStatuses() : async [Status] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view unique statuses");
    };
    let userAssignments = if (AccessControl.isAdmin(accessControlState, caller)) {
      assignments.values().toArray();
    } else {
      assignments.values().toArray().filter(func(a : Assignment) : Bool { a.owner == caller });
    };
    userAssignments.map(func(a : Assignment) : Status { a.status });
  };

  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view dashboard stats");
    };
    let userAssignments = if (AccessControl.isAdmin(accessControlState, caller)) {
      assignments.values().toArray();
    } else {
      assignments.values().toArray().filter(func(a : Assignment) : Bool { a.owner == caller });
    };
    let now = Time.now();
    var total = 0;
    var completed = 0;
    var pending = 0;
    var overdue = 0;
    for (assignment in userAssignments.values()) {
      total += 1;
      switch (assignment.status) {
        case (#completed) { completed += 1 };
        case (#pending) {
          pending += 1;
          if (assignment.dueDate < now) {
            overdue += 1;
          };
        };
        case (#inProgress) {
          if (assignment.dueDate < now) {
            overdue += 1;
          };
        };
      };
    };
    {
      total;
      completed;
      pending;
      overdue;
    };
  };

  public query ({ caller }) func getAIStudyTips(id : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can get AI study tips");
    };
    switch (assignments.get(id)) {
      case (null) { Runtime.trap("Assignment not found") };
      case (?assignment) {
        if (assignment.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only get study tips for your own assignments");
        };
        let priorityText = switch (assignment.priority) {
          case (#high) { "high priority" };
          case (#medium) { "medium priority" };
          case (#low) { "low priority" };
        };
        let statusText = switch (assignment.status) {
          case (#pending) { "not started yet" };
          case (#inProgress) { "in progress" };
          case (#completed) { "completed" };
        };
        "AI Study Tips for '" # assignment.title # "' (" # assignment.subject # ", " # priorityText # ", " # statusText # "): Break down the assignment into smaller tasks. Create a study schedule. Use active recall and spaced repetition. Take regular breaks. Review your notes before starting. Seek help if needed.";
      };
    };
  };

  // Seed data function for individual users
  public shared ({ caller }) func initializeSeedData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can initialize seed data");
    };
    let now = Time.now();
    let sampleAssignments : [Assignment] = [
      {
        id = nextAssignmentId;
        owner = caller;
        title = "Math Homework 1";
        subject = "Math";
        dueDate = now + (3 * 24 * 60 * 60 * 1_000_000_000);
        priority = #high;
        status = #pending;
        notes = ?("Complete all exercises from chapter 2");
        createdAt = now;
        updatedAt = now;
      },
      {
        id = nextAssignmentId + 1;
        owner = caller;
        title = "Science Project";
        subject = "Science";
        dueDate = now + (7 * 24 * 60 * 60 * 1_000_000_000);
        priority = #medium;
        status = #inProgress;
        notes = null;
        createdAt = now;
        updatedAt = now;
      },
      {
        id = nextAssignmentId + 2;
        owner = caller;
        title = "History Essay";
        subject = "History";
        dueDate = now + (2 * 24 * 60 * 60 * 1_000_000_000);
        priority = #low;
        status = #pending;
        notes = ?("Research about World War II events");
        createdAt = now;
        updatedAt = now;
      },
    ];

    for (assignment in sampleAssignments.values()) {
      assignments.add(assignment.id, assignment);
      nextAssignmentId += 1;
    };
  };
};
