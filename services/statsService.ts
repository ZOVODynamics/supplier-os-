import { matchSuppliers } from "../lib/ai";
import { db } from "../lib/db";
import type { InvestorStats } from "../lib/types";

export async function getInvestorStats(): Promise<InvestorStats> {
  const database = await db.read();
  const totalMatches = database.projects.reduce(
    (sum, project) => sum + matchSuppliers(project, database.suppliers).matches.length,
    0
  );

  return {
    totalUsers: database.users.length,
    totalProjects: database.projects.length,
    totalSuppliers: database.suppliers.length,
    totalMatches,
    selectedSuppliers: database.bids.filter((bid) => bid.status === "selected").length,
    systemStatus: "healthy"
  };
}
