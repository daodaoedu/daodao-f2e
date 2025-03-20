import { useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from '@emotion/styled';
import { Typography, Box, Container, Grid, Paper, Button } from '@mui/material';

import SEOConfig from '@/shared/components/SEO';
import CheckIconSvg from '@/public/assets/icons/check_icon.svg';
import { v4 as uuidv4 } from 'uuid';

// 樣式定義
const PageWrapper = styled.div`
  background: #f3fcfc;
  padding: 60px 0;
  min-height: calc(100vh - var(--padding-top, 0px) - 270px);
  
  @media (max-width: 768px) {
    padding: 40px 0;
  }
`;

const PageTitle = styled.div`
  text-align: center;
  margin-bottom: 48px;
  
  @media (max-width: 768px) {
    margin-bottom: 32px;
    padding: 0 16px;
  }
`;

const SectionTitle = styled(Typography)`
  text-align: center;
  margin-bottom: 40px;
  font-weight: bold;
  color: #295E5C;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;

const StyledPaper = styled(Paper)`
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  position: relative;
  margin-bottom: 30px;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const RoleTag = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background-color: #def5f5;
  color: #295e5c;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
`;

const RoleIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  
  img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const RoleTitle = styled(Typography)`
  text-align: center;
  margin-bottom: 16px;
  font-weight: bold;
  color: #295E5C;
`;

const RoleDescription = styled(Typography)`
  color: #536166;
  margin-bottom: 20px;
  flex-grow: 1;
`;

const RequirementsList = styled.ul`
  padding-left: 0;
  margin-bottom: 24px;
`;

const RequirementItem = styled.li`
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  
  svg {
    margin-right: 12px;
    min-width: 20px;
    margin-top: 2px;
    color: #16B9B3;
  }
`;

const ApplyButtonWrapper = styled.div`
  text-align: center;
  margin-top: auto;
`;

const ApplyButton = styled(Button)`
  background-color: #16B9B3;
  color: white;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: bold;
  text-transform: none;
  
  &:hover {
    background-color: #129792;
  }
`;

const StepsSection = styled(Box)`
  margin: 60px 0;
  
  @media (max-width: 768px) {
    margin: 40px 0;
  }
`;

const StepItem = styled(Box)`
  text-align: center;
  padding: 24px 16px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 45px;
    right: -16px;
    width: 32px;
    height: 2px;
    background-color: #DEF5F5;
    display: ${(props) => props.isLast ? 'none' : 'block'};
    
    @media (max-width: 768px) {
      display: none;
    }
  }
`;

const StepNumber = styled(Box)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #16B9B3;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin: 0 auto 16px;
`;

const TestimonialSection = styled(Box)`
  margin: 60px 0;
`;

const TestimonialPaper = styled(Paper)`
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  border-left: 4px solid #16B9B3;
`;

const QuoteIcon = styled(Box)`
  color: #DEF5F5;
  font-size: 48px;
  margin-bottom: 16px;
`;

const TestimonialQuote = styled(Typography)`
  font-style: italic;
  color: #536166;
  margin-bottom: 16px;
`;

const TestimonialAuthor = styled(Box)`
  display: flex;
  align-items: center;
`;

const AuthorImage = styled(Box)`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 16px;
`;

const FAQS = styled(Box)`
  margin: 60px 0;
`;

const FAQItem = styled(Box)`
  margin-bottom: 20px;
`;

const FAQQuestion = styled(Box)`
  padding: 16px;
  background-color: #DEF5F5;
  border-radius: 8px;
  font-weight: bold;
  color: #295E5C;
  margin-bottom: 8px;
  cursor: pointer;
`;

const FAQAnswer = styled(Box)`
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  color: #536166;
`;

const ActionSection = styled(Box)`
  text-align: center;
  margin: 60px 0 30px;
  padding: 40px;
  background-color: #DEF5F5;
  border-radius: 20px;
`;

