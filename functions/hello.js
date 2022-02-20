// GET requests to /filename would return "Hello, world!"
export const onRequestGet = () => {
  return new Response("Hello, world!");
};

// POST requests to /filename with a JSON-encoded body would return "Hello, <name>!"
export const onRequestPost = async ({ request }) => {
  const { name } = await request.json();
  return new Response(`Hello, ${name}!`);
};

// export default async function handler(req = {}, res) {
//   const result = await getVector(req);
//   res.setHeader("Cache-Control", "private, max-age=0");
//   res.status(200).json(result?.getVector || result);
// }
