export default function handler(req, res) {
  switch (req.method) {
    case 'POST': {
      return fetch('https://api.notion.com/v1/databases/3280294e76f04a7da209fe7aeb74da8b/query', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer secret_XGDgOxDfhXaiMnpfJJjsnWagcKIoGgfXIH8Dve97WKm',
          'Notion-Version': '2021-05-13',
          'content-type': 'application/json; charset=utf-8',
        },
      })
        .then((response) => response.json())
        .then((json) => {
          console.log('json: ', json);
          res.status(200).json(json);
        }).catch(() => {
          res.status(403);
        });
    }
    default: {
      return res.status(403);
    }
  }
}
