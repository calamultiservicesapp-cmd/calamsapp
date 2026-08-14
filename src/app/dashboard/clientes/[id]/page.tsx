import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClientHistory } from "../actions";
import { ClientDetail } from "@/components/clientes/client-detail";

export const metadata: Metadata = {
  title: "Historial de Cliente | CALA Multiservices",
};

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClientHistory(id);

  if (!client) {
    notFound();
  }

  return <ClientDetail client={client} />;
}
