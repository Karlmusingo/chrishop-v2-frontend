import { useState, useCallback } from "react";
import { useAction } from "convex/react";
import { toast } from "sonner";
import { FunctionReference } from "convex/server";

export function useActionWithToast<
  T extends FunctionReference<"action", "public", any, any>,
>(action: T) {
  const runAction = useAction(action);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (
      args: T["_args"],
      options?: {
        successMessage?: string;
        onSuccess?: (data?: any) => void;
        onError?: () => void;
      }
    ) => {
      setIsPending(true);
      setError(null);
      try {
        const result = await runAction(args);
        if (options?.successMessage) {
          toast(options.successMessage, {
            description: "The record should be visible on your catalogue.",
          });
        }
        options?.onSuccess?.(result);
        return result;
      } catch (err: any) {
        const errorMsg =
          err?.message || err?.data?.message || "An error occurred";
        setError(err);
        toast.error(errorMsg);
        options?.onError?.();
        throw err;
      } finally {
        setIsPending(false);
      }
    },
    [runAction]
  );

  return { mutate: execute, isPending, error, isError: !!error };
}
