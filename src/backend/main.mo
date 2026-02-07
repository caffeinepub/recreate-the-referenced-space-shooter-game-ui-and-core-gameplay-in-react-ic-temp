import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

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

  // Storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let playerStats = Map.empty<Principal, GameStats>();

  // User Profile Functions (required by frontend)
  
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
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

  // Game Stats Functions

  public query ({ caller }) func loadStats() : async ?GameStats {
    // Users can only load their own stats
    // Guests are allowed to check if they have stats (will return null)
    playerStats.get(caller);
  };

  public query ({ caller }) func getPlayerStats(player : Principal) : async ?GameStats {
    // Admin-only function to view any player's stats
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view other players' stats");
    };
    playerStats.get(player);
  };

  public shared ({ caller }) func saveStats(highScore : Nat, lastCompletedLevel : Nat) : async () {
    // Only authenticated users can save stats (not guests)
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save game stats");
    };

    let stats : GameStats = {
      highScore;
      lastCompletedLevel;
    };
    playerStats.add(caller, stats);
  };

  public shared ({ caller }) func resetStats() : async () {
    // Users can reset their own stats
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reset their stats");
    };
    playerStats.remove(caller);
  };

  public shared ({ caller }) func resetPlayerStats(player : Principal) : async () {
    // Admin-only function to reset any player's stats
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reset other players' stats");
    };
    playerStats.remove(player);
  };
};
