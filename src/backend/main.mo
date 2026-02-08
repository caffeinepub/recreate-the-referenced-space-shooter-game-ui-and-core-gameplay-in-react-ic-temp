import Map "mo:core/Map";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Runtime "mo:core/Runtime";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  // Game Stats Type
  public type GameStats = {
    highScore : Nat;
    lastCompletedLevel : Nat;
  };

  // In-Progress Run State
  public type InProgressRun = {
    currentScore : Nat;
    currentLevel : Nat;
    livesRemaining : Nat;
    timeElapsed : Nat;
  };

  // Storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let playerStats = Map.empty<Principal, GameStats>();
  let inProgressRuns = Map.empty<Principal, InProgressRun>();

  // User Profile Functions (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return null;
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      return null;
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return false;
    };
    userProfiles.add(caller, profile);
    true;
  };

  // Game Stats Functions

  public query ({ caller }) func loadStats() : async ?GameStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return null;
    };
    playerStats.get(caller);
  };

  public query ({ caller }) func getPlayerStats(player : Principal) : async ?GameStats {
    // Admin-only function to view any player's stats
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return null;
    };
    playerStats.get(player);
  };

  public shared ({ caller }) func saveStats(highScore : Nat, lastCompletedLevel : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return false;
    };

    let stats : GameStats = {
      highScore;
      lastCompletedLevel;
    };
    playerStats.add(caller, stats);
    true;
  };

  public shared ({ caller }) func resetStats() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return false;
    };
    playerStats.remove(caller);
    inProgressRuns.remove(caller); // Reset in-progress runs too
    true;
  };

  public shared ({ caller }) func resetPlayerStats(player : Principal) : async Bool {
    // Admin-only function to reset any player's stats
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return false;
    };
    playerStats.remove(player);
    inProgressRuns.remove(player); // Reset their in-progress runs too
    true;
  };

  // In-Progress Run Functions

  public query ({ caller }) func getInProgressRun() : async ?InProgressRun {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return null;
    };
    inProgressRuns.get(caller);
  };

  public shared ({ caller }) func saveInProgressRun(run : InProgressRun) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return false;
    };
    inProgressRuns.add(caller, run);
    true;
  };

  public shared ({ caller }) func clearInProgressRun() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return false;
    };
    inProgressRuns.remove(caller);
    true;
  };

  public shared ({ caller }) func hasInProgressRun() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return false;
    };
    switch (inProgressRuns.get(caller)) {
      case (null) { false };
      case (_) { true };
    };
  };
};
