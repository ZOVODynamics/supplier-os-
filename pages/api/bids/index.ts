import type { NextApiRequest, NextApiResponse } from "next";

import { allowMethods, apiHandler, sendData } from "../../../lib/api";
import { expectRecord, expectString } from "../../../lib/validation";
import { requireRole } from "../../../middleware/auth";
import { listBids, selectSupplier } from "../../../services/bidService";

export default apiHandler(async (request: NextApiRequest, response: NextApiResponse) => {
  allowMethods(request, response, ["GET", "POST"]);
  await requireRole(request, "BUYER");

  if (request.method === "GET") {
    sendData(response, await listBids());
    return;
  }

  const body = expectRecord(request.body);
  const bid = await selectSupplier({
    projectId: expectString(body, "projectId", { max: 120 }),
    supplierId: expectString(body, "supplierId", { max: 120 }),
    notes: "Selected from investor demo AI matching flow"
  });

  sendData(response, bid, 201);
});
