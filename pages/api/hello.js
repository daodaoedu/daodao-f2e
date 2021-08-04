// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// 目前使用Next產生靜態網頁，原則上這裡不會需要用到
// 以後架後端的時候再考慮使用
export default function handler(req, res) {
  res.status(200).json({ name: 'John Doe' });
}
