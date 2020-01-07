import { AzureFunction, Context, HttpRequest } from "@azure/functions";

import common from "./common";

function sendError(context: Context, message: string) {
  context.res = {
    status: 403,
    mimetype: "text/html",
    body:
      "<html>\n" +
      "<head>\n<title>" +
      message +
      "</title></head>\n" +
      "<body><h1>" +
      message +
      "</h1></body>\n" +
      "</html>\n"
  };
}

const trigger: AzureFunction = async function(
  context: Context,
  request: HttpRequest
): Promise<void> {
  context.log("Received dispatch request");

  if (request.method != "POST" || !request.body) {
    sendError(context, "Invalid request");
    return;
  }

  try {
    await common.respondToQuery(request.body);
  } catch (error) {
    sendError(context, error);
    return;
  }

  context.res = {
    mimetype: "text/plain",
    body: "Dispatched!\n"
  };
};

export default trigger;
