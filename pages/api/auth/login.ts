import type { NextApiRequest, NextApiResponse } from "next";

import { allowMethods, apiHandler, sendData } from "../../../lib/api";
import { loginUser } from "../../../lib/auth";
import { expectEmail, expectRecord, expectString } from "../../../lib/validation";

export default apiHandler(async (request: NextApiRequest, response: NextApiResponse) => {
  allowMethods(request, response, ["POST"]);
  const body = expectRecord(request.body);
  const result = await loginUser({
    email: expectEmail(body, "email"),
    password: expectString(body, "password")
  });

  sendData(response, result);
});
