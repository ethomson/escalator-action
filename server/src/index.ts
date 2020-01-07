import http from "http";

import common from "./common";
import config from "./config";

function sendError(response: http.ServerResponse, message: string) {
  response.writeHead(403, { "Content-Type": "text/html" });
  response.end(
    "<html>\n" +
      "<head>\n<title>" +
      message +
      "</title></head>\n" +
      "<body><h1>" +
      message +
      "</h1></body>\n" +
      "</html>\n"
  );
}

const server = http.createServer((request, response) => {
  try {
    var postData = "";

    if (request.method != "POST") {
      sendError(response, "Invalid request");
      return;
    }

    request.on("data", data => {
      postData += data;

      if (postData.length > 1024 * 1024) {
        sendError(response, "Data too long");
        return;
      }
    });

    request.on("end", async () => {
      try {
        console.log("Received dispatch request");

        await common.respondToQuery(postData);

        response.statusCode = 200;
        response.setHeader("Content-Type", "text/plain");
        response.end("Dispatched!\n");
      } catch (error) {
        sendError(response, error);
        return;
      }
    });
  } catch (error) {
    console.error(error);
  }
});

server.listen(config.port, config.hostname, () => {
  console.log("Server running...");
});
