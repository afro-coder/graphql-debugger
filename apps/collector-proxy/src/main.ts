import { client } from "./client";
import { COLLECTOR_PORT } from "./config";
import { debug } from "./debug";
import { start } from "./index";

start({ port: COLLECTOR_PORT, client })
  .then(() => {
    debug("Online");
  })
  .catch((error) => {
    debug(error);
    process.exit(1);
  });
