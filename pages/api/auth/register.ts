import type { NextApiRequest, NextApiResponse } from "next";

import { allowMethods, apiHandler, sendData } from "../../../lib/api";
import { registerUser } from "../../../lib/auth";
import { expectEmail, expectPassword, expectRecord, expectString, expectUserRole } from "../../../lib/validation";

export default apiHandler(async (request: NextApiRequest, response: NextApiResponse) => {
  allowMethods(request, response, ["POST"]);
  const body = expectRecord(request.body);
  const result = await registerUser({
    name: expectString(body, "name"),
    email: expectEmail(body, "email"),
    password: expectPassword(body, "password"),
    role: expectUserRole(body, "role"),
    company: expectString(body, "company")
  });

  sendData(response, result, 201);
});
