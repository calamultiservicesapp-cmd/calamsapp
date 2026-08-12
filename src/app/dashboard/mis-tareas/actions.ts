"use server";

import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getMyTasks() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Find assignments for this technician's profile ID
  // Wait, user.id is auth.users.id, which should match Profile.id (assuming they are synced)
  return await prisma.projectAssignment.findMany({
    where: {
      technicianId: user.id,
      // Only show projects that are not closed or invoiced (or just ordered by date)
      project: {
        status: {
          notIn: ["cerrado", "facturado"]
        }
      }
    },
    include: {
      project: {
        include: {
          client: true,
        }
      }
    },
    orderBy: {
      startDate: "asc"
    }
  });
}
