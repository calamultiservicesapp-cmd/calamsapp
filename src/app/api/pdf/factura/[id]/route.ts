import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
      invoice: true,
    },
  });

  if (!project || !project.invoice) {
    return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
  }

  const lang = request.nextUrl.searchParams.get("lang") ?? "es";
  const isEnglish = lang === "en";

  const date = new Date(project.invoice.issuedAt).toLocaleDateString(isEnglish ? "en-US" : "es-CA", {
    year: "numeric", month: "long", day: "numeric",
  });

  const dueDateObj = new Date(project.invoice.issuedAt);
  dueDateObj.setDate(dueDateObj.getDate() + 15); // Default 15 days due date
  const dueDate = dueDateObj.toLocaleDateString(isEnglish ? "en-US" : "es-CA", {
    year: "numeric", month: "long", day: "numeric",
  });

  const activities = project.walkthroughItems.map((wi) =>
    isEnglish ? wi.activity.nameEn : wi.activity.nameEs
  );

  const amount = parseFloat(project.invoice.amount.toString());
  const fmtPrice = amount.toLocaleString(isEnglish ? "en-US" : "es-CA", {
    style: "currency", currency: "USD",
  });

  const html = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${isEnglish ? "Invoice" : "Factura"} — ${project.invoice.invoiceNumber}</title>
  <style>
    @page { size: letter; margin: 0.75in; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 8.5in; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; background: #f1f5f9; padding: 40px 20px; }
    .page { max-width: 7in; margin: 0 auto; background: #fff; padding: 40px 48px; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 3px solid #e2521a; }
    .logo-img { max-height: 70px; width: auto; object-fit: contain; }
    .doc-info { text-align: right; }
    .doc-title { font-size: 36px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase; color: #e2521a; margin-bottom: 8px; }
    .doc-info p { font-size: 13px; color: #64748b; }
    .doc-info .ref { font-size: 14px; font-weight: 600; color: #1e293b; margin-top: 4px; }
    .flex-row { display: flex; justify-content: space-between; margin-bottom: 32px; gap: 40px; }
    .flex-col { flex: 1; }
    h2 { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 8px; }
    .info-box { background: #f8fafc; border-left: 4px solid #001f50; padding: 16px 20px; border-radius: 0 8px 8px 0; height: 100%; }
    .info-box p { font-size: 14px; margin-bottom: 4px; }
    .info-box .name { font-size: 16px; font-weight: 700; color: #001f50; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { background: #001f50; color: #fff; text-align: left; padding: 12px 16px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    th.right { text-align: right; }
    td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) td { background: #f8fafc; }
    .total-section { margin-top: 32px; display: flex; justify-content: flex-end; }
    .total-box { width: 300px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #64748b; }
    .total-row.grand { border-top: 2px solid #e2521a; margin-top: 8px; padding-top: 16px; font-size: 20px; font-weight: 700; color: #1e293b; }
    .total-row.grand .amount { color: #e2521a; }
    .footer { margin-top: 64px; padding-top: 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
    .footer p { font-size: 11px; color: #94a3b8; }
    .badge { padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; display: inline-block; }
    .badge.paid { background: #dcfce7; color: #166534; }
    .badge.pending { background: #fef08a; color: #854d0e; }
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
        <div class="doc-title">${isEnglish ? "Invoice" : "Factura"}</div>
        <p class="ref">${project.invoice.invoiceNumber}</p>
        <p style="margin-top: 8px;"><strong>${isEnglish ? "Issue Date" : "Fecha Emisión"}:</strong> ${date}</p>
        <p><strong>${isEnglish ? "Due Date" : "Vencimiento"}:</strong> ${dueDate}</p>
      </div>
    </div>

    <div class="flex-row">
      <div class="flex-col">
        <h2>${isEnglish ? "Bill To" : "Facturar A"}</h2>
        <div class="info-box">
          <p class="name">${project.client.name}</p>
          ${project.client.contactName ? `<p>${project.client.contactName}</p>` : ""}
          ${project.client.email ? `<p>${project.client.email}</p>` : ""}
          ${project.client.address ? `<p>${project.client.address}</p>` : ""}
        </div>
      </div>
      <div class="flex-col">
        <h2>${isEnglish ? "Project Details" : "Detalles del Proyecto"}</h2>
        <div class="info-box" style="border-left-color: #e2521a;">
          <p class="name">${project.name}</p>
          <p>Ref: CALA-${id.slice(-6).toUpperCase()}</p>
          <div style="margin-top: 16px;">
            <span class="badge ${project.invoice.status === 'pagada' ? 'paid' : 'pending'}">
              ${project.invoice.status === 'pagada' ? (isEnglish ? 'Paid' : 'Pagada') : (isEnglish ? 'Pending' : 'Pendiente')}
            </span>
          </div>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>${isEnglish ? "Description" : "Descripción"}</th>
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

    <div class="total-section">
      <div class="total-box">
        <div class="total-row grand">
          <span>${isEnglish ? "Total Due" : "Total a Pagar"}</span>
          <span class="amount">${fmtPrice}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <div>
        <p>CALA Multiservices · © ${new Date().getFullYear()}</p>
        <p>${isEnglish ? "Thank you for your business." : "Gracias por su negocio."}</p>
      </div>
    </div>
  </div>
  <script>
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('download') === 'true') {
      window.onload = function() { window.print(); }
    } else {
      function fitPage() {
        const availableWidth = window.innerWidth;
        const scale = availableWidth < 816 ? availableWidth / 816 : 1;
        document.body.style.transform = 'scale(' + scale + ')';
        document.body.style.transformOrigin = 'top left';
        // Adjust the html height to prevent massive blank space at the bottom
        document.documentElement.style.height = (document.body.offsetHeight * scale) + 'px';
        document.documentElement.style.overflowX = 'hidden';
      }
      window.addEventListener('resize', fitPage);
      window.addEventListener('load', fitPage);
      fitPage();
    }
  </script>
</body>
</html>
  `.trim();

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
