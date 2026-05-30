import type { NextApiRequest, NextApiResponse } from "next";

import { allowMethods, apiHandler, sendData } from "../../../lib/api";
import { getAuthUser } from "../../../middleware/auth";
import { getInvestorStats } from "../../../services/statsService";

export default apiHandler(async (request: NextApiRequest, response: NextApiResponse) => {
  allowMethods(request, response, ["GET"]);
  await getAuthUser(request);
  sendData(response, await getInvestorStats());
});
