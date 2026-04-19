import { trpc } from "@/providers/trpc";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { LOGIN_PATH } from "@/const";

const LOCAL_USER_KEY = "localUser";

type LocalUser = {
  id: number;
  name: string;
  email?: string;
};

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

function getLocalUser(): LocalUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? (JSON.parse(raw) as LocalUser) : null;
  } catch {
    return null;
  }
}

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = LOGIN_PATH } =
    options ?? {};

  const navigate = useNavigate();

  const utils = trpc.useUtils();

  const [localUser, setLocalUser] = useState<LocalUser | null>(() => getLocalUser());

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = trpc.auth.me.useQuery(undefined, {
    enabled: !localUser,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  useEffect(() => {
    if (!localUser) {
      setLocalUser(getLocalUser());
    }
  }, [localUser]);

  const authUser = user ?? localUser;
  const isLocal = !!localUser && !user;
  const isAuthenticated = !!authUser;

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      navigate(redirectPath);
    },
  });

  const logout = useCallback(() => {
    localStorage.removeItem(LOCAL_USER_KEY);
    setLocalUser(null);
    if (user) {
      logoutMutation.mutate();
    }
    navigate(redirectPath);
  }, [logoutMutation, navigate, redirectPath, user]);

  useEffect(() => {
    if (redirectOnUnauthenticated && !isLoading && !authUser) {
      const currentPath = window.location.pathname;
      if (currentPath !== redirectPath) {
        navigate(redirectPath);
      }
    }
  }, [redirectOnUnauthenticated, isLoading, authUser, navigate, redirectPath]);

  return useMemo(
    () => ({
      user: authUser,
      isLocal,
      isAuthenticated,
      isLoading: isLoading || logoutMutation.isPending,
      error,
      logout,
      refresh: refetch,
    }),
    [authUser, isLocal, isAuthenticated, isLoading, logoutMutation.isPending, error, logout, refetch],
  );
}
