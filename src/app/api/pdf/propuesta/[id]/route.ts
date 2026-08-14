import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Verificar sesión
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      walkthroughItems: {
        include: { activity: { select: { nameEs: true, nameEn: true } } },
      },
      proposal: true,
    },
  });

  if (!project || !project.proposal) {
    return NextResponse.json({ error: "Propuesta no encontrada" }, { status: 404 });
  }

  const lang = request.nextUrl.searchParams.get("lang") ?? "es";
  const isEnglish = lang === "en";

  // Generar HTML del PDF (limpio, sin costos internos)
  const date = new Date().toLocaleDateString(isEnglish ? "en-US" : "es-CA", {
    year: "numeric", month: "long", day: "numeric",
  });

  const activities = project.walkthroughItems.map((wi) =>
    isEnglish ? wi.activity.nameEn : wi.activity.nameEs
  );

  const finalPrice = parseFloat(project.proposal.finalPrice.toString());
  const fmtPrice = finalPrice.toLocaleString(isEnglish ? "en-US" : "es-CA", {
    style: "currency", currency: "USD",
  });

  const html = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${isEnglish ? "Proposal" : "Propuesta"} — ${project.name}</title>
  <style>
    @page { size: letter; margin: 0.75in; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 8.5in; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; background: #f1f5f9; padding: 40px 20px; }
    .page { max-width: 7in; margin: 0 auto; background: #fff; padding: 40px 48px; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 3px solid #e2521a; }
    .logo-img { max-height: 70px; width: auto; object-fit: contain; }
    .doc-info { text-align: right; }
    .doc-info p { font-size: 13px; color: #64748b; }
    .doc-info .ref { font-size: 11px; color: #94a3b8; margin-top: 4px; }
    h2 { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #e2521a; margin-bottom: 12px; margin-top: 32px; }
    .client-box { background: #f8fafc; border-left: 4px solid #001f50; padding: 16px 20px; border-radius: 0 8px 8px 0; }
    .client-box p { font-size: 14px; margin-bottom: 4px; }
    .client-box .name { font-size: 18px; font-weight: 700; color: #001f50; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { background: #001f50; color: #fff; text-align: left; padding: 10px 14px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
    tr:nth-child(even) td { background: #f8fafc; }
    .total-box { margin-top: 32px; display: flex; justify-content: flex-end; }
    .total-inner { background: #001f50; color: #fff; padding: 20px 28px; border-radius: 12px; text-align: right; min-width: 240px; }
    .total-inner .label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.7; }
    .total-inner .amount { font-size: 32px; font-weight: 900; color: #e2521a; margin-top: 4px; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
    .footer p { font-size: 11px; color: #94a3b8; }
    .badge { background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
    @media print { 
      body { padding: 0; background: #fff; width: auto; }
      .page { box-shadow: none; width: 100%; max-width: 100%; margin: 0; padding: 0; border-radius: 0; }
      .header { padding-top: 0; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>
        <img src="/logo.png" alt="CALA Multiservices" class="logo-img" />
      </div>
      <div class="doc-info">
        <p><strong>${isEnglish ? "Date" : "Fecha"}:</strong> ${date}</p>
        <p><strong>${isEnglish ? "Project" : "Proyecto"}:</strong> ${project.name}</p>
        <p class="ref">Ref: CALA-${id.slice(-6).toUpperCase()}</p>
      </div>
    </div>

    <h2>${isEnglish ? "Client Information" : "Información del Cliente"}</h2>
    <div class="client-box">
      <p class="name">${project.client.name}</p>
      ${project.client.contactName ? `<p>${project.client.contactName}</p>` : ""}
      ${project.client.email ? `<p>${project.client.email}</p>` : ""}
      ${project.client.address ? `<p>${project.client.address}</p>` : ""}
    </div>

    <h2>${isEnglish ? "Scope of Work" : "Alcance del Trabajo"}</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>${isEnglish ? "Work Item" : "Actividad"}</th>
        </tr>
      </thead>
      <tbody>
        ${activities.map((name, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${name}</td>
        </tr>`).join("")}
      </tbody>
    </table>

    <div class="total-box">
      <div class="total-inner">
        <div class="label">${isEnglish ? "Total Project Cost" : "Costo Total del Proyecto"}</div>
        <div class="amount">${fmtPrice}</div>
      </div>
    </div>

    <div class="footer">
      <div>
        <p>CALA Multiservices · © ${new Date().getFullYear()}</p>
        <p>${isEnglish ? "Thank you for your trust." : "Gracias por su confianza."}</p>
      </div>
      <span class="badge">${isEnglish ? "Official Proposal" : "Propuesta Oficial"}</span>
    </div>
  </div>
</body>
</html>
  `.trim();

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Para imprimir como PDF desde el navegador
      "X-Content-Type-Options": "nosniff",
    },
  });
}
