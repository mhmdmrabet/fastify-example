import t from "tap";
import fastify from "fastify";
import sinon from "sinon";

const { test } = t;

function buildServer() {
  return fastify()
    .decorate("pg", { query: sinon.stub() })
    .decorate("jwt", { sign: sinon.stub() })
    .register(import("../../routes/login.js"));
}

test("POST /login", async t => {
  // ==> RETURN 400
  t.test("Returns 400 with missing credentials", async t => {
    const fastify = buildServer();

    const res = await fastify.inject({
      url: "/login",
      method: "POST",
    });

    t.equal(res.statusCode, 400);
  });

  //==> RETURN 400 WITH PARTIAL CREDENTIALS
  t.test("returns 400 with partial credentials", async t => {
    const fastify = buildServer();

    const res = await fastify.inject({
      url: "/login",
      method: "POST",
      body: {
        email: "mohamed@tanke.fr",
      },
    });

    t.equal(res.statusCode, 400);
  });

  //==> RETURN 401 WITH WRONG CREDENTIALS
  t.test("returns 401 with wrong credentials", async t => {
    const fastify = buildServer();

    const res = await fastify.inject({
      url: "/login",
      method: "POST",
      body: {
        email: "mohamed@tanke.fr",
        password: "wrongpassword",
      },
    });

    t.equal(res.statusCode, 401);
  });

  //==> RETURN 401 WHEN USERS IS NOT IN DB
  t.test("returns 400 with wrong credentials", async t => {
    const fastify = buildServer();

    fastify.pg.query.resolves({ rows: [] });

    const res = await fastify.inject({
      url: "/login",
      method: "POST",
      body: {
        email: "mohamed@tanke.fr",
        password: "mohamed@tanke.fr",
      },
    });

    t.equal(res.statusCode, 401);
  });

  // ==> Return 500 DB ERROR
  t.test("returns 500 when database errors", async t => {
    const fastify = buildServer();

    fastify.pg.query.rejects(new Error("boom"));

    const res = await fastify.inject({
      url: "/login",
      method: "POST",
      body: {
        email: "alice",
        password: "alice",
      },
    });

    t.equal(res.statusCode, 500);
  });

  // ==>
  t.test("obtains a token with right credentials", async t => {
    const fastify = buildServer();

    fastify.pg.query.resolves({
      rows: [{ id: 1, username: "alice" }],
    });
    fastify.jwt.sign.returns("jwt token");

    const res = await fastify.inject({
      url: "/login",
      method: "POST",
      body: {
        email: "alice",
        password: "alice",
      },
    });

    t.equal(res.statusCode, 200);
    t.equal((await res.json()).token, "jwt token");
  });

  // ==> JWT signed
  t.test("stores the signed JWT", async () => {
    const fastify = buildServer();

    fastify.pg.query.resolves({
      rows: [{ id: 1, username: "alice" }],
    });
    fastify.jwt.sign.returns("jwt token");

    await fastify.inject({
      url: "/login",
      method: "POST",
      body: {
        email: "alice",
        password: "alice",
      },
    });

    sinon.assert.called(fastify.jwt.sign);
    sinon.assert.calledWith(fastify.jwt.sign, {
      email: "alice",
    });
  });
});
