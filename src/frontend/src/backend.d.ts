import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface InProgressRun {
    timeElapsed: bigint;
    livesRemaining: bigint;
    currentLevel: bigint;
    currentScore: bigint;
}
export interface GameStats {
    highScore: bigint;
    lastCompletedLevel: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearInProgressRun(): Promise<boolean>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInProgressRun(): Promise<InProgressRun | null>;
    getPlayerStats(player: Principal): Promise<GameStats | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasInProgressRun(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    loadStats(): Promise<GameStats | null>;
    resetPlayerStats(player: Principal): Promise<boolean>;
    resetStats(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<boolean>;
    saveInProgressRun(run: InProgressRun): Promise<boolean>;
    saveStats(highScore: bigint, lastCompletedLevel: bigint): Promise<boolean>;
}
