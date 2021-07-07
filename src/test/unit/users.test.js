import fastify from "fastify";
import errors from "http-errors";
import sinon from "sinon";
import t from "tap";
const { test } = t;

function buildServer() {
  return fastify()
    .decorate("authenticate", sinon.stub())
    .register(import("./../../routes/user/index.js"));
}

test("GET /", async t => {
  // === RETURN ERROR
  t.test("Returns error when authentication fails", async t => {
    const fastify = buildServer();

    fastify.authenticate.rejects(errors.Unauthorized());

    const res = await fastify.inject("/");

    sinon.assert.called(fastify.authenticate);

    t.equal(res.statusCode, 401);
  });

  // === RETURN USER
  t.test(
    "Returns current user when authentication succeeds",
    async t => {
      const fastify = buildServer();
      fastify.authenticate.callsFake(async request => {
        request.user = { email: "mohamed@tanke.fr" };
      });

      const res = await fastify.inject("/");

      t.equal(res.statusCode, 200);
      t.same(await res.json(), { email: "mohamed@tanke.fr" });
    }
  );
});
