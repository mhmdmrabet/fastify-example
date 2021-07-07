import Fastify from "fastify";
import { join } from "desm";
import fastifyAutoload from "fastify-autoload";

function buildServer(config) {
  const opts = {
    ...config,
    // logger: {
    //   level: config.LOG_LEVEL,
    //   prettyPrint: config.PRETTY_PRINT,
    //   pluginTimeout: 20000,
    // },
  };

  const fastify = Fastify(opts);

  // ==> DATABASE
  fastify.register(import("fastify-postgres"), {
    connectionString: opts.PG_CONNECTION_STRING,
  });

  // ==> PLUGINS
  fastify.register(fastifyAutoload, {
    dir: join(import.meta.url, "plugins"),
    options: opts,
  });

  // ==> ROUTES
  fastify.register(fastifyAutoload, {
    dir: join(import.meta.url, "routes"),
    options: opts,
  });

  // ==> Log info
  fastify.log.info("Fastify is starting up");

  //==> Fastify
  return fastify;
}

export default buildServer;
