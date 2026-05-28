import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.match.deleteMany();
  await prisma.request.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@zovo.com",
      name: "Admin User",
      password: hashedPassword,
      role: "admin",
    },
  });

  const companyUser1 = await prisma.user.create({
    data: {
      email: "company@demo.com",
      name: "TechCorp Inc.",
      password: hashedPassword,
      role: "company",
    },
  });

  const companyUser2 = await prisma.user.create({
    data: {
      email: "startup@demo.com",
      name: "Startup Labs",
      password: hashedPassword,
      role: "company",
    },
  });

  const supplierUser1 = await prisma.user.create({
    data: {
      email: "supplier1@demo.com",
      name: "Manufacturing Pro",
      password: hashedPassword,
      role: "supplier",
    },
  });

  const supplierUser2 = await prisma.user.create({
    data: {
      email: "supplier2@demo.com",
      name: "Logistics Express",
      password: hashedPassword,
      role: "supplier",
    },
  });

  // Create suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      name: "Manufacturing Pro",
      description: "Premium manufacturing services with 15+ years of experience in precision engineering and mass production.",
      skills: JSON.stringify(["CNC Machining", "3D Printing", "Injection Molding", "Assembly"]),
      categories: JSON.stringify(["Manufacturing", "Engineering", "Prototyping"]),
      rating: 4.8,
      totalJobs: 156,
      location: "Detroit, MI",
      verified: true,
      userId: supplierUser1.id,
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: "Logistics Express",
      description: "End-to-end logistics solutions including warehousing, fulfillment, and last-mile delivery.",
      skills: JSON.stringify(["Warehousing", "Fulfillment", "Shipping", "Inventory Management"]),
      categories: JSON.stringify(["Logistics", "Shipping", "Warehousing"]),
      rating: 4.6,
      totalJobs: 89,
      location: "Chicago, IL",
      verified: true,
      userId: supplierUser2.id,
    },
  });

  const supplier3 = await prisma.supplier.create({
    data: {
      name: "Tech Components Ltd",
      description: "Specialized in electronic components, PCB assembly, and IoT device manufacturing.",
      skills: JSON.stringify(["PCB Assembly", "Electronics", "IoT", "Quality Testing"]),
      categories: JSON.stringify(["Electronics", "Manufacturing", "IoT"]),
      rating: 4.9,
      totalJobs: 234,
      location: "San Jose, CA",
      verified: true,
    },
  });

  const supplier4 = await prisma.supplier.create({
    data: {
      name: "PackagingPlus",
      description: "Custom packaging solutions for all industries. Eco-friendly options available.",
      skills: JSON.stringify(["Custom Packaging", "Eco-Friendly", "Design", "Fulfillment"]),
      categories: JSON.stringify(["Packaging", "Design", "Fulfillment"]),
      rating: 4.5,
      totalJobs: 67,
      location: "Portland, OR",
      verified: false,
    },
  });

  const supplier5 = await prisma.supplier.create({
    data: {
      name: "RawMaterials Co",
      description: "Bulk raw material supplier with global sourcing network. Competitive pricing guaranteed.",
      skills: JSON.stringify(["Metal Sourcing", "Plastics", "Textiles", "Chemicals"]),
      categories: JSON.stringify(["Raw Materials", "Sourcing", "Import/Export"]),
      rating: 4.3,
      totalJobs: 412,
      location: "Houston, TX",
      verified: true,
    },
  });

  // Create requests
  const request1 = await prisma.request.create({
    data: {
      title: "Custom PCB Manufacturing - 10,000 Units",
      description: "Need a reliable manufacturer for custom PCB boards. Requirements include 4-layer design, lead-free soldering, and IPC Class 2 standards. Delivery within 6 weeks.",
      category: "Electronics",
      budget: 45000,
      status: "open",
      priority: "high",
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      userId: companyUser1.id,
    },
  });

  const request2 = await prisma.request.create({
    data: {
      title: "Warehouse Space - 5,000 sq ft",
      description: "Looking for temperature-controlled warehouse space in the Midwest region. Need 24/7 access, loading docks, and inventory management system integration.",
      category: "Logistics",
      budget: 12000,
      status: "matched",
      priority: "medium",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      userId: companyUser1.id,
    },
  });

  const request3 = await prisma.request.create({
    data: {
      title: "Injection Molding - Product Casings",
      description: "Seeking injection molding partner for durable ABS plastic casings. Initial order of 25,000 units with potential for ongoing production.",
      category: "Manufacturing",
      budget: 78000,
      status: "in_progress",
      priority: "high",
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      userId: companyUser2.id,
    },
  });

  const request4 = await prisma.request.create({
    data: {
      title: "Eco-Friendly Packaging Design",
      description: "Need custom eco-friendly packaging for our new product line. Should be biodegradable and visually appealing for retail shelves.",
      category: "Packaging",
      budget: 15000,
      status: "open",
      priority: "low",
      userId: companyUser2.id,
    },
  });

  const request5 = await prisma.request.create({
    data: {
      title: "Bulk Aluminum Sourcing",
      description: "Looking for reliable aluminum supplier. Need 6061-T6 aluminum sheets, approximately 50 tons per month ongoing.",
      category: "Raw Materials",
      budget: 125000,
      status: "completed",
      priority: "urgent",
      userId: companyUser1.id,
    },
  });

  // Create matches
  await prisma.match.create({
    data: {
      score: 92,
      status: "accepted",
      notes: "Excellent match based on category expertise and past performance.",
      requestId: request2.id,
      supplierId: supplier2.id,
    },
  });

  await prisma.match.create({
    data: {
      score: 88,
      status: "accepted",
      notes: "Strong manufacturing capabilities align with requirements.",
      requestId: request3.id,
      supplierId: supplier1.id,
    },
  });

  await prisma.match.create({
    data: {
      score: 95,
      status: "accepted",
      notes: "Perfect match - completed successfully.",
      requestId: request5.id,
      supplierId: supplier5.id,
    },
  });

  await prisma.match.create({
    data: {
      score: 85,
      status: "suggested",
      requestId: request1.id,
      supplierId: supplier3.id,
    },
  });

  await prisma.match.create({
    data: {
      score: 78,
      status: "suggested",
      requestId: request4.id,
      supplierId: supplier4.id,
    },
  });

  console.log("Database seeded successfully!");
  console.log("\nDemo accounts:");
  console.log("- Admin: admin@zovo.com / password123");
  console.log("- Company: company@demo.com / password123");
  console.log("- Supplier: supplier1@demo.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
