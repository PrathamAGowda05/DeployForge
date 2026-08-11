"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AuthLayout from "@/components/layout/AuthLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Alert from "@/components/ui/Alert";
import { Card, CardContent } from "@/components/ui/Card";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await axios.post("http://localhost:4000/api/auth/register", {
        email,
        password,
      });

      router.push("/login");
    } catch (error: any) {
      console.error("Registration failed:", error);

      setError(error.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Register for deployment access">
      <Card>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>

              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />
            </div>

            {error && <Alert>{error}</Alert>}

            <Button type="submit" variant="primary" disabled={loading} className="w-full">
              {loading ? "Registering..." : "> CREATE_ACCOUNT"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Button
        type="button"
        variant="ghost"
        onClick={() => router.push("/login")}
        className="mt-6 w-full"
      >
        Already have an account? Sign In
      </Button>
    </AuthLayout>
  );
}
