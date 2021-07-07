import t from "tap";

import buildServer from "../../index.js";
import config from "../../config.js";

const { test } = t;

test("server", async t => {
  let fastify;

  t.beforeEach(async () => {
    fastify = buildServer(config);
  });

  t.teardown(() => fastify.close());

  // == LISTES USERS
  t.test("authenticates user and lists users", async t => {
    const loginRes = await fastify.inject({
      url: "/login",
      method: "POST",
      body: {
        email: "mohamed@tanke.fr",
        password: "mohamed@tanke.fr",
      },
    });

    const { token } = await loginRes.json();

    t.equal(loginRes.statusCode, 200);
    t.type(token, "string");

    const usersRes = await fastify.inject({
      url: "/users",
      headers: {
        authorization: `bearer ${token}`,
      },
    });

    t.equal(usersRes.statusCode, 200);

    const users = await usersRes.json();

    t.ok(Array.isArray(users));

    t.same(users, [{ id: 5, email: "mohamed@tanke.fr" }]);
  });
});
