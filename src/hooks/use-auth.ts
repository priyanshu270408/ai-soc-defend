import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { UserProfile, UserRole } from "@/lib/soc-data";

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: UserProfile | null;
}

// Simulated user profiles for demo — in production these come from Supabase + your backend
const DEMO_PROFILES: Record<string, UserProfile> = {
  "analyst@demo.local": {
    id: "usr_analyst_01",
    email: "analyst@demo.local",
    name: "SOC Analyst",
    role: "analyst",
    org_unit: "Security Operations",
  },
  "officer@demo.local": {
    id: "usr_officer_01",
    email: "officer@demo.local",
    name: "Security Officer",
    role: "officer",
    org_unit: "Security Operations",
  },
  "command@demo.local": {
    id: "usr_command_01",
    email: "command@demo.local",
    name: "Command Staff",
    role: "command",
    org_unit: "Executive",
  },
  "admin@demo.local": {
    id: "usr_admin_01",
    email: "admin@demo.local",
    name: "System Admin",
    role: "admin",
    org_unit: "IT Administration",
  },
};

function getProfileForEmail(email: string): UserProfile {
  if (DEMO_PROFILES[email]) return DEMO_PROFILES[email];
  // Default: analyst role for any other email
  return {
    id: "usr_default_01",
    email,
    name: email.split("@")[0],
    role: "analyst",
    org_unit: "Security Operations",
  };
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
  });

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const profile = getProfileForEmail(session.user.email || "");
        setState({ isLoading: false, isAuthenticated: true, user: profile });
      } else {
        setState({ isLoading: false, isAuthenticated: false, user: null });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const profile = getProfileForEmail(session.user.email || "");
        setState({ isLoading: false, isAuthenticated: true, user: profile });
      } else {
        setState({ isLoading: false, isAuthenticated: false, user: null });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setState({ isLoading: false, isAuthenticated: false, user: null });
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
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
  const canViewSOC = isAnalyst || isOfficer;
  const canViewCommand = isCommand;
  const canManageUsers = isAdmin;

  return { role, isAnalyst, isOfficer, isCommand, isAdmin, canEdit, canViewSOC, canViewCommand, canManageUsers };
}
