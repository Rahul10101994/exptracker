
'use client';

import { Auth, onAuthStateChanged, User } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

import { useAuth } from "../provider";

export type UserContext = {
  user: User | null;
  loading: boolean;
};

export const UserContext = createContext<UserContext | null>(null);

export const useUser = () => {
  return useContext(UserContext);
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth() as Auth;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}
