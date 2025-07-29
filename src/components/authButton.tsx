"use client";

import { useOidc } from "@/hooks/useOidc";

const SignInButton = () => {
  const { signinRedirect } = useOidc();

  return (
    <button
      className={"border-1 rounded-full font-bold hover:shadow p-4"}
      onClick={() => signinRedirect()}
    >
      Sign In
    </button>
  );
};

const SignOutButton = () => {
  const { signoutRedirect } = useOidc();

  return (
    <button
      className={"border-1 rounded-full font-bold hover:shadow p-4"}
      onClick={() => signoutRedirect()}
    >
      Sign Out
    </button>
  );
};

export { SignInButton, SignOutButton };
