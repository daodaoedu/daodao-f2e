import { useTranslations } from "@daodao/i18n";
import { ApplicationInfo } from "./application-info";
import { ApplyButton } from "./apply-button";
import { Banner } from "./banner";
import { Equipment } from "./equipment";
import { FAQ } from "./f-a-q";
import { Mentors } from "./mentors";
import { Participant } from "./participant";
import { Pricing } from "./pricing";
import { Sidebar } from "./sidebar";
import { Spotlight } from "./spotlight";
import { List, Section } from "./styled";

export const Marathon = () => {
  const t = useTranslations("learning_marathon");
  return (
    <>
      <Banner />
      <Sidebar />
      <Section title={t("marathon_section_intro_title")} id="marathon-intro" className="bg-white">
        <p className="mb-5 mt-2.5">
          {t("intro_p1_line1")}
          <br />
          {t("intro_p1_line2")}
        </p>
        <p>{t("intro_equipment_lead")}</p>
        <List className="mb-5">
          <li>{t("intro_equipment_item_1")}</li>
          <li>{t("intro_equipment_item_2")}</li>
          <li>{t("intro_equipment_item_3")}</li>
          <li>{t("intro_equipment_item_4")}</li>
        </List>
        <p className="mb-5">
          {t("intro_p2_line1")}
          <br />
          {t("intro_p2_line2")}
        </p>
        <p>
          {t("intro_p3_line1")}
          <br />
          {t("intro_p3_line2")}
        </p>
      </Section>

      <Section title={t("marathon_section_who_title")} id="marathon-who" className="bg-primary-lightest">
        <List className="my-9">
          <li>{t("who_item_1")}</li>
          <li>{t("who_item_2")}</li>
          <li>{t("who_item_3")}</li>
        </List>
        <p className="mb-2.5">{t("who_participant_lead")}</p>
        <div className="mb-2.5">
          <Participant />
        </div>
        <p>
          {t("who_reminder_title")}
          <br />
          {t("who_reminder_body")}
        </p>
      </Section>

      <Section title={t("marathon_section_how_title")} id="marathon-how" className="bg-white">
        <h3 className="heading-sm my-9 leading-[1.2] text-basic-500">{t("marathon_section_how_equipment_subtitle")}</h3>
        <Equipment />
        <h3 className="heading-sm my-9 leading-[1.2] text-basic-500">{t("marathon_section_how_spotlight_subtitle")}</h3>
        <Spotlight />
      </Section>

      <Section className="bg-basic-100 px-0" withContainer={false}>
        <Mentors />
      </Section>

      <Section title={t("marathon_section_benefit_title")} id="marathon-benefit" className="bg-primary-lightest">
        <p className="mb-5 mt-9">
          {t("benefit_apply_perk")}
        </p>
        <p>
          {t("benefit_selected_lead")}
        </p>
        <List className="list-decimal">
          <li>{t("benefit_item_1")}</li>
          <li>{t("benefit_item_2")}</li>
          <li>{t("benefit_item_3")}</li>
          <li>{t("benefit_item_4")}</li>
          <li>{t("benefit_item_5")}</li>
        </List>
      </Section>

      <Section title={t("marathon_section_reward_title")} id="marathon-reward" className="bg-white">
        <p className="mb-8 mt-3">
          {t("reward_intro")}
        </p>
        <h3 className="body-md mb-3 font-medium text-black">{t("reward_awards_title")}</h3>
        <List className="mb-5">
          <li>{t("reward_awards_desc")}</li>
          <List>
            <li>{t("reward_award_top")}</li>
            <li>{t("reward_award_potential")}</li>
            <li>{t("reward_award_popularity")}</li>
            <li>{t("reward_award_participation_note")}</li>
            <li>{t("reward_award_count_note")}</li>
          </List>
          <li>
            {t("reward_selection_method_title")}
            <List>
              <li>{t("reward_selection_method_jury")}</li>
              <li>{t("reward_selection_method_popularity")}</li>
            </List>
          </li>
          <li>
            {t("reward_selection_criteria_title")}
            <List>
              <li>{t("reward_criteria_process")}</li>
              <li>{t("reward_criteria_outcome")}</li>
            </List>
          </li>
        </List>

        <h3 className="body-md mb-3 font-medium text-black">{t("reward_sharing_title")}</h3>
        <List>
          <li>{t("reward_sharing_item_1")}</li>
          <li>{t("reward_sharing_item_2")}</li>
          <li>{t("reward_sharing_item_3")}</li>
        </List>
      </Section>

      <Section title={t("marathon_section_apply_title")} id="marathon-apply" className="bg-[#EEF9F9]">
        <div className="mt-9">
          <ApplicationInfo />
        </div>
      </Section>

      <Section title={t("marathon_section_price_title")} id="marathon-price" className="bg-white">
        <div className="mt-9">
          <Pricing />
        </div>
      </Section>

      <Section title={t("marathon_section_faq_title")} id="marathon-faq" className="bg-white">
        <div className="mt-9">
          <FAQ />
        </div>
      </Section>

      <Section title={t("marathon_section_organizer_title")} id="marathon-organizer" className="bg-white">
        <p className="my-2.5">
          {t("organizer_desc_line1")}
          <br />
          {t("organizer_desc_line2")}
          <br />
          <br />
          {t("organizer_website_label")} https://www.daoedu.tw/
          <br />
          {t("organizer_contact_label")} contact@daoedu.tw
        </p>
        <h2 className="heading-md mb-2.5 text-basic-500">{t("marathon_partners_title")}</h2>
        <p className="mb-2.5">
          {t("organizer_partner_1")}
          <br />
          {t("organizer_partner_2")}
          <br />
          {t("organizer_partner_3")}
        </p>
        <p className="mb-5">{t("organizer_rights_reserved")}</p>
        <p>
          {t("organizer_company_name")}
          <br />
          {t("organizer_tax_id")}
        </p>
      </Section>

      <Section className="px-6 py-8 text-center md:py-[50px]">
        <ApplyButton className="mx-auto inline-block rounded-full bg-primary-base px-10 text-base font-normal leading-none text-white hover:bg-primary-base hover:shadow-[0px_4px_10px_0px_rgba(89,182,178,0.50)]">
          {t("marathon_apply_button")}
        </ApplyButton>
      </Section>
    </>
  );
};
