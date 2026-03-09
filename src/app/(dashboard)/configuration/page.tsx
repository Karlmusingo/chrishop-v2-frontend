"use client";

import { FC, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import PageHeader from "@/components/custom/PageHeader";
import AttributeTable from "./AttributeTable";
import BrandTable from "./BrandTable";
import SizeTable from "./SizeTable";
import PackagingTemplateTable from "./PackagingTemplateTable";

const tabs = [
  { key: "types", label: "Types" },
  { key: "brands", label: "Marques" },
  { key: "colors", label: "Couleurs" },
  { key: "sizes", label: "Tailles" },
  { key: "packaging", label: "Emballages" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

const ConfigurationPage: FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("types");

  const types = useQuery(api.functions.productTypes.list, {}) ?? [];
  const brands = useQuery(api.functions.productBrands.list, {}) ?? [];
  const colors = useQuery(api.functions.productColors.list, {}) ?? [];
  const sizes = useQuery(api.functions.productSizes.list, {}) ?? [];
  const packagingTemplates =
    useQuery(api.functions.packagingTemplates.list, {}) ?? [];

  return (
    <div>
      <PageHeader
        title="Configuration"
        subtitle="Gérez les attributs de vos produits"
      />

      <div className="mb-6 flex gap-1 rounded-lg border bg-[#F8F8F8] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "types" && (
        <AttributeTable
          categoryLabel="Type"
          items={types}
          createMutation={api.functions.productTypes.create}
          updateMutation={api.functions.productTypes.update}
          removeMutation={api.functions.productTypes.remove}
        />
      )}

      {activeTab === "brands" && (
        <BrandTable
          brands={brands}
          typeOptions={types.map((t) => ({ label: t.value, value: t._id }))}
        />
      )}

      {activeTab === "colors" && (
        <AttributeTable
          categoryLabel="Couleur"
          items={colors}
          createMutation={api.functions.productColors.create}
          updateMutation={api.functions.productColors.update}
          removeMutation={api.functions.productColors.remove}
        />
      )}

      {activeTab === "sizes" && (
        <SizeTable sizes={sizes as any} />
      )}

      {activeTab === "packaging" && (
        <PackagingTemplateTable items={packagingTemplates as any} />
      )}
    </div>
  );
};

export default ConfigurationPage;
