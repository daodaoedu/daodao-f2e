import { BASE_URL } from '@/constants/common';

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
  const { userId, from, to, name, roleList, photoURL, text, information } =
    payload;
  return {
    type: 'SEND_EMAIL_TO_PARTNER',
    payload: {
      from,
      userId, //寄件者id
      url: location.origin,
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

export function fetchPartnerTags() {
  return {
    type: 'FETCH_PARTNER_TAGS',
  };
}
