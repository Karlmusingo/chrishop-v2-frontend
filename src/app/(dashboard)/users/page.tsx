"use client";

import { FC, Suspense, useState } from "react";

import { useQueryString } from "@/hooks/useQueryString";
import { useTable } from "@/hooks/useTable";

import { DataList } from "@/components/custom/list/DataList";
import Confirm from "@/components/custom/Confirm";

import { filterOptions, getColumns } from "./table";
import AddUser from "./AddUser";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useActionWithToast } from "@/hooks/convex/useActionWithToast";
import { Id } from "../../../../convex/_generated/dataModel";
import { IUnknown } from "@/interface/Iunknown";

interface UsersPageProps {}

const UsersPage: FC<UsersPageProps> = () => {
  const { getQueryObject } = useQueryString();
  const filters = getQueryObject(["role", "status"]);

  const users =
    useQuery(api.functions.users.list, {
      role: filters.role as any,
      status: filters.status as any,
      search: filters.search as string | undefined,
    }) ?? [];

  const {} = useTable({ title: "" });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserData, setSelectedUserData] = useState<IUnknown | null>(
    null,
  );

  const { mutate: resetPassword, isPending: isResetting } = useActionWithToast(
    api.functions.usersActions.resetPassword,
  );

  const handleResetPassword = (id: string, extraData?: IUnknown) => {
    setSelectedUserId(id);
    setSelectedUserData(extraData ?? null);
    setConfirmOpen(true);
  };

  const handleConfirmReset = async () => {
    if (!selectedUserId) return;
    try {
      await resetPassword(
        { userId: selectedUserId as Id<"users"> },
        {
          successMessage: "Mot de passe réinitialisé avec succès",
          onSuccess: () => {
            setConfirmOpen(false);
            setSelectedUserId(null);
            setSelectedUserData(null);
          },
        },
      );
    } catch {
      // error is handled by useActionWithToast
    }
  };

  const userName = selectedUserData
    ? `${selectedUserData.firstName ?? ""} ${selectedUserData.lastName ?? ""}`.trim()
    : "";

  return (
    <div>
      <div>
        <h2 className=" text-[1.2em] font-semibold">Users </h2>
        <p className=" text-sm text-slate-500">
          Manage users and their accounts here.
        </p>
      </div>
      <div className="py-4">
        <Suspense fallback={<div>Loading...</div>}>
          <DataList
            columns={getColumns({ onResetPassword: handleResetPassword })}
            data={(users || []) as any[]}
            state={{ loading: users === undefined }}
            filter={{
              options: { tab: filterOptions },
              filterKey: "role",
            }}
            action={<AddUser />}
          />
        </Suspense>
      </div>

      <Confirm
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        isLoading={isResetting}
        title="Réinitialiser le mot de passe"
        description={`Êtes-vous sûr de vouloir réinitialiser le mot de passe de ${userName || "cet utilisateur"} ? Un nouveau mot de passe sera généré et envoyé par email.`}
      />
    </div>
  );
};
export default UsersPage;
