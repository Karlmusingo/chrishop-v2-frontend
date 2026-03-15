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

  const title = orderData?.status === "PAID" || isPaid ? "Reçu" : "Facture";

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
            paperSize={[226.77, 841.89]}
            margin="2mm"
            fileName={`${title}-${(orderData?._id || "").toString().slice(0, 8).toUpperCase()}.pdf`}
          >
            <div
              id="print-invoice"
              style={{ color: "#000000", maxWidth: "576px" }}
            >
              <CardHeader className="flex flex-row justify-between items-start gap-2 pb-1">
                <div>
                  <CardTitle
                    className="font-bold leading-tight"
                    style={{ fontSize: "20px", color: "#000000" }}
                  >
                    {title}
                  </CardTitle>
                  <p
                    className="font-bold"
                    style={{ fontSize: "12px", color: "#000000" }}
                  >
                    #
                    {`${(orderData?._id || "")?.toString().slice(0, 8).toUpperCase()}`}
                    {" | "}
                    {{ PAID: "PAYÉ", PENDING: "EN ATTENTE", CANCEL: "ANNULÉ" }[
                      orderData.status as string
                    ] || orderData.status}
                  </p>
                </div>
                <p
                  className="whitespace-nowrap font-bold"
                  style={{ fontSize: "12px", color: "#000000" }}
                >
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
                <hr
                  className="receipt-line my-1"
                  style={{ borderTop: "2px dashed #000000" }}
                />
                <div className="mb-2">
                  <p
                    className="font-bold"
                    style={{ fontSize: "14px", color: "#000000" }}
                  >
                    {orderData?.location?.name}
                  </p>
                  {orderData?.seller && (
                    <p
                      className="font-bold"
                      style={{ fontSize: "12px", color: "#000000" }}
                    >
                      Vendeur:{" "}
                      {orderData.seller.firstName || orderData.seller.lastName
                        ? `${orderData.seller.firstName ?? ""} ${orderData.seller.lastName ?? ""}`.trim()
                        : (orderData.seller.name ?? "")}
                    </p>
                  )}
                </div>
                <hr
                  className="receipt-line my-1"
                  style={{ borderTop: "2px dashed #000000" }}
                />

                <Table className="border-collapse [&_td]:p-1 [&_th]:p-1">
                  <TableHeader>
                    <TableRow style={{ borderBottom: "2px solid #000000" }}>
                      <TableHead
                        className="h-auto font-black px-1"
                        style={{ fontSize: "12px", color: "#000000" }}
                      >
                        Article
                      </TableHead>
                      {/* <TableHead
                        className="h-auto font-black px-1 text-center"
                        style={{ fontSize: "12px", color: "#000000" }}
                      >
                        Taille
                      </TableHead> */}
                      <TableHead
                        className="h-auto font-black px-1 text-center"
                        style={{ fontSize: "12px", color: "#000000" }}
                      >
                        P.U
                      </TableHead>
                      <TableHead
                        className="h-auto font-black px-1 text-right"
                        style={{ fontSize: "12px", color: "#000000" }}
                      >
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
                        <TableRow
                          key={item._id || item.id}
                          style={{ borderBottom: "1px solid #000000" }}
                        >
                          <TableCell
                            className="py-1 px-1 whitespace-nowrap"
                            style={{
                              fontSize: "11px",
                              color: "#000000",
                              fontWeight: "normal",
                            }}
                          >
                            {parts.map((part) => (
                              <div key={part}>{part}</div>
                            ))}
                            {item?.product?.code && (
                              <div className="ml-1">({item.product.code})</div>
                            )}
                            {item?.product?.size && (
                              <div className="ml-1">{item?.product?.size}</div>
                            )}
                          </TableCell>
                          {/* <TableCell
                            className="py-1 px-1 text-center"
                            style={{
                              fontSize: "11px",
                              color: "#000000",
                              fontWeight: "normal",
                            }}
                          >
                            {item?.product?.size}
                          </TableCell> */}
                          <TableCell
                            className="py-1 px-1 text-center whitespace-nowrap"
                            style={{
                              fontSize: "11px",
                              color: "#000000",
                              fontWeight: "normal",
                            }}
                          >
                            {item.quantity} x {item.unitPrice}$
                          </TableCell>
                          <TableCell
                            className="py-1 px-1 text-right whitespace-nowrap font-bold"
                            style={{ fontSize: "11px", color: "#000000" }}
                          >
                            {item.totalPrice}$
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <hr
                  className="receipt-line my-1"
                  style={{ borderTop: "2px dashed #000000" }}
                />
                <div className="flex justify-between items-center mt-1">
                  <span
                    className="font-black"
                    style={{ fontSize: "16px", color: "#000000" }}
                  >
                    Total
                  </span>
                  <span
                    className="font-black"
                    style={{ fontSize: "18px", color: "#000000" }}
                  >
                    {totalInvoicePrice} $
                  </span>
                </div>

                {(orderData?.status === "PAID" || isPaid) && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p
                      className="font-black rotate-[-45deg] -translate-y-16"
                      style={{
                        fontSize: "48px",
                        color: "#000000",
                        opacity: 0.1,
                      }}
                    >
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
