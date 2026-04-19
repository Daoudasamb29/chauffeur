import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const LOCAL_USER_KEY = "localUser";

type LocalUser = {
  id: number;
  name: string;
  email?: string;
};

function saveLocalUser(user: LocalUser) {
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
}

export default function Login() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleLogin = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      window.alert("Entrez votre nom pour vous connecter.");
      return;
    }

    const user: LocalUser = {
      id: Date.now(),
      name: trimmedName,
      email: email.trim() || undefined,
    };

    saveLocalUser(user);
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Driver App</CardTitle>
          <p className="text-sm text-gray-400">Connexion locale de développement</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <label className="flex flex-col gap-2 text-sm text-gray-300">
              Nom
              <input
                type="text"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Jean Conducteur"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-gray-300">
              Email (optionnel)
              <input
                type="email"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="driver@test.com"
              />
            </label>
          </div>
          <Button className="w-full" size="lg" onClick={handleLogin}>
            Se connecter
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}