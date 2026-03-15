"use client";

import Modal from "@/components/ui/modal";
import Button from "@/components/custom/Button";
import { Switch } from "@/components/ui/switch";

import { FC, useEffect, useRef, useState } from "react";

import { IUnknown } from "@/interface/Iunknown";
import { Download } from "lucide-react";
import { Label } from "@/components/ui/label";
import { PDFExport } from "@progress/kendo-react-pdf";
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
import { useMutationWithToast } from "@/hooks/convex/useMutationWithToast";
import { api } from "../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel";

interface ViewOrderProps {
  callback?: () => void;
  orderData: IUnknown;
  isOpen?: boolean;
  onClose: () => void;
}

const ViewOrder: FC<ViewOrderProps> = ({
  callback,
  onClose,
  orderData: order,
  isOpen = false,
}) => {
  const [isPaid, setIsPaid] = useState(false);
  const pdfExportRef = useRef<PDFExport>(null);

  const handlePrint = () => {
    pdfExportRef.current?.save();
  };

  const { mutate, isPending } = useMutationWithToast(api.functions.orders.buy);

  // If we have an orderId but not the full order data, fetch it
  const orderId = order?.orderId || order?._id;
  const singleOrder = useQuery(
    api.functions.orders.get,
    orderId ? { id: orderId as Id<"orders"> } : "skip",
  );

  const orderData: IUnknown = singleOrder ?? order;

  const onCheckChange = (check: boolean) => {
    if (check) {
      handleSubmit("PAID");
    } else {
      handleSubmit("PENDING");
    }
  };

  useEffect(() => {
    if (orderData?.status === "PAID") {
      setIsPaid(true);
    } else {
      setIsPaid(false);
    }
  }, [orderData?.status]);

  function callbackOnSuccess() {
    if (isPaid) {
      setIsPaid(false);
    } else {
      setIsPaid(true);
    }
    callback?.();
  }

  const handleSubmit = (status: string) => {
    mutate(
      {
        id: (orderData?._id || orderId) as any,
        status: status as any,
      },
      {
        successMessage: "Statut de la commande mis à jour",
        onSuccess: callbackOnSuccess,
      },
    );
  };

  const title = (orderData?.status === "PAID" || isPaid) ? "Reçu" : "Facture";

  const totalInvoicePrice = orderData?.orderItems?.reduce(
    (acc: number, curr: IUnknown) => acc + curr.totalPrice,
    0,
  );

  return (
    <Modal
      title={title}
      description=""
      onClose={() => onClose?.()}
      isOpened={isOpen || false}
      classNames={{
        title: "text-2xl font-semibold",
        description: "text-sm",
        container: "w-full max-h-[90vh] overflow-y-auto sm:max-w-[470px]",
      }}
    >
      <div className="w-full max-w-3xl mx-auto relative">
        <Card className="w-full">
          <PDFExport
            ref={pdfExportRef}
            paperSize="auto"
            margin="5mm"
            fileName={`${title}-${(orderData?._id || "").toString().slice(0, 8).toUpperCase()}.pdf`}
          >
          <div id="print-invoice">
            <CardHeader className="flex flex-row justify-between items-start gap-2 pb-1">
              <div>
                <CardTitle className="text-lg font-bold leading-tight">
                  {title}
                </CardTitle>
                <p className="text-xs">
                  #{`${(orderData?._id || "")?.toString().slice(0, 8).toUpperCase()}`}
                  {" | "}
                  {{ PAID: "PAYÉ", PENDING: "EN ATTENTE", CANCEL: "ANNULÉ" }[
                    orderData.status as string
                  ] || orderData.status}
                </p>
              </div>
              <p className="text-xs whitespace-nowrap">
                {new Date(
                  orderData?._creationTime ||
                    orderData?.createdAt ||
                    new Date(),
                ).toLocaleString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </p>
            </CardHeader>
            <CardContent className="relative pt-0">
              <hr className="receipt-line my-1 border-dashed" />
              <div className="mb-2">
                <p className="text-sm font-semibold">
                  {orderData?.location?.name}
                </p>
                {orderData?.seller && (
                  <p className="text-xs">
                    Vendeur:{" "}
                    {orderData.seller.firstName || orderData.seller.lastName
                      ? `${orderData.seller.firstName ?? ""} ${orderData.seller.lastName ?? ""}`.trim()
                      : (orderData.seller.name ?? "")}
                  </p>
                )}
              </div>
              <hr className="receipt-line my-1 border-dashed" />

              <Table className="border-collapse [&_td]:p-1 [&_th]:p-1">
                <TableHeader>
                  <TableRow className="border-b border-dashed border-black">
                    <TableHead className="h-auto text-xs font-bold px-1">
                      Article
                    </TableHead>
                    <TableHead className="h-auto text-xs font-bold px-1 text-center">
                      Taille
                    </TableHead>
                    <TableHead className="h-auto text-xs font-bold px-1 text-center">
                      Qté
                    </TableHead>
                    <TableHead className="h-auto text-xs font-bold px-1 text-right">
                      P.U
                    </TableHead>
                    <TableHead className="h-auto text-xs font-bold px-1 text-right">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderData?.orderItems?.map((item: IUnknown) => {
                    const parts = [
                      item?.product?.type,
                      item?.product?.brand,
                      item?.product?.color,
                      item?.product?.collarColor,
                    ].filter(Boolean);
                    return (
                      <TableRow key={item._id || item.id} className="border-b border-dotted">
                        <TableCell className="text-xs py-1 px-1 leading-snug">
                          {parts.join(" ")}
                          {item?.product?.code && (
                            <span className="ml-1">
                              ({item.product.code})
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs py-1 px-1 text-center">
                          {item?.product?.size}
                        </TableCell>
                        <TableCell className="text-xs py-1 px-1 text-center">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-xs py-1 px-1 text-right whitespace-nowrap">
                          {item.unitPrice}$
                        </TableCell>
                        <TableCell className="text-xs py-1 px-1 text-right whitespace-nowrap font-medium">
                          {item.totalPrice}$
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <hr className="receipt-line my-1 border-dashed" />
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm font-bold">Total</span>
                <span className="text-lg font-bold">{totalInvoicePrice} $</span>
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
          </PDFExport>
          <CardFooter className="flex justify-between items-center">
            <div className="flex items-center space-x-2 no-print">
              <Switch
                id="paid"
                checked={orderData?.status === "PAID" || isPaid}
                disabled={
                  orderData?.status === "CANCEL" ||
                  orderData?.status === "PAID" ||
                  isPaid
                }
                onCheckedChange={onCheckChange}
              />
              <Label htmlFor="paid">Facture payée</Label>
            </div>
            <Button
              onClick={handlePrint}
              loading={isPending}
              disabled={orderData?.status === "CANCEL"}
            >
              <Download className="mr-2 h-4 w-4" /> Télécharger PDF
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Modal>
  );
};

export default ViewOrder;
