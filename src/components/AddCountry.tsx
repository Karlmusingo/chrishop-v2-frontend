"use client";

import { FC, useState } from "react";
import { ROLES, RolesType } from "@/interface/roles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useCreateMutation } from "@/hooks/api/common/create";

import Button from "./custom/Button";
import Modal from "./ui/modal";
import Input from "./custom/form/Input";
import {
  addCountrySchema,
  AddCountrySchemaType,
} from "@/schemas/countries/countries.schema";
import { usePermission } from "@/hooks/usePermission";
import { Form } from "./ui/form";
import { Label } from "./ui/label";

interface AddCountryProps {
  context?: RolesType;
  callback?: () => void;
}

const AddCountry: FC<AddCountryProps> = ({ callback }) => {
  const { mutate, isPending, error, isError } = useCreateMutation({
    queryKey: "invite-driver",
    endpoint: "countries",
  });

  const { userRole } = usePermission();

  const [isOpened, setOpened] = useState(false);

  const form = useForm<AddCountrySchemaType>({
    resolver: zodResolver(addCountrySchema),
  });

  function callbackOnSuccess() {
    setOpened(false);
    callback?.();
  }

  const handleSubmit = (values: AddCountrySchemaType) => {
    mutate({
      data: { ...values },
      onSuccess: {
        message: "Country created successfully",
        callback: callbackOnSuccess,
      },
    });
  };

  return (
    <div>
      <Modal
        title="Add country"
        description=""
        onClose={() => setOpened(false)}
        isOpened={isOpened}
        classNames={{
          title: "text-2xl font-semibold",
          description: "text-sm",
          container: "w-full ",
        }}
        trigger={
          <Button
            icon="Plus"
            type="button"
            disabled={userRole !== ROLES.SUPER_ADMIN}
            onClick={() => {
              setOpened(true);
            }}
          >
            Add country
          </Button>
        }
      >
        <div className=" flex gap-4 ">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="w-full  space-y-4"
            >
              <Input name="name" label="Country Name" control={form.control} />

              <div className="grid grid-cols-2 gap-3 w-full">
                <Input
                  name="countryCode"
                  label="Country Code"
                  control={form.control}
                  className="w-full"
                />

                <Input
                  name="phoneCode"
                  label="Phone Code"
                  placeholder="(without +)"
                  control={form.control}
                  className="w-full"
                />
              </div>
              <div className="space-y-4 mt-14">
                <Label className="">Country Director details</Label>
                <div className="grid grid-cols-2 grid-rows-2 gap-3 w-full">
                  <Input
                    name="firstName"
                    label="First name"
                    control={form.control}
                  />
                  <Input
                    name="lastName"
                    label="Last name"
                    control={form.control}
                  />

                  <Input
                    name="phoneNumber"
                    label="Phone number"
                    control={form.control}
                  />
                  <Input name="email" label="Email" control={form.control} />
                </div>
              </div>
              {isError && (
                <span className=" text-sm text-red-400">{error?.message}</span>
              )}

              <Button
                loading={isPending}
                type="submit"
                size="sm"
                className="w-full"
              >
                Add
              </Button>
            </form>
          </Form>
        </div>
      </Modal>
    </div>
  );
};
export default AddCountry;
