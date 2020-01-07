module config {
  export const authenticationToken = process.env.AUTHENTICATION_TOKEN;
  export const repositorySource = "ethomson/sample-workflow2";
  export const repositoryTarget = repositorySource;
  export const allowForkPullRequests = true;
  export const dispatchEventType = "foobar";

  export const hostname = "0.0.0.0";
  export const port = process.env.PORT ? Number(process.env.PORT) : 3000;
}

export default config;
