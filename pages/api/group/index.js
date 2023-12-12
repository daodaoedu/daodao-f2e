import groupMockData from '../__mocks__/group.mock.json';

/**
 * 根據傳入的條件進行篩選
 * @param {string[]} itemValue - 資料的值
 * @param {string[]} conditionValue - 篩選條件的值
 * @returns {boolean} - 是否符合保留條件
 */
function filterBy(itemValue, conditionValue = []) {
  return (
    !conditionValue.length ||
    conditionValue.every((cond) => itemValue.includes(cond))
  );
}

function checkInvalidParameter(req, res, requiredParams) {
  const params = requiredParams.filter((param) => !req.query[param]);

  if (params.length) {
    res.status(400).json({
      message: 'Invalid parameter',
      params,
    });
    return true;
  }

  return false;
}

/**
 * 揪團 mock api
 * @param {import("next").NextApiRequest} req request 請求
 * @param {import("next").NextApiResponse} res response 回應
 */
export default function handler(req, res) {
  switch (req.method) {
    case 'GET': {
      if (checkInvalidParameter(req, res, ['limit'])) return;

      try {
        const { limit, q, edu, area, category, grouping } = req.query;
        const isGrouping = grouping === 'true';
        const end = Number(limit);
        const filterData = groupMockData
          .filter((item) => !q || item.title.includes(q))
          .filter((item) => !edu || edu.includes(item.partnerEducationStep))
          .filter((item) => !grouping || item.isGrouping === isGrouping)
          .filter((item) => filterBy(item.area.split('、'), area?.split(',')))
          .filter((item) => filterBy(item.category, category?.split(',')));

        const items = filterData.slice(0, end);

        res.status(200).json({
          items,
          total: filterData.length,
        });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
      break;
    }
    default:
  }
}
