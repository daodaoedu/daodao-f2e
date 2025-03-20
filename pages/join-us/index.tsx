import { useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import styled from '@emotion/styled';
import { Typography, Box, Container, Grid, Paper, Button } from '@mui/material';

import SEOConfig from '@/shared/components/SEO';

// 樣式定義
const PageWrapper = styled.div`
  background: #ffffff;
  padding: 0;
  min-height: calc(100vh - var(--padding-top, 0px) - 270px);
`;

const IntroSection = styled.div`
  padding: 60px 0;
  text-align: center;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

const ContentSection = styled.div`
  padding: 0 0 60px;
  
  @media (max-width: 768px) {
    padding: 0 20px 40px;
  }
`;

const SectionTitle = styled(Typography)`
  font-weight: bold;
  margin-bottom: 16px;
  color: #295E5C;
`;

const RoleCard = styled(Paper)`
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(89, 182, 178, 0.5);
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #DEF5F5;
  margin-bottom: 16px;
  background-color: #ffffff;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const RoleImageContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
`;

const RoleImage = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #DEF5F5;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #1F4645;
`;

const RoleTitle = styled(Typography)`
  font-weight: bold;
  color: #1F4645;
  text-align: center;
  margin-bottom: 12px;
`;

const RoleSectionTitle = styled(Typography)`
  font-weight: bold;
  color: #16B9B3;
  margin-top: 12px;
  margin-bottom: 8px;
`;

const RewardCard = styled(Paper)`
  padding: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  height: 100%;
  border: 1px solid #89DAD7;
  background-color: #ffffff;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const RewardHeader = styled.div`
  background-color: #F4FDFC;
  padding: 16px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RewardContent = styled.div`
  padding: 24px;
`;

const RewardTitle = styled(Typography)`
  font-weight: bold;
  color: #16B9B3;
  margin-bottom: 8px;
`;

const CtaSection = styled.div`
  background-color: #1F4645;
  color: white;
  padding: 48px;
  border-radius: 12px;
  text-align: center;
  margin-top: 40px;
`;

const CtaTitle = styled(Typography)`
  font-weight: bold;
  margin-bottom: 16px;
  color: white;
`;

const CtaButton = styled(Button)`
  background-color: #FFFFFF;
  color: #1F4645;
  padding: 8px 20px;
  font-weight: bold;
  border-radius: 20px;
  text-transform: none;
  margin-top: 16px;
  
  &:hover {
    background-color: #DEF5F5;
  }
`;

const ColoredTealBg = styled.div`
  background-color: #F4FDFC;
  padding: 100px 0;
`;

function JoinUsPage() {
  const router = useRouter();

  // 島島阿學各角色資料
  const roles = [
    {
      title: '內容創作者',
      image: '/assets/images/content-creator.webp',
      tasks: [
        '分享你使用過的學習資源（書籍、課程、工具等）與使用心得，並給予評分。',
        '撰寫你的學習計畫內容與執行過程，幫助其他人參考與學習。',
        '定期產出高品質的學習相關內容，形式可以是文章、影音或圖文。'
      ],
      rewards: [
        '島島幣獎勵：每篇內容產出可獲得100-500島島幣（依內容品質與影響力而定）。',
        '專屬榮譽：優秀內容創作者將獲得專屬徽章與社群曝光機會。',
        '優先體驗權：有機會參與島島阿學的學習資源優先試用計畫，搶先體驗最新學習工具與課程。',
        '個人品牌曝光：你的內容將被推薦至社群首頁，並有機會被收錄至島島阿學的精選專欄。',
        '學習資源支持：定期獲得島島阿學提供的學習資源補助，幫助你持續成長。',
        '定期聚會與特別活動：受邀參與內容創作者的專屬聚會，與其他創作者交流經驗，並參加島島阿學舉辦的特別活動（如學習論壇、工作坊等）。'
      ]
    },
    {
      title: '社群經營者',
      image: '/assets/images/community-manager.webp',
      tasks: [
        '主辦或協辦線上線下學習活動（如讀書會、學習工作坊、主題討論等）。',
        '協助規劃活動流程、引導討論，並確保活動順利進行。',
        '凝聚社群成員，創造友善且充滿學習動力的氛圍。'
      ],
      rewards: [
        '島島幣獎勵：每場活動可獲得300-1000島島幣（依活動規模與參與人數而定）。',
        '專屬榮譽：表現優異者可獲得社群經營者專屬徽章與實體禮品。',
        '活動資源支持：獲得島島阿學提供的活動策劃工具與資源，幫助你輕鬆舉辦活動。',
        '年度聚會邀請：有機會參與島島阿學的年度社群聚會與特別活動，與其他優秀經營者交流。',
        '個人成長機會：透過活動策劃與執行，提升你的組織能力、溝通能力與領導力。',
        '定期聚會與特別活動：受邀參與社群經營者的專屬聚會，與其他經營者分享經驗，並參加島島阿學舉辦的特別活動（如：策劃培訓、團隊建設等）。'
      ]
    },
    {
      title: '島島大使',
      image: '/assets/images/ambassador.webp',
      tasks: [
        '推廣島島阿學的功能與價值，讓更多人認識並加入這個學習社群。',
        '在社交媒體、校園或生活中分享島島阿學的使用心得與推薦。',
        '協助收集用戶反饋，並提出改善建議。'
      ],
      rewards: [
        '島島幣獎勵：每成功推薦一位新成員加入可獲得50島島幣。',
        '專屬榮譽：每月表現優異者可獲得大使專屬禮包與社群榮譽頭銜。',
        '品牌代言機會：有機會成為島島阿學的品牌代言人，參與官方宣傳活動與形象拍攝。',
        '專屬培訓：獲得島島阿學提供的推廣與溝通技巧培訓，提升你的影響力。',
        '社群影響力：你的推廣成果將被記錄並公開表彰，成為社群中的學習領袖。',
        '定期聚會與特別活動：受邀參與島島大使的專屬聚會，與其他大使交流推廣經驗，並參加島島阿學舉辦的特別活動（如：品牌推廣工作坊、年度慶典等）。'
      ]
    }
  ];

  // 其他回饋內容
  const otherBenefits = [
    {
      title: '個人成長與技能提升',
      description: '透過角色任務，培養你的內容創作、社群經營、溝通表達等多元能力。'
    },
    {
      title: '專屬學習資源',
      description: '定期獲得島島阿學提供的獨家學習資源，幫助你持續精進。'
    },
    {
      title: '學習網絡擴展',
      description: '認識來自不同領域的學習夥伴，建立寶貴的人脈與合作機會。'
    },
    {
      title: '社群認可與榮譽',
      description: '透過徽章、頭銜與公開表彰，讓你的努力被看見與肯定。'
    },
    {
      title: '成就感與影響力',
      description: '你的貢獻將直接幫助更多人找到適合的學習資源與方法，成為學習社群的關鍵推手。'
    },
    {
      title: '定期聚會與特別活動',
      description: '無論你擔任哪一種角色，都能參與島島阿學舉辦的定期聚會與特別活動，與其他成員交流學習、分享經驗，並拓展你的視野與人脈。'
    }
  ];

  // 島島幣用途
  const tokenUsages = [
    '兌換島島阿學平台上的學習資源或課程折扣。',
    '參與島島阿學的限量周邊商品抽獎或兌換。',
    '用於參與特別活動或進階學習計畫。'
  ];

  const SEOData = useMemo(
    () => ({
      title: '加入島島阿學社群｜島島阿學',
      description:
        '加入島島阿學學習社群，成為內容創作者、社群經營者或島島大使！與我們一起推動自主學習，讓每個人都能找到適合自己的學習方式。',
      keywords: '島島阿學,學習社群,內容創作,社群經營,島島大使,自主學習',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
    }),
    [router?.asPath],
  );

  return (
    <PageWrapper>
      <SEOConfig data={SEOData} />

      {/* 頂部介紹區域 */}
      <IntroSection>
        <Container maxWidth="md">
          <SectionTitle variant="h2" fontSize={28} gutterBottom>
            加入島島阿學社群
          </SectionTitle>
          <Typography variant="body1" color="#011416" maxWidth="800px" mx="auto">
            歡迎有志於自學與教育創新的朋友加入我們的社群！通過加入島島阿學社群，您可以接觸到各種學習資源，結交志同道合的學習夥伴，並參與多樣化的學習活動，從而實現個人學習目標！
          </Typography>
        </Container>
      </IntroSection>

      <ColoredTealBg>
        <Container maxWidth="lg">
          {/* 社群角色說明 */}
          <Box mb={8}>
            <Box textAlign="center" mb={4}>
              <SectionTitle variant="h3" fontSize={28}>
                加入島島阿學學習社群
              </SectionTitle>
              <Typography variant="h4" fontSize={22} color="#011416" gutterBottom>
                成為內容創作者、社群經營者或島島大使！
              </Typography>
              <Typography variant="body1" color="#011416" maxWidth="800px" mx="auto" mb={2}>
                你是否熱愛學習，並希望與更多人分享你的學習經驗與資源？
                你是否喜歡經營社群，並希望透過活動連結更多志同道合的學習夥伴？
                你是否願意成為島島阿學的推廣者，讓更多人認識這個充滿學習能量的平台？
              </Typography>
              <Typography variant="body1" color="#011416" maxWidth="800px" mx="auto">
                島島阿學學習社群正在招募以下三種角色，期待你的加入！
                這不是正職或兼職工作，而是一個讓你發揮所長、貢獻學習熱情的舞台。
                我們提供豐富的回饋與獎勵，讓你的付出被看見、被鼓勵，同時也能獲得成長與成就感！
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {roles.map((role, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <RoleCard>
                    <RoleImageContainer>
                      <RoleImage>
                        <Image
                          src={role.image || `/assets/images/role-${index + 1}.webp`}
                          alt={role.title}
                          width={60}
                          height={60}
                        />
                      </RoleImage>
                    </RoleImageContainer>
                    <RoleTitle variant="h5" fontSize={22}>
                      {role.title}
                    </RoleTitle>

                    <RoleSectionTitle variant="subtitle1" fontSize={16}>
                      任務
                    </RoleSectionTitle>
                    <Box component="ul" sx={{ pl: 3, mt: 0 }}>
                      {role.tasks.map((task, taskIndex) => (
                        <Box component="li" key={taskIndex} mb={1}>
                          <Typography variant="body2" color="#011416">
                            {task}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <RoleSectionTitle variant="subtitle1" fontSize={16}>
                      回饋與獎勵
                    </RoleSectionTitle>
                    <Box component="ul" sx={{ pl: 3, mt: 0 }}>
                      {role.rewards.map((reward, rewardIndex) => (
                        <Box component="li" key={rewardIndex} mb={1}>
                          <Typography variant="body2" color="#011416">
                            {reward}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </RoleCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </ColoredTealBg>

      <ContentSection>
        <Container maxWidth="lg">
          {/* 島島幣用途 */}
          <Box mb={8}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <SectionTitle variant="h3" fontSize={24}>
                  島島幣用途
                </SectionTitle>
                <Box component="ul" sx={{ pl: 3 }}>
                  {tokenUsages.map((usage, index) => (
                    <Box component="li" key={index} mb={1}>
                      <Typography variant="body1" color="#011416">
                        {usage}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    height: '100%',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: '#DADADA'
                  }}
                >
                  <Image
                    src="/assets/images/token-usage.webp"
                    alt="島島幣用途"
                    width={300}
                    height={150}
                    layout="responsive"
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* 其他回饋內容 */}
          <Box mb={6}>
            <SectionTitle variant="h3" fontSize={28} textAlign="center" mb={4}>
              其他回饋內容
            </SectionTitle>
            <Grid container spacing={3}>
              {otherBenefits.map((benefit, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <RewardCard>
                    <RewardHeader>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: '#16B9B3',
                          borderRadius: '50%'
                        }}
                      />
                    </RewardHeader>
                    <RewardContent>
                      <RewardTitle variant="h6" fontSize={18}>
                        {benefit.title}
                      </RewardTitle>
                      <Typography variant="body2" color="#293A3D">
                        {benefit.description}
                      </Typography>
                    </RewardContent>
                  </RewardCard>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* 行動呼籲 */}
          <CtaSection>
            <Container maxWidth="md">
              <CtaTitle variant="h4" fontSize={28}>
                對島島阿學有興趣嗎？
              </CtaTitle>
              <Typography variant="body1" mb={2}>
                歡迎填寫申請表單並選擇你想擔任的角色（可複選）。
                我們將在收到申請後與你聯繫，並提供進一步的說明與培訓。
              </Typography>
              <Typography variant="body1" mb={3}>
                如果您對島島阿學的理念與活動感興趣，歡迎深入了解我們的計劃與願景。
                無論您是學習者、教育者還是有志於參與自主學習的機構，我們都非常歡迎您的加入與支持。
              </Typography>
              <CtaButton
                variant="contained"
                href="https://forms.gle/sD8XVFsfvPBH9Lqm7"
                target="_blank"
                size="large"
              >
                填寫申請表單
              </CtaButton>
            </Container>
          </CtaSection>
        </Container>
      </ContentSection>
    </PageWrapper>
  );
}

export default JoinUsPage;
