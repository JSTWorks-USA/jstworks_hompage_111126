/**
 * 문의하기 개인정보 수집·이용 안내 (문의 폼의 "개인정보처리방침에 동의합니다" 창에 보이는 내용).
 * 기본 문안입니다. 공개 전에 법무 검토를 받아 확정해 주세요.
 */
export type PolicySection = { title: string; body: string };

export const PRIVACY_POLICY = {
  ko: {
    title: "개인정보처리방침",
    intro: "조슈아트리웍스 주식회사(이하 \"회사\")는 문의하기로 받은 개인정보를 아래와 같이 처리합니다.",
    sections: [
      { title: "1. 수집하는 항목", body: "문의 유형, 이름, 회사명, 이메일 주소, 연락처, 문의 내용" },
      { title: "2. 수집·이용 목적", body: "문의 내용 확인과 답변, 협업·투자 상담을 위한 연락" },
      {
        title: "3. 보유·이용 기간",
        body: "문의 처리가 끝난 날부터 1년간 보관한 뒤 지체 없이 파기합니다. 다른 법령에서 보관 기간을 정한 경우에는 그 기간을 따릅니다.",
      },
      {
        title: "4. 처리 위탁",
        body: "문의 내용은 메일 전송 서비스 Web3Forms를 거쳐 회사 메일로 전달됩니다. Web3Forms는 전달 외의 목적으로 개인정보를 이용하지 않습니다.",
      },
      {
        title: "5. 동의를 거부할 권리",
        body: "개인정보 수집·이용에 동의하지 않을 수 있습니다. 다만 동의하지 않으면 문의를 보낼 수 없습니다.",
      },
      { title: "6. 문의처", body: "개인정보와 관련한 문의는 info@jstworks.com 으로 보내 주세요." },
    ] satisfies PolicySection[],
  },
  en: {
    title: "Privacy Policy",
    intro: "Joshua Tree Works Co., Ltd. (the \"Company\") processes personal information received through the inquiry form as follows.",
    sections: [
      { title: "1. Personal Information Collected", body: "Inquiry type, name, company name, email address, phone number, and message" },
      { title: "2. Purpose of Collection and Use", body: "To review and respond to inquiries, and to contact you for partnership or investment consultations" },
      {
        title: "3. Retention and Use Period",
        body: "We retain personal information for one year from the date the inquiry is resolved and then destroy it without delay. If another law specifies a retention period, we follow that period.",
      },
      {
        title: "4. Entrustment of Processing",
        body: "Inquiries are delivered to the Company's email through Web3Forms, an email delivery service. Web3Forms does not use personal information for any purpose other than delivery.",
      },
      {
        title: "5. Right to Refuse Consent",
        body: "You may refuse to consent to the collection and use of your personal information. However, if you do not consent, you cannot submit an inquiry.",
      },
      { title: "6. Contact", body: "For inquiries regarding personal information, please email info@jstworks.com." },
    ] satisfies PolicySection[],
  },
};