function JoinUsPage() {
  const router = useRouter();

  // 島島阿學各角色資料
  const roles = [
    {
      title: '資源貢獻者',
      tag: '遠端參與',
      icon: '/public/assets/images/contributor-icon.webp',
      description: '協助搜集、整理、分享各種學習資源，讓自主學習者能夠獲得更豐富的學習素材。',
      requirements: [
        '對特定領域有熱情或專業知識',
        '願意分享高品質的學習資源',
        '具備基本的分類與整理能力',
        '每週能投入約2-3小時',
      ],
      applicationLink: '/contribute',
    },
    {
      title: '社群志工',
      tag: '彈性參與',
      icon: '/public/assets/images/community-icon.webp',
      description: '協助經營社群平台，回應社群成員需求，協助舉辦各類型活動與交流。',
      requirements: [
        '喜歡與人互動，具備良好溝通能力',
        '對教育或學習社群有熱忱',
        '願意學習社群經營相關知識',
        '每週能投入約3-5小時',
      ],
      applicationLink: 'https://forms.gle/sD8XVFsfvPBH9Lqm7',
    },
    {
      title: '技術志工',
      tag: '專案協作',
      icon: '/public/assets/images/tech-icon.webp',
      description: '協助維護與優化島島阿學網站，開發新功能，提升使用者體驗。',
      requirements: [
        '具備前端或後端開發技能',
        '熟悉 React、Next.js 等相關技術',
        '對開源專案有熱忱',
        '能配合專案時程參與開發',
      ],
      applicationLink: 'https://github.com/Daodaoedu/daodao-f2e',
    },
    {
      title: '活動策劃者',
      tag: '實地參與',
      icon: '/public/assets/images/event-icon.webp',
      description: '規劃並執行各類線上或線下學習活動，促進自主學習者之間的交流與連結。',
      requirements: [
        '具備活動策劃經驗或強烈興趣',
        '良好的組織與執行能力',
        '能夠獨立負責活動的規劃與進行',
        '每月能參與1-2次活動',
      ],
      applicationLink: 'https://forms.gle/sD8XVFsfvPBH9Lqm7',
    },
    {
      title: '教育顧問',
      tag: '專業支援',
      icon: '/public/assets/images/advisor-icon.webp',
      description: '提供專業的教育諮詢，協助島島阿學團隊優化平台內容與服務方向。',
      requirements: [
        '具教育相關背景或豐富教學經驗',
        '對自主學習、民主教育有深入了解',
        '願意分享專業知識與經驗',
        '能彈性安排時間參與諮詢會議',
      ],
      applicationLink: 'https://forms.gle/sD8XVFsfvPBH9Lqm7',
    },
    {
      title: '內容創作者',
      tag: '創意協作',
      icon: '/public/assets/images/creator-icon.webp',
      description: '協助創作各類學習內容、文章、影片或圖文，分享自主學習相關知識與經驗。',
      requirements: [
        '擅長文字、影像或音訊內容創作',
        '對教育議題有獨到見解',
        '能定期產出高品質內容',
        '每月至少能貢獻1-2篇作品',
      ],
      applicationLink: 'https://forms.gle/sD8XVFsfvPBH9Lqm7',
    },
  ];

  // 申請步驟
  const applicationSteps = [
    {
      number: 1,
      title: '選擇角色',
      description: '瀏覽各個角色說明，選擇適合您興趣和專長的參與方式',
    },
    {
      number: 2,
      title: '填寫申請',
      description: '點擊「立即申請」，填寫詳細的志工申請表單',
    },
    {
      number: 3,
      title: '面談交流',
      description: '我們會安排簡短的線上面談，進一步了解您的期望和專長',
    },
    {
      number: 4,
      title: '開始參與',
      description: '完成簡單的志工培訓後，正式加入島島阿學團隊',
    },
  ];

  // 夥伴分享
  const testimonials = [
    {
      quote: '在島島阿學擔任資源貢獻者讓我有機會將自己的專業知識整理並分享給需要的人，看到我貢獻的資源能幫助別人學習，是非常有成就感的事。',
      author: '小華',
      role: '資源貢獻者',
      duration: '參與1年',
      image: '/public/assets/images/testimonial-1.webp',
    },
    {
      quote: '作為技術志工，我不只能運用自己的程式開發能力，還能與團隊一起思考如何透過科技促進學習。這裡的開源精神和教育理念相當契合我的價值觀。',
      author: '小明',
      role: '技術志工',
      duration: '參與2年',
      image: '/public/assets/images/testimonial-2.webp',
    },
  ];

  // 常見問題
  const faqs = [
    {
      question: '我沒有相關經驗，可以參與島島阿學的志工嗎？',
      answer: '當然可以！島島阿學歡迎各種背景的夥伴加入。只要您有熱忱並願意學習，我們會提供必要的培訓和支持。許多志工夥伴都是在參與過程中逐漸累積經驗的。',
    },
    {
      question: '參與島島阿學志工需要承諾多少時間？',
      answer: '我們了解每個人的時間安排不同，因此時間承諾是彈性的。根據不同角色，一般建議每週能投入2-5小時。您可以根據自己的情況選擇適合的參與方式。',
    },
    {
      question: '我已經有全職工作，還能參與志工嗎？',
      answer: '絕對可以！許多島島阿學的志工夥伴都有自己的全職工作或學業。我們提供彈性的參與方式，您可以選擇遠端參與或在空閒時間貢獻，完全可以配合您的個人行程。',
    },
    {
      question: '參與島島阿學志工有什麼福利或回饋？',
      answer: '除了能夠接觸到豐富的學習資源與社群外，志工夥伴還能獲得專業成長的機會、參與各類工作坊與活動的優先權，以及島島阿學提供的感謝狀與推薦信。最重要的是，您將成為推動自主學習文化的重要力量！',
    },
  ];

  const SEOData = useMemo(
    () => ({
      title: '加入我們｜島島阿學',
      description:
        '與島島阿學一起推動自主學習！我們需要各種人才一起參與，無論是資源貢獻、技術支援、社群經營或活動策劃，歡迎加入我們的志工團隊，共同建立更豐富的學習生態系。',
      keywords: '島島阿學,志工招募,參與我們,自主學習,教育志工',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
    }),
    [router?.asPath],
  );
  const uniqueId = uuidv4();

  return (
    <PageWrapper>
      <SEOConfig data={SEOData} />
      <Container>
        <PageTitle>
          <Typography variant="h2" fontSize={36} fontWeight="bold" gutterBottom>
            加入島島阿學
          </Typography>
          <Typography variant="body1" color="#536166" fontSize={18} maxWidth="800px" mx="auto">
            與我們一起推動自主學習，讓每個人都能找到適合自己的學習方式，成為自己想成為的人。
          </Typography>
        </PageTitle>

        {/* 志工角色區域 */}
        <Box mb={8}>
          <SectionTitle variant="h3" fontSize={28}>
            選擇您的參與方式
          </SectionTitle>
          <Grid container spacing={4}>
            {roles.map((role, index) => (
              <Grid item xs={12} md={4} key={uniqueId}>
                <StyledPaper>
                  <RoleTag>{role.tag}</RoleTag>
                  <RoleIcon>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: '#DEF5F5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Box
                        component="img"
                        src={`/assets/images/role-${index + 1}.svg`}
                        alt={role.title}
                        sx={{ width: 40, height: 40 }}
                      />
                    </Box>
                  </RoleIcon>
                  <RoleTitle variant="h4" fontSize={22}>
                    {role.title}
                  </RoleTitle>
                  <RoleDescription variant="body1">
                    {role.description}
                  </RoleDescription>
                  <Box mb={3}>
                    <Typography variant="subtitle1" fontWeight="bold" color="#295E5C" mb={2}>
                      角色要求：
                    </Typography>
                    <RequirementsList>
                      {role.requirements.map((req) => (
                        <RequirementItem key={uniqueId}>
                          <CheckIconSvg />
                          <Typography variant="body2">{req}</Typography>
                        </RequirementItem>
                      ))}
                    </RequirementsList>
                  </Box>
                  <ApplyButtonWrapper>
                    <ApplyButton
                      variant="contained"
                      href={role.applicationLink}
                      target="_blank"
                    >
                      立即申請
                    </ApplyButton>
                  </ApplyButtonWrapper>
                </StyledPaper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 申請步驟 */}
        <StepsSection>
          <SectionTitle variant="h3" fontSize={28}>
            申請流程
          </SectionTitle>
          <Grid container spacing={2}>
            {applicationSteps.map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={uniqueId}>
                <StepItem isLast={index === applicationSteps.length - 1}>
                  <StepNumber>{step.number}</StepNumber>
                  <Typography variant="h5" fontSize={18} fontWeight="bold" color="#295E5C" mb={1}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="#536166">
                    {step.description}
                  </Typography>
                </StepItem>
              </Grid>
            ))}
          </Grid>
        </StepsSection>

        {/* 夥伴分享 */}
        <TestimonialSection>
          <SectionTitle variant="h3" fontSize={28}>
            夥伴分享
          </SectionTitle>
          <Grid container spacing={4}>
            {testimonials.map((testimonial) => (
              <Grid item xs={12} md={6} key={uniqueId}>
                <TestimonialPaper>
                  <QuoteIcon>"</QuoteIcon>
                  <TestimonialQuote variant="body1">
                    {testimonial.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor>
                    <AuthorImage>
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          bgcolor: '#DEF5F5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Typography fontWeight="bold" color="#16B9B3">
                          {testimonial.author.charAt(0)}
                        </Typography>
                      </Box>
                    </AuthorImage>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {testimonial.author}
                      </Typography>
                      <Typography variant="body2" color="#536166">
                        {testimonial.role} | {testimonial.duration}
                      </Typography>
                    </Box>
                  </TestimonialAuthor>
                </TestimonialPaper>
              </Grid>
            ))}
          </Grid>
        </TestimonialSection>

        {/* 常見問題 */}
        <FAQS>
          <SectionTitle variant="h3" fontSize={28}>
            常見問題
          </SectionTitle>
          <Box maxWidth="800px" mx="auto">
            {faqs.map((faq) => (
              <FAQItem key={uniqueId}>
                <FAQQuestion>
                  <Typography variant="subtitle1">
                    Q: {faq.question}
                  </Typography>
                </FAQQuestion>
                <FAQAnswer>
                  <Typography variant="body2">
                    A: {faq.answer}
                  </Typography>
                </FAQAnswer>
              </FAQItem>
            ))}
          </Box>
          <Box className="text-center" mt={4}>
            <Link href="/terms/faq" passHref>
              <Typography
                component="a"
                color="#16B9B3"
                sx={{ textDecoration: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              >
                查看更多常見問題 →
              </Typography>
            </Link>
          </Box>
        </FAQS>

        {/* 行動號召 */}
        <ActionSection>
          <Typography variant="h3" fontSize={28} fontWeight="bold" color="#295E5C" mb={2}>
            準備好一起創造改變了嗎？
          </Typography>
          <Typography variant="body1" color="#536166" mb={4} maxWidth="600px" mx="auto">
            加入島島阿學，與我們一起建立更完善的自主學習生態系，讓每個人都能找到適合自己的學習方式。
          </Typography>
          <ApplyButton
            variant="contained"
            href="https://forms.gle/sD8XVFsfvPBH9Lqm7"
            target="_blank"
            size="large"
          >
            立即加入我們
          </ApplyButton>
        </ActionSection>
      </Container>
    </PageWrapper>
  );
}

export default JoinUsPage;
