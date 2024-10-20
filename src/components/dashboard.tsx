"use client";

import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IUnknown } from "@/interface/Iunknown";
import LocationFilter from "./custom/LocationFilter";

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
}: {
  dashboardData: IUnknown;
}) {
  const dailySales = {
    labels: dashboardData?.dailySales?.map((item: IUnknown) => item.day) || [],
    datasets: [
      {
        label: "Daily Sales",
        data:
          dashboardData?.dailySales?.map((item: IUnknown) => item.sales) || [],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.1,
      },
    ],
  };

  const salesByType = {
    labels:
      dashboardData?.salesByType?.map((item: IUnknown) => item.type) || [],
    datasets: [
      {
        label: "Sales by Type",
        data:
          dashboardData?.salesByType?.map(
            (item: IUnknown) => item.totalsales
          ) || [],
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
        ],
      },
    ],
  };

  const salesByBrand = {
    labels:
      dashboardData?.salesByBrand?.map((item: IUnknown) => item.brand) || [],
    datasets: [
      {
        label: "Sales by Brand",
        data:
          dashboardData?.salesByBrand?.map(
            (item: IUnknown) => item.totalsales
          ) || [],
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Chart.js Chart",
      },
    },
    scales: {
      x: {
        type: "category" as const,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <LocationFilter depot={false} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Daily Sales</CardTitle>
            {/* <CardDescription>{selectedLocation}</CardDescription> */}
          </CardHeader>
          <CardContent>
            <Line data={dailySales} options={chartOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={salesByType} options={chartOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Brand</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={salesByBrand} options={chartOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Summary</CardTitle>
            {/* <CardDescription>{selectedLocation}</CardDescription> */}
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {dashboardData?.salesSummary?.map((item: IUnknown) => (
                  <TableRow key={item.category}>
                    <TableCell className="font-medium">
                      {item.category}
                    </TableCell>
                    <TableCell className="text-right">{item.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Low Stock Alert</CardTitle>
          <CardDescription>Items that need restocking in</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboardData?.lowStockItems?.map((item: IUnknown) => (
                <TableRow key={item.id}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item?.product?.brand}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.location?.name}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">{item?.status}</Badge>
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
