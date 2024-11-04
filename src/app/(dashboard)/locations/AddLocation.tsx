"use client";

import { FC, useState } from "react";
import { ROLES } from "@/interface/roles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useCreateMutation } from "@/hooks/api/common/create";

import { usePermission } from "@/hooks/usePermission";
import { Form } from "../../../components/ui/form";

import Modal from "@/components/ui/modal";
import Button from "@/components/custom/Button";
import Input from "@/components/custom/form/Input";

import {
  addLocationSchema,
  AddLocationSchemaType,
} from "@/schemas/locations/location.schema";

interface AddLocationProps {
  callback?: () => void;
}

const AddLocation: FC<AddLocationProps> = ({ callback }) => {
  const { mutate, isPending, error, isError } = useCreateMutation({
    queryKey: "create-location",
    endpoint: "locations",
  });

  const { userRole } = usePermission();

  const [isOpened, setOpened] = useState(false);

  const form = useForm<AddLocationSchemaType>({
    resolver: zodResolver(addLocationSchema),
  });

  function callbackOnSuccess() {
    form.reset();
    setOpened(false);
    callback?.();
  }

  const handleSubmit = (values: AddLocationSchemaType) => {
    mutate({
      data: { ...values },
      onSuccess: {
        message: "Location created successfully",
        callback: callbackOnSuccess,
      },
    });
  };

  return (
    <div>
      <Modal
        title="Add Location"
        description=""
        onClose={() => setOpened(false)}
        isOpened={isOpened}
        classNames={{
          title: "text-2xl font-semibold",
          description: "text-sm",
          container: "w-full ",
        }}
        trigger={
          userRole === ROLES.ADMIN && (
            <Button
              icon="Plus"
              type="button"
              disabled={userRole !== ROLES.ADMIN}
              onClick={() => {
                setOpened(true);
              }}
            >
              Add Boutique
            </Button>
          )
        }
      >
        <div className=" flex gap-0 ">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="w-full space-y-4"
            >
              <Input
                className=""
                name="name"
                label="Nom"
                control={form.control}
              />
              <Input
                className=""
                name="province"
                label="Province"
                control={form.control}
              />
              <Input
                className=""
                name="city"
                label="Ville"
                control={form.control}
              />
              <Input
                className=""
                name="address"
                label="Adresse"
                control={form.control}
              />
              <Input
                className=""
                name="contactEmail"
                label="Email de contact"
                control={form.control}
              />
              <Input
                className=""
                name="contactPhoneNumber"
                label="Numero de contact"
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
                Ajouter
              </Button>
            </form>
          </Form>
        </div>
      </Modal>
    </div>
  );
};
export default AddLocation;
