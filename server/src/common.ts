import https from "https";
import querystring from "querystring";

import config from "./config";

module common {
  export const PROJECT_NAME = "escalator";
  export const VERSION = "0.0.1";

  export async function dispatch(repository: string, eventType: string) {
    const dispatch = `{"event_type": "${eventType}"}`;
    const basic = Buffer.from(`:${config.authenticationToken}`).toString(
      "base64"
    );

    const options = {
      method: "POST",
      hostname: "api.github.com",
      port: 443,
      path: "/repos/" + config.repositoryTarget + "/dispatches",
      headers: {
        Host: "api.github.com",
        Authorization: `Basic ${basic}`,
        "User-Agent": `${PROJECT_NAME}/${VERSION}`,
        Accept: "application/vnd.github.everest-preview+json",
        "Content-Type": "application/json",
        "Content-Length": dispatch.length
      }
    };

    return new Promise((resolve, reject) => {
      const request = https.request(options);
      request.on("response", response => {
        if (response.statusCode != 200 && response.statusCode != 204) {
          reject(
            new Error(
              `Invalid response: ${response.statusCode} ${response.statusMessage}`
            )
          );
        }

        response.on("data", data => {});
        response.on("end", () => {
          resolve();
        });
      });
      request.on("error", error => {
        reject(error);
      });
      request.write(dispatch);
      request.end();
    });
  }

  export async function respondToQuery(query: string) {
    const request = querystring.parse(query);

    if (!request.payload) {
      throw new Error("No payload in request");
    }

    const payload = JSON.parse(request.payload.toString());

    if (payload.repository.full_name != config.repositorySource) {
      throw new Error("Invalid source repository");
    }

    if (
      !config.allowForkPullRequests &&
      payload.pull_request &&
      payload.pull_request.head.repo.full_name != config.repositorySource
    ) {
      throw new Error("Invalid request from fork");
    }

    await dispatch(config.repositoryTarget, config.dispatchEventType);
  }
}

export default common;
