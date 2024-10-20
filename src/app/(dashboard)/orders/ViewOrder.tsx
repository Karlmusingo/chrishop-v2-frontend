"use client";

import Modal from "@/components/ui/modal";
import Button from "@/components/custom/Button";
import { Switch } from "@/components/ui/switch";
import { savePDF } from "@progress/kendo-react-pdf";

import { FC, useRef, useState } from "react";

import { IUnknown } from "@/interface/Iunknown";
import { useUpdateMutation } from "@/hooks/api/common/update";
import { Printer } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
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

interface ViewOrderProps {
  callback?: () => void;
  orderData: IUnknown;
  isOpen?: boolean;
  onClose: () => void;
}

const ViewOrder: FC<ViewOrderProps> = ({
  callback,
  onClose,
  orderData,
  isOpen = false,
}) => {
  const [isPaid, setIsPaid] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const receiptElement = document.getElementById("print-invoice");

    if (receiptElement) {
      savePDF(
        receiptElement,
        {
          paperSize: "A6",
          margin: 0,
          scale: 0.7,
          fileName: "facture",
        },
        () =>
          setTimeout(() => {
            onClose();
          }, 1000)
      );
    }
  };

  const { mutate, isPending, error, isError } = useUpdateMutation({
    queryKey: "change-order-status",
    endpoint: "orders",
  });

  const onCheckChange = (check: boolean) => {
    if (check) {
      handleSubmit("PAID");
    } else {
      handleSubmit("PENDING");
    }
  };

  function callbackOnSuccess() {
    if (isPaid) {
      setIsPaid(false);
    } else {
      setIsPaid(true);
    }
    callback?.();
  }

  function callbackOnError() {
    setIsPaid(isPaid);
  }

  const handleSubmit = (status: string) => {
    mutate({
      id: `${orderData?.id}/buy`,
      data: {
        status: status,
      },
      onSuccess: {
        message: "Inventory transfered successfully",
        callback: callbackOnSuccess,
      },
      onError: {
        callback: callbackOnError,
      },
    });
  };

  const totalInvoicePrice = orderData?.orderItems?.reduce(
    (acc: number, curr: IUnknown) => acc + curr.totalPrice,
    0
  );

  return (
    <Modal
      title="Facture"
      description=""
      onClose={() => onClose?.()}
      isOpened={isOpen || false}
      classNames={{
        title: "text-2xl font-semibold",
        description: "text-sm",
        container: "w-full max-h-[90vh] overflow-y-auto sm:max-w-[700px]",
      }}
    >
      <div className="w-full max-w-3xl mx-auto relative">
        <Card className="w-full">
          <div ref={printRef} id="print-invoice">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold">Facture</CardTitle>
                <p className="text-sm">
                  Numero: #{`${orderData?.id?.slice(0, 8)}`}
                </p>
                <p className="text-sm">Statut: {orderData.status}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">
                  Date:{" "}
                  {new Date(
                    orderData?.createdAt || new Date()
                  ).toLocaleDateString()}
                </p>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">
                  Boutique: {orderData?.location?.name}
                </h2>
              </div>
              {/* <Table className=" border-collapse [&_td]:border-x [&_th]:border-x">
                <TableHeader className="border-b"> */}
              <Table className="border-collapse [&_td]:border-x [&_th]:border-x [&_td]:p-1 [&_th]:p-1">
                <TableHeader className="border-b bg-black text-white">
                  <TableRow>
                    <TableHead className="text-white h-auto">Type</TableHead>
                    <TableHead className="text-white h-auto">Marque</TableHead>
                    <TableHead className="text-white h-auto">Couleur</TableHead>
                    <TableHead className="text-white h-auto">Taille</TableHead>
                    <TableHead className="text-white h-auto">Colle</TableHead>
                    <TableHead className="text-white h-auto">Quant</TableHead>
                    <TableHead className="text-white h-auto">Prix</TableHead>
                    <TableHead className="text-white h-auto">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderData?.orderItems?.map((item: IUnknown) => (
                    <TableRow key={item.id}>
                      <TableCell>{item?.product?.type}</TableCell>
                      <TableCell>{item?.product?.brand}</TableCell>
                      <TableCell>{item?.product?.color}</TableCell>
                      <TableCell>{item?.product?.size}</TableCell>
                      <TableCell>{item?.product?.collarColor}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unitPrice}$</TableCell>
                      <TableCell>{item.totalPrice}$</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 text-xl font-bold text-right">
                Total: {totalInvoicePrice} $
              </div>
              {(orderData?.status === "PAID" || isPaid) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-green-500 text-8xl font-bold opacity-20 rotate-[-45deg] -translate-y-16">
                    PAYE
                  </p>
                </div>
              )}
            </CardContent>
          </div>
          <CardFooter className="flex justify-between items-center">
            <div className="flex items-center space-x-2 no-print">
              <Switch
                id="paid"
                checked={orderData?.status === "PAID" || isPaid}
                onCheckedChange={onCheckChange}
              />
              <Label htmlFor="paid">Facture payée</Label>
            </div>
            <Button
              onClick={handlePrint}
              className="no-print"
              loading={isPending}
              disabled={!(orderData?.status === "PAID" || isPaid)}
            >
              <Printer className="mr-2 h-4 w-4" /> Imprimer
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Modal>
  );
};

export default ViewOrder;
