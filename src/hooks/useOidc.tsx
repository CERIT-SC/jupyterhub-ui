import { useEffect, useState } from "react";
import { User, UserManager } from "oidc-client-ts";

import oidcConfig from "@/config/oidc";

const userManager =
  typeof window !== "undefined" ? new UserManager(oidcConfig) : null;

export const useOidc = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!userManager) return;

    // Fetch the current user and set it in state
    userManager.getUser().then((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      }
    });
    const onUserLoaded = (newUser: User) => setUser(newUser);
    const onUserUnloaded = () => setUser(null);
    const handleTokenExpiring = () => {
      userManager
        .signinSilent()
        .then((renewedUser) => {
          if (renewedUser) {
            setUser(renewedUser);
          }
        })
        .catch((error) => {
          console.error("Silent renew error:", error);
        });
    };
    const handleTokenExpired = () => {
      setUser(null);
    };

    // Register event handlers
    userManager.events.addUserLoaded(onUserLoaded);
    userManager.events.addUserUnloaded(onUserUnloaded);
    userManager.events.addAccessTokenExpiring(handleTokenExpiring);
    userManager.events.addAccessTokenExpired(handleTokenExpired);

    // Cleanup event handlers on component unmount
    return () => {
      userManager.events.removeUserLoaded(onUserLoaded);
      userManager.events.removeUserUnloaded(onUserUnloaded);
      userManager.events.removeAccessTokenExpiring(handleTokenExpiring);
      userManager.events.removeAccessTokenExpired(handleTokenExpired);
    };
  }, []);

  const signinRedirect = () => userManager?.signinRedirect();
  const signoutRedirect = () => userManager?.signoutRedirect();

  return { user, signinRedirect, signoutRedirect, userManager };
};
