import { createClient } from "@supabase/supabase-js";
import { prisma } from "./src/lib/db/prisma";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function createAdmin() {
  console.log("Registrando usuario en Supabase Auth...");
  
  const { data, error } = await supabase.auth.signUp({
    email: "calamultiservices.app@gmail.com",
    password: "Acceso2026",
  });

  if (error) {
    console.error("Error al registrar:", error.message);
    return;
  }

  const userId = data.user?.id;
  if (!userId) {
    console.error("No se obtuvo un ID de usuario válido.");
    return;
  }

  console.log(`Usuario creado en Auth con ID: ${userId}`);
  console.log("Creando perfil de Superadmin en la base de datos...");

  try {
    const profile = await prisma.profile.create({
      data: {
        id: userId,
        fullName: "CALA Admin",
        role: "superadmin"
      }
    });
    console.log("¡Perfil de superadmin creado exitosamente!");
    console.log(profile);
  } catch (err: any) {
    // Si da error de "ya existe", lo actualizamos
    if (err.code === 'P2002') {
       await prisma.profile.update({
         where: { id: userId },
         data: { role: "superadmin" }
       });
       console.log("El perfil ya existía, se le asignó el rol superadmin.");
    } else {
       console.error("Error al crear perfil:", err);
    }
  }
}

createAdmin()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
