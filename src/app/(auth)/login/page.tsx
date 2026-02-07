"use client";
import Button from "@/components/custom/Button";
import Input from "@/components/custom/form/Input";
import { Form } from "@/components/ui/form";
import { useActionWithToast } from "@/hooks/convex/useActionWithToast";
import { loginSchema, LoginSchemaType } from "@/schemas/auth/login.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { api } from "../../../../convex/_generated/api";

export default function Login() {
  const router = useRouter();
  const { mutate, isPending, error } = useActionWithToast(
    api.functions.authActions.login
  );

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });

  const handleSubmit = async (values: LoginSchemaType) => {
    await mutate(
      { email: values.email, password: values.password },
      {
        onSuccess: (data) => {
          form.reset();
          if (data?.isFirstLogin) {
            return router.replace("/?firstLogin=true");
          }
          router.replace("/");
        },
      }
    );
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="min-w-96 space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Login</h1>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <Input
              name="email"
              label="Email"
              control={form.control}
              placeholder="Email"
            />
            <Input
              name="password"
              type="password"
              label="Password"
              control={form.control}
              placeholder="Password"
            />
            {error?.message && <p className="text-red-500">{error.message}</p>}
            <Link
              href="#"
              className="mb-1 text-blue-500 hover:text-blue-700"
              prefetch={false}
            >
              Forgot your password?
            </Link>
            <Button
              loading={isPending}
              type="submit"
              size="sm"
              className="ml-auto flex w-full"
            >
              Sign in
            </Button>
          </form>
        </Form>
      </div>
    </main>
  );
}
