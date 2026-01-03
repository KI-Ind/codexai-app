/**
 * Database Seed Script
 * Creates initial admin user and sample data
 */

import "dotenv/config";
import { registerUser } from "../server/authDb";
import { ingestDocument } from "../server/rag";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create admin user
    console.log("Creating admin user...");
    const adminEmail = process.env.ADMIN_EMAIL || "admin@codexai.local";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";
    const adminName = process.env.ADMIN_NAME || "Administrator";

    const admin = await registerUser({
      email: adminEmail,
      password: adminPassword,
      name: adminName,
      role: "admin",
    });

    console.log(`✅ Admin user created: ${admin.email}`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Role: ${admin.role}`);

    // Create sample legal document for RAG (skip if OpenAI API not available)
    console.log("\nCreating sample legal documents...");
    
    try {
      const sampleLegalText = `
Article 1134 du Code Civil (ancien)

Les conventions légalement formées tiennent lieu de loi à ceux qui les ont faites.
Elles ne peuvent être révoquées que de leur consentement mutuel, ou pour les causes que la loi autorise.
Elles doivent être exécutées de bonne foi.

Principe de la force obligatoire des contrats. Ce principe fondamental du droit des contrats
signifie que les parties sont liées par les obligations qu'elles ont librement consenties.
Le contrat fait la loi des parties.

Jurisprudence: Cour de Cassation, Chambre Civile 1, 10 juillet 2007, n° 06-14.768
La Cour rappelle que le principe de la force obligatoire des contrats s'applique même
en présence de circonstances imprévues, sauf clause de hardship ou force majeure.
      `.trim();

      await ingestDocument(
        0, // No specific document ID for sample data
        sampleLegalText,
        "legifrance",
        {
          code: "Code Civil",
          article: "1134",
          title: "Force obligatoire des contrats",
          date: "2007-07-10",
        }
      );

      console.log("✅ Sample legal document indexed");
    } catch (error) {
      console.log("⚠️  Skipping document indexing (OpenAI API not configured)");
      console.log("   You can add documents later through the application.");
    }

    console.log("\n✨ Seeding completed successfully!");
    console.log("\n📝 Login credentials:");
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log("\n⚠️  Please change the admin password after first login!");

  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) {
      console.log("ℹ️  Admin user already exists, skipping creation");
    } else {
      console.error("❌ Seeding failed:", error);
      throw error;
    }
  }

  process.exit(0);
}

seed().catch((error) => {
  console.error("Fatal error during seeding:", error);
  process.exit(1);
});
