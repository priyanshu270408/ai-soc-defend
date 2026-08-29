import { useState, useCallback } from "react";
import { useAuthActions, useAuthToken } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  org_unit: string;
}

export type UserRole = "analyst" | "officer" | "command" | "admin";

// Demo role assignments for anonymous quick-login
const DEMO_ROLES: Record<string, { role: UserRole; name: string; org_unit: string }> = {
  "analyst@demo.local": { role: "analyst", name: "SOC Analyst", org_unit: "Security Operations" },
  "officer@demo.local": { role: "officer", name: "Security Officer", org_unit: "Security Operations" },
  "command@demo.local": { role: "command", name: "Command Staff", org_unit: "Executive" },
  "admin@demo.local": { role: "admin", name: "System Admin", org_unit: "IT Administration" },
};

export function useAuth() {
  const { signIn, signOut } = useAuthActions();
  const token = useAuthToken();
  const isAuthenticated = !!token;

  // Query the user's Convex profile (returns undefined while loading, null if not found)
  const convexUser = useQuery(api.socData.getUserRole);

  // Local demo profile for anonymous users
  const [demoProfile, setDemoProfile] = useState<UserProfile | null>(null);

  // Build the effective profile
  let user: UserProfile | null = null;
  let isLoading = true;

  if (isAuthenticated) {
    if (convexUser !== undefined) {
      isLoading = false;
      if (convexUser && convexUser.role) {
        // Has a role set in Convex
        user = {
          id: convexUser._id,
          email: convexUser.email ?? "",
          name: convexUser.name ?? "Unknown User",
          role: convexUser.role as UserRole,
          org_unit: convexUser.orgUnitId ?? "Security Operations",
        };
      } else if (demoProfile) {
        // Anonymous user with locally-set demo role
        user = demoProfile;
      } else {
        // Authenticated but no role set — default to analyst for demo
        user = {
          id: "anonymous_user",
          email: "",
          name: "Demo Analyst",
          role: "analyst",
          org_unit: "Security Operations",
        };
      }
    }
    // Still loading if convexUser is undefined
  } else {
    isLoading = false;
  }

  const signInEmail = useCallback(
    async (_email: string, _password: string) => {
      // Use Convex Auth email-otp provider — sends OTP to email
      const result = await signIn("email-otp", { email: _email });
      if (!result.signingIn) {
        throw new Error("OTP sent to your email. Please verify.");
      }
    },
    [signIn]
  );

  const signUp = useCallback(
    async (email: string, _password: string) => {
      const result = await signIn("email-otp", { email });
      if (!result.signingIn) {
        throw new Error("OTP sent to your email. Please verify.");
      }
    },
    [signIn]
  );

  const signInDemo = useCallback(
    async (demoEmail: string) => {
      // Sign in anonymously via Convex Auth
      await signIn("anonymous");

      // Set the demo role locally for immediate UI rendering
      const roleInfo = DEMO_ROLES[demoEmail] ?? {
        role: "analyst" as UserRole,
        name: demoEmail.split("@")[0],
        org_unit: "Security Operations",
      };

      setDemoProfile({
        id: `demo_${demoEmail}`,
        email: demoEmail,
        name: roleInfo.name,
        role: roleInfo.role,
        org_unit: roleInfo.org_unit,
      });
    },
    [signIn]
  );

  const handleSignOut = useCallback(async () => {
    await signOut();
    setDemoProfile(null);
  }, [signOut]);

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn: signInEmail,
    signInDemo,
    signUp,
    signOut: handleSignOut,
  };
}

export function useRoleAccess() {
  const { user } = useAuth();
  const role = user?.role;

  const isAnalyst = role === "analyst";
  const isOfficer = role === "officer";
  const isCommand = role === "command";
  const isAdmin = role === "admin";

  const canEdit = isAnalyst || isOfficer;
  const canViewSOC = isAnalyst || isOfficer || isCommand;
  const canViewCommand = isCommand;
  const canManageUsers = isAdmin;

  return { role, isAnalyst, isOfficer, isCommand, isAdmin, canEdit, canViewSOC, canViewCommand, canManageUsers };
}
