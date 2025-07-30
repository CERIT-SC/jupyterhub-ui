import { FC } from "react";

import { useOidc } from "@/hooks/useOidc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OidcTester: FC = () => {
  const { signinRedirect, user, signoutRedirect } = useOidc();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>OIDC</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="p-4">
          {user === null ? "user is null" : "users data"}
        </div>
        <Button onClick={() => signinRedirect()}>Sign in</Button>
        <Button onClick={() => signoutRedirect()}>Sign out</Button>
        <Button disabled={!user} onClick={() => console.log(user)}>
          Print user
        </Button>
      </CardContent>
    </Card>
  );
};

export default OidcTester;
