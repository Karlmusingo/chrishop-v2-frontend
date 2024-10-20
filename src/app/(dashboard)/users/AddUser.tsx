"use client";

import { FC, useMemo, useState } from "react";
import { ROLES, RolesType } from "@/interface/roles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useCreateMutation } from "@/hooks/api/common/create";

import { usePermission } from "@/hooks/usePermission";
import Button from "@/components/custom/Button";
import Modal from "@/components/ui/modal";
import { Form } from "@/components/ui/form";
import Input from "@/components/custom/form/Input";
import { useGetList } from "@/hooks/api/common/getAll";
import { IUnknown } from "@/interface/Iunknown";
import {
  addUserSchema,
  AddUserSchemaType,
} from "@/schemas/user/addUser.schema";

interface AddStaffProps {
  context?: RolesType;
  callback?: () => void;
}

const AddUser: FC<AddStaffProps> = ({ callback }) => {
  const { mutate, isPending, error, isError } = useCreateMutation({
    queryKey: "create-user",
    endpoint: "/users",
  });

  const { data: locationData } = useGetList({
    queryKey: "get-locations",
    endpoint: "/locations",
  });

  const locationOptions = useMemo(() => {
    return (
      locationData?.data?.map((location: IUnknown) => {
        return {
          label: location.name,
          value: location.id,
        };
      }) || []
    );
  }, [locationData]);

  const { userRole } = usePermission();

  const [isOpened, setOpened] = useState(false);

  const form = useForm<AddUserSchemaType>({
    resolver: zodResolver(addUserSchema),
  });

  const roleInput = form.watch("role");

  function callbackOnSuccess() {
    form.reset();
    setOpened(false);
    callback?.();
  }

  const handleSubmit = (values: AddUserSchemaType) => {
    mutate({
      data: { ...values },
      onSuccess: {
        message: `${values.role} created successfully`,
        callback: callbackOnSuccess,
      },
    });
  };

  return (
    <div>
      <Modal
        title="Add User"
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
            disabled={userRole !== ROLES.ADMIN}
            onClick={() => {
              setOpened(true);
            }}
          >
            Add User
          </Button>
        }
      >
        <div className=" flex gap-4 ">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="w-full space-y-4"
            >
              <div className="space-y-4">
                <Input
                  name="role"
                  label="Type"
                  type="select"
                  options={[
                    {
                      label: "Admin",
                      value: ROLES.ADMIN,
                    },
                    {
                      label: "Manager",
                      value: ROLES.MANAGER,
                    },
                    {
                      label: "Caissier",
                      value: ROLES.CASHIER,
                    },
                    {
                      label: "Vendeur",
                      value: ROLES.SELLER,
                    },
                  ]}
                  control={form.control}
                />
                {roleInput === ROLES.ADMIN || (
                  <Input
                    name="location"
                    label="Location (optional)"
                    type="select"
                    options={locationOptions}
                    control={form.control}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 grid-rows-2 gap-4">
                <Input name="firstName" label="Nom" control={form.control} />
                <Input name="lastName" label="Postnom" control={form.control} />
                <Input
                  name="middleName"
                  label="Prenom"
                  control={form.control}
                />

                <Input
                  name="phoneNumber"
                  label="Phone number"
                  control={form.control}
                />
                <Input name="email" label="Email" control={form.control} />
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
                Ajouter
              </Button>
            </form>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default AddUser;
