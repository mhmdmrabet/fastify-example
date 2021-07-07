import S from "fluent-json-schema";

const schema = {
  response: {
    200: S.object().prop("message", S.string().required()),
  },
};

export default async function users(fastify) {
  fastify.get("/", { schema }, async request => {
    request.log.info("Home route called");
    return { message: "Hi, Every Body!" };
  });
}
