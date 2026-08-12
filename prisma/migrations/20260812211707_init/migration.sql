-- CreateEnum
CREATE TYPE "Role" AS ENUM ('superadmin', 'operador', 'tecnico');

-- CreateEnum
CREATE TYPE "PersonnelType" AS ENUM ('contratista', 'tecnico_novato', 'tecnico_experto');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('cita', 'caminata', 'propuesta', 'aprobado', 'asignado', 'en_ejecucion', 'informe', 'facturado', 'cerrado');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('borrador', 'enviada', 'aprobada', 'rechazada');

-- CreateEnum
CREATE TYPE "ReportItemStatus" AS ENUM ('completado', 'con_desviacion', 'no_completado');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('pendiente', 'pagada');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "contact_name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_config" (
    "id" UUID NOT NULL,
    "contractor_day_rate" DECIMAL(10,2) NOT NULL DEFAULT 500,
    "novice_tech_day_rate" DECIMAL(10,2) NOT NULL DEFAULT 160,
    "expert_tech_day_rate" DECIMAL(10,2) NOT NULL DEFAULT 250,
    "standard_hours_per_day" DECIMAL(5,2) NOT NULL DEFAULT 8,
    "overhead_per_project" DECIMAL(10,2) NOT NULL DEFAULT 199,
    "profit_margin" DECIMAL(5,2) NOT NULL DEFAULT 15,
    "updated_by" UUID NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" UUID NOT NULL,
    "name_es" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "description_es" TEXT NOT NULL,
    "description_en" TEXT NOT NULL,
    "default_personnel_type" "PersonnelType" NOT NULL,
    "min_hours" DECIMAL(5,2) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'cita',
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "walkthrough_items" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "activity_id" UUID NOT NULL,
    "personnel_type" "PersonnelType" NOT NULL,
    "hours" DECIMAL(5,2) NOT NULL,
    "rate_snapshot" DECIMAL(10,2) NOT NULL,
    "computed_price" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "walkthrough_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "list_price" DECIMAL(10,2) NOT NULL,
    "floor_price" DECIMAL(10,2) NOT NULL,
    "discount_applied" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "final_price" DECIMAL(10,2) NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'borrador',
    "pdf_url_es" TEXT,
    "pdf_url_en" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_assignments" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "technician_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "notes" TEXT,

    CONSTRAINT "project_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "field_reports" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "submitted_by" UUID NOT NULL,
    "submitted_at" TIMESTAMP(3),
    "pdf_url_es" TEXT,
    "pdf_url_en" TEXT,

    CONSTRAINT "field_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "field_report_items" (
    "id" UUID NOT NULL,
    "field_report_id" UUID NOT NULL,
    "walkthrough_item_id" UUID NOT NULL,
    "status" "ReportItemStatus" NOT NULL,
    "notes" TEXT,

    CONSTRAINT "field_report_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'pendiente',
    "pdf_url_es" TEXT,
    "pdf_url_en" TEXT,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appointments_project_id_key" ON "appointments"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "proposals_project_id_key" ON "proposals"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "field_reports_project_id_key" ON "field_reports"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "field_report_items_walkthrough_item_id_key" ON "field_report_items"("walkthrough_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_project_id_key" ON "invoices"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "walkthrough_items" ADD CONSTRAINT "walkthrough_items_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "walkthrough_items" ADD CONSTRAINT "walkthrough_items_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_assignments" ADD CONSTRAINT "project_assignments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_assignments" ADD CONSTRAINT "project_assignments_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_reports" ADD CONSTRAINT "field_reports_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_reports" ADD CONSTRAINT "field_reports_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_report_items" ADD CONSTRAINT "field_report_items_field_report_id_fkey" FOREIGN KEY ("field_report_id") REFERENCES "field_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_report_items" ADD CONSTRAINT "field_report_items_walkthrough_item_id_fkey" FOREIGN KEY ("walkthrough_item_id") REFERENCES "walkthrough_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
