"use client";

import { FC, useEffect, useState } from "react";

import { useTable } from "@/hooks/useTable";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/custom/form/Input";
import Button from "@/components/custom/Button";
import { Form } from "@/components/ui/form";
import {
  profileSchema,
  UpdateProfileSchemaType,
} from "@/schemas/user/profile.schema";
import UpdatePassword from "./UpdatePassword";
import { useProfile } from "@/hooks/convex/useProfile";
import { useMutationWithToast } from "@/hooks/convex/useMutationWithToast";
import { api } from "../../../../convex/_generated/api";

interface ProfilePageProps {}

const ProfilePage: FC<ProfilePageProps> = () => {
  const { data: profile } = useProfile();
  const { mutate, isPending, error } = useMutationWithToast(
    api.functions.users.updateProfile
  );

  const [openUpdatePassword, setOpenUpdatePassword] = useState(false);

  const form = useForm<UpdateProfileSchemaType>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    form.setValue("firstName", profile?.firstName || "");
    form.setValue("lastName", profile?.lastName || "");
    form.setValue("middleName", profile?.middleName || "");

    form.setValue("email", profile?.email || undefined);
    form.setValue("phoneNumber", profile?.phoneNumber || undefined);
    form.setValue("role", profile?.role || undefined);
    form.setValue("location", profile?.location?.name || undefined);
  }, [profile]);

  const handleSubmit = (values: UpdateProfileSchemaType) => {
    mutate(
      {
        firstName: values.firstName,
        lastName: values.lastName,
        middleName: values.middleName,
        phoneNumber: values.phoneNumber,
      },
      {
        successMessage: "Profile updated successfully",
      }
    );
  };

  const {} = useTable({ title: "" });

  return (
    <div className="pl-52">
      <div>
        <h2 className=" text-[1.2em] font-semibold">Profile </h2>
        <p className=" text-sm text-slate-500">Manage your profile here.</p>
      </div>
      <div className="py-4">
        <div className="min-h-screen bg-background flex flex-col p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-xl ">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="w-full space-y-4"
              >
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <Input
                      name="firstName"
                      label="Nom"
                      control={form.control}
                      className="w-full"
                    />

                    <Input
                      name="lastName"
                      label="Postnom"
                      control={form.control}
                      className="w-full"
                    />
                  </div>
                  <Input
                    name="middleName"
                    label="Prenom"
                    control={form.control}
                  />
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <Input name="email" label="Email" control={form.control} />

                    <Input
                      name="phoneNumber"
                      label="Phone number"
                      control={form.control}
                    />
                  </div>
                  <Input
                    name="role"
                    label="Role"
                    disabled={true}
                    control={form.control}
                  />
                  <Input
                    name="location"
                    label="Boutique"
                    disabled={true}
                    control={form.control}
                  />
                </div>

                {error && <div className="text-red-500">{error.message}</div>}

                <div className="flex justify-between items-end">
                  <UpdatePassword
                    open={openUpdatePassword}
                    setOpen={setOpenUpdatePassword}
                    showTrigger={true}
                    callback={() => {
                      setOpenUpdatePassword(false);
                    }}
                  />
                  <Button type="submit" loading={isPending}>
                    Save profile
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
