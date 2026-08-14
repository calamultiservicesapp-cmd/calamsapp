"use server";

import { prisma } from "@/lib/db/prisma";

export async function getDashboardStats() {
  const [
    totalProyectosActivos,
    totalClientes,
    proyectos,
    citasEstaSemana,
    totalQuickJobsActivos
  ] = await Promise.all([
    prisma.project.count({
      where: {
        status: { notIn: ["cerrado"] }
      }
    }),
    prisma.client.count({
      where: { deletedAt: null }
    }),
    prisma.project.findMany({
      where: {
        status: { notIn: ["cerrado"] }
      },
      select: {
        status: true
      }
    }),
    prisma.appointment.count({
      where: {
        scheduledAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())), // Sunday of current week
          lt: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 7)) // Next Sunday
        }
      }
    }),
    prisma.quickJob.count({
      where: {
        status: { notIn: ["facturado"] }
      }
    })
  ]);

  const pipelineCounts = {
    cita: 0,
    caminata: 0,
    propuesta: 0,
    aprobado: 0,
    asignado: 0,
    en_ejecucion: 0,
    informe: 0,
    facturado: 0,
  };

  for (const p of proyectos) {
    if (pipelineCounts[p.status as keyof typeof pipelineCounts] !== undefined) {
      pipelineCounts[p.status as keyof typeof pipelineCounts]++;
    }
  }

  // Propuestas pendientes (estado propuesta)
  const propuestasPendientes = pipelineCounts.propuesta;

  return {
    stats: {
      proyectosActivos: totalProyectosActivos,
      clientes: totalClientes,
      propuestasPendientes,
      citasEstaSemana,
      quickJobsActivos: totalQuickJobsActivos
    },
    pipeline: pipelineCounts
  };
}
