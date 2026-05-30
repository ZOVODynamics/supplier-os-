import type { NextApiRequest, NextApiResponse } from "next";

import { allowMethods, apiHandler, sendData } from "../../../lib/api";
import { expectEmail, expectPassword, expectRecord, expectString, expectUserRole } from "../../../lib/validation";
import { registerUser } from "../../../services/authService";

export default apiHandler(async (request: NextApiRequest, response: NextApiResponse) => {
  allowMethods(request, response, ["POST"]);
  const body = expectRecord(request.body);
  const result = await registerUser({
    name: expectString(body, "name", { max: 120 }),
    email: expectEmail(body, "email"),
    password: expectPassword(body, "password"),
    role: expectUserRole(body, "role"),
    company: expectString(body, "company", { max: 160 })
  });

  sendData(response, result, 201);
});
