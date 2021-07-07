import buildServer from "./index.js";
import config from "./config.js";

const fastify = buildServer(config);

const start = async function () {
  try {
    await fastify.listen(4000);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
