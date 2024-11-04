"use client";

import { FC, useState } from "react";
import { RolesType } from "@/interface/roles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useCreateMutation } from "@/hooks/api/common/create";

import Button from "@/components/custom/Button";
import Modal from "@/components/ui/modal";
import { Form } from "@/components/ui/form";
import Input from "@/components/custom/form/Input";
import {
  updatePasswordSchema,
  UpdatePasswordSchemaType,
} from "@/schemas/user/updatePassword.schema";
import { toast } from "sonner";
import { useUpdateMutation } from "@/hooks/api/common/update";

interface UpdatePasswordProps {
  context?: RolesType;
  callback?: () => void;
  showTrigger?: boolean;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const UpdatePassword: FC<UpdatePasswordProps> = ({
  callback,
  showTrigger,
  open,
  setOpen,
}) => {
  const { mutate, isPending, error, isError } = useUpdateMutation({
    queryKey: "create-user",
    endpoint: "/users/update-password",
  });

  const form = useForm<UpdatePasswordSchemaType>({
    resolver: zodResolver(updatePasswordSchema),
  });

  function callbackOnSuccess() {
    form.reset();
    callback?.();
  }

  const handleSubmit = (values: UpdatePasswordSchemaType) => {
    if (values.newPassword !== values.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas", {
        description: "Veuillez réessayer",
      });
      return;
    }

    mutate({
      data: { password: values.password, newPassword: values.newPassword },
      onSuccess: {
        message: `Mot de passe modifié avec succès`,
        callback: callbackOnSuccess,
      },
    });
  };

  return (
    <div>
      <Modal
        title="Changer de mot de passe"
        description=""
        onClose={() => setOpen?.(false)}
        isOpened={open || false}
        classNames={{
          title: "text-2xl font-semibold",
          description: "text-sm",
          container: "w-full ",
        }}
        trigger={
          showTrigger && (
            <Button
              type="button"
              onClick={() => {
                setOpen?.(true);
              }}
            >
              Changer de mot de passe
            </Button>
          )
        }
      >
        <div className=" flex gap-4 ">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="w-full space-y-4"
            >
              <Input
                name="password"
                label="Ancien mot de passe"
                type="password"
                control={form.control}
              />
              <Input
                name="newPassword"
                label="Nouveau mot de passe"
                type="password"
                control={form.control}
              />
              <Input
                name="confirmPassword"
                label="Confirmer le nouveau mot de passe"
                type="password"
                control={form.control}
              />

              {isError && (
                <span className=" text-sm text-red-400">{error?.message}</span>
              )}

              <Button
                loading={isPending}
                type="submit"
                size="sm"
                className="w-full"
              >
                Changer
              </Button>
            </form>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default UpdatePassword;
