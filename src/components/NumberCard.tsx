import React from "react";
import Link from "next/link";
import Card from "@/components/custom/Card";

export const NumberCard: React.FC<{
  title: string;
  description: string;
  number: number;
  link?: string;
  linkTitle: string;
}> = ({ title, description, number, link, linkTitle }) => {
  return (
    <Card title={title} description={description} className="w-[230px] p-0">
      <div className="text-4xl font-bold">{number}</div>

      {link && (
        <Link
          href={link}
          className="text-sm font-medium hover:underline"
          prefetch={false}
        >
          {linkTitle}
        </Link>
      )}
    </Card>
  );
};
