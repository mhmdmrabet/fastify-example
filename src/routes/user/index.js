import S from "fluent-json-schema";

const schema = {
  response: {
    200: S.object().prop("email", S.string().required()),
  },
};

export default async function user(fastify) {
  fastify.get(
    "/",
    {
      onRequest: [fastify.authenticate],
      schema,
    },
    async request => request.user
  );
}
