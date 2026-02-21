"use client";
import Button from "@/components/custom/Button";
import Input from "@/components/custom/form/Input";
import { Form } from "@/components/ui/form";
import { useActionWithToast } from "@/hooks/convex/useActionWithToast";
import { loginSchema, LoginSchemaType } from "@/schemas/auth/login.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shirt } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuthActions } from "@convex-dev/auth/react";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const resetAuthAccount = useAction(api.functions.authActions.resetAuthAccount);
  const { mutate, isPending, error } = useActionWithToast(
    api.functions.authActions.login,
  );

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });

  const handleConvexAuth = async (
    email: string,
    password: string,
    hasInitialPasswordChanged: boolean,
  ) => {
    const flow = !hasInitialPasswordChanged ? "signUp" : "signIn";
    try {
      await signIn("password", { email, password, flow });
    } catch {
      try {
        const fallbackFlow = flow === "signIn" ? "signUp" : "signIn";
        await signIn("password", { email, password, flow: fallbackFlow });
      } catch {
        // Both failed — authAccount is out of sync. Reset and retry signUp.
        await resetAuthAccount({ email, password });
        await signIn("password", { email, password, flow: "signUp" });
      }
    }
  };

  const handleSubmit = async (values: LoginSchemaType) => {
    await mutate(
      { email: values.email, password: values.password },
      {
        onSuccess: async (data) => {
          await handleConvexAuth(
            values.email,
            values.password,
            !!data?.hasInitialPasswordChanged,
          );

          if (!data?.hasInitialPasswordChanged) {
            return router.replace("/?hasInitialPasswordChanged=false");
          }
          router.replace("/");
        },
      },
    );
  };

  return (
    <main className="flex min-h-screen">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1A1A1A] flex-col items-center justify-center px-12">
        <div className="flex items-center gap-3 mb-6">
          <Shirt className="h-10 w-10 text-[var(--accent-primary)]" />
          <span className="font-serif text-4xl font-bold text-white">ThreadCraft</span>
        </div>
        <p className="text-center text-[#999] text-lg max-w-md leading-relaxed">
          Gérez votre inventaire, vos ventes et vos boutiques en toute simplicité.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-[var(--bg-primary)] px-6">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden justify-center mb-4">
            <Shirt className="h-7 w-7 text-[var(--accent-primary)]" />
            <span className="font-serif text-2xl font-bold">ThreadCraft</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-bold text-[var(--text-primary)]">
              Connexion
            </h1>
            <p className="text-sm text-[var(--text-tertiary)]">
              Entrez vos identifiants pour accéder à votre compte
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-5"
            >
              <Input
                name="email"
                label="Email"
                control={form.control}
                placeholder="votre@email.com"
              />
              <Input
                name="password"
                type="password"
                label="Mot de passe"
                control={form.control}
                placeholder="Votre mot de passe"
              />
              {error?.message && (
                <p className="text-sm text-[var(--status-error)]">{error.message}</p>
              )}
              <Button
                loading={isPending}
                type="submit"
                className="w-full"
              >
                Se connecter
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </main>
  );
}
