export function fetchPartners({ pageSize = 10, page = 1, ...rest } = {}) {
  return {
    type: 'FETCH_PARTNERS',
    payload: {
      page,
      pageSize,
      ...rest,
    },
  };
}

export function fetchPartnerById({ id } = {}) {
  return {
    type: 'FETCH_PARTNER_BY_ID',
    payload: {
      id,
    },
  };
}

export function sendEmailToPartner(payload) {
  const { to, name, roleList, photoURL, text, information } = payload;
  return {
    type: 'SEND_EMAIL_TO_PARTNER',
    payload: {
      to, // 收件者信箱
      subject: '【島島阿學】點開 Email，認識新夥伴',
      title: '有新夥伴想認識你！',
      name, // 寄件者
      roleList: roleList.length ? roleList : [''], // 寄件者教育階段
      photoUrl: photoURL,
      text,
      information, //寄件者聯絡資訊
    },
  };
}
