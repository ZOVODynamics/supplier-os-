import type { NextApiRequest, NextApiResponse } from "next";

import { allowMethods, apiHandler, sendData } from "../../../lib/api";
import { expectEmail, expectRecord, expectString } from "../../../lib/validation";
import { loginUser } from "../../../services/authService";

export default apiHandler(async (request: NextApiRequest, response: NextApiResponse) => {
  allowMethods(request, response, ["POST"]);
  const body = expectRecord(request.body);
  const result = await loginUser({
    email: expectEmail(body, "email"),
    password: expectString(body, "password", { min: 1, max: 128 })
  });

  sendData(response, result);
});
