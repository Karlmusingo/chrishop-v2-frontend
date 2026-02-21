"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { IUnknown } from "@/interface/Iunknown";
import LocationFilter from "./custom/LocationFilter";
import { ROLES } from "@/interface/roles";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export function DashboardComponent({
  dashboardData,
  userRole,
}: {
  dashboardData: IUnknown;
  userRole: ROLES;
}) {
  const dailySales = {
    labels: dashboardData?.dailySales?.map((item: IUnknown) => item.day) || [],
    datasets: [
      {
        label: "Ventes journalières",
        data:
          dashboardData?.dailySales?.map((item: IUnknown) => item.sales) || [],
        borderColor: "var(--accent-primary)",
        backgroundColor: "rgba(13, 110, 110, 0.15)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const salesByType = {
    labels:
      dashboardData?.salesByType?.map((item: IUnknown) => item.type) || [],
    datasets: [
      {
        label: "Ventes par type",
        data:
          dashboardData?.salesByType?.map(
            (item: IUnknown) => item.totalsales
          ) || [],
        backgroundColor: [
          "rgba(13, 110, 110, 0.7)",
          "rgba(13, 110, 110, 0.5)",
          "rgba(13, 110, 110, 0.35)",
          "rgba(13, 110, 110, 0.2)",
        ],
        borderRadius: 6,
      },
    ],
  };

  const salesByBrand = {
    labels:
      dashboardData?.salesByBrand?.map((item: IUnknown) => item.brand) || [],
    datasets: [
      {
        label: "Ventes par marque",
        data:
          dashboardData?.salesByBrand?.map(
            (item: IUnknown) => item.totalsales
          ) || [],
        backgroundColor: [
          "rgba(13, 110, 110, 0.7)",
          "rgba(13, 110, 110, 0.5)",
          "rgba(13, 110, 110, 0.35)",
          "rgba(13, 110, 110, 0.2)",
        ],
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: { family: "var(--font-mono)", size: 11 },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        type: "category" as const,
        grid: { display: false },
        ticks: { font: { family: "var(--font-mono)", size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.04)" },
        ticks: { font: { family: "var(--font-mono)", size: 11 } },
      },
    },
  };

  return (
    <div className="space-y-6">
      {userRole === ROLES.ADMIN && (
        <div className="flex justify-between items-center">
          <LocationFilter depot={false} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventes journalières</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={dailySales} options={chartOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ventes par type</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={salesByType} options={chartOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ventes par marque</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={salesByBrand} options={chartOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Résumé des ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {dashboardData?.salesSummary?.map((item: IUnknown) => (
                  <TableRow key={item.category}>
                    <TableCell className="font-mono text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                      {item.category}
                    </TableCell>
                    <TableCell className="text-right font-serif text-lg font-semibold">
                      {item.value}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alerte stock bas</CardTitle>
          <CardDescription>Articles nécessitant un réapprovisionnement</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Marque</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Boutique</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboardData?.lowStockItems?.map((item: IUnknown) => (
                <TableRow key={item.id}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item?.product?.brand}</TableCell>
                  <TableCell className="font-mono">{item.quantity}</TableCell>
                  <TableCell>{item.location?.name}</TableCell>
                  <TableCell>
                    <Badge variant={item?.status === "LOW_STOCK" ? "warning" : "error"}>
                      {item?.status === "LOW_STOCK" ? "STOCK BAS" : "RUPTURE"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
