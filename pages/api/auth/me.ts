import type { NextApiRequest, NextApiResponse } from "next";

import { allowMethods, apiHandler, sendData } from "../../../lib/api";
import { getAuthUser } from "../../../middleware/auth";
import { publicUserById } from "../../../services/authService";

export default apiHandler(async (request: NextApiRequest, response: NextApiResponse) => {
  allowMethods(request, response, ["GET"]);
  const authUser = await getAuthUser(request);
  const user = await publicUserById(authUser.userId);
  sendData(response, user);
});
