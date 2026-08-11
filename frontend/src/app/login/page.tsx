"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:4000/api/auth/login",
        {
          email,
          password,
        },
      );

      const token = response.data.token;

      localStorage.setItem("token", token);

      router.push("/projects");

      console.log("Token saved");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <main>
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit">Login</button>
      </form>
    </main>
  );
}
