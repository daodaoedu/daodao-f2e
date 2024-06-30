const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * proxy
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function handler(req, res) {
  try {
    const { slug, ...query } = req.query;
    const queryString = new URLSearchParams(query).toString();
    const headers = {
      'Content-Type': req.headers['content-type'],
      Authorization: req.headers.authorization,
    };

    const result = await fetch(`${BASE_URL}/${slug.join('/')}?${queryString}`, {
      method: req.method,
      headers,
      body:
        !req.method || req.method.toUpperCase() === 'GET'
          ? undefined
          : JSON.stringify(req.body),
    });
    const json = await result.json();
    res.status(200).json(json);
  } catch (err) {
    console.error(err);
    res.status(400);
  }
}
