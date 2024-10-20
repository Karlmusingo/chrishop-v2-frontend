"use client";

import { FC, useEffect } from "react";

import { useTable } from "@/hooks/useTable";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/custom/form/Input";
import Button from "@/components/custom/Button";
import { Form } from "@/components/ui/form";
import { useParams } from "next/navigation";
import { useUpdateMutation } from "@/hooks/api/common/update";
import { useGetProfile } from "@/hooks/api/users/profile";
import {
  profileSchema,
  UpdateProfileSchemaType,
} from "@/schemas/user/profile.schema";

interface ProfilePageProps {}

const ProfilePage: FC<ProfilePageProps> = () => {
  const { data: profile } = useGetProfile();
  const { mutate, isPending, error } = useUpdateMutation({
    queryKey: "update-profile",
    endpoint: `users/profile`,
  });

  const form = useForm<UpdateProfileSchemaType>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    form.setValue("firstName", profile?.firstName || "");
    form.setValue("lastName", profile?.lastName || "");
    form.setValue("middleName", profile?.middleName || "");

    form.setValue("email", profile?.email || undefined);
    form.setValue("phoneNumber", profile?.phoneNumber || undefined);
  }, [profile]);

  const handleSubmit = (values: UpdateProfileSchemaType) => {
    mutate({
      data: {
        ...values,
      },
      onSuccess: {
        message: `Profile updated successfully`,
      },
    });
  };

  const {} = useTable({ title: "" });

  return (
    <div>
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
                </div>

                {error && <div className="text-red-500">{error.message}</div>}

                <div className="flex flex-col items-end">
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
