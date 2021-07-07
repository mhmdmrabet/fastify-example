import t from "tap";
import sinon from "sinon";
import errors from "http-errors";
import fastify from "fastify";

const { test } = t;

function buildServer(opts) {
  return fastify().register(
    import("../../plugins/authenticate.js"),
    opts
  );
}

test("authenticate", async t => {
  // == Authentication fails
  t.test("Replies with error when authentication fails", async t => {
    const fastify = await buildServer({ JWT_SECRET: "supersecret" });
    const error = errors.Unauthorized();
    const request = { jwtVerify: sinon.stub().rejects(error) };
    const reply = { send: sinon.stub() };

    await t.resolves(fastify.authenticate(request, reply));
    sinon.assert.calledWith(reply.send, error);
  });

  // == Authentication succeeds
  t.test(
    "Resolves successfully when authentication succeeds",
    async t => {
      const fastify = await buildServer({
        JWT_SECRET: "supersecret",
      });

      const request = { jwtVerify: sinon.stub().resolves() };
      const reply = { send: sinon.stub() };

      await t.resolves(fastify.authenticate(request, reply));
      sinon.assert.notCalled(reply.send);
    }
  );
});
