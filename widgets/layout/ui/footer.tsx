import { unstable_rootParams } from 'next/server';
import Image from 'next/image';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { SOCIAL_LINKS, ANCHOR_IDS } from '@/shared/constants';
import { LanguageSwitcher } from '@/shared/ui/language-switcher';
import { CustomLink } from '@/shared/ui/custom-link';
import { getDictionary, getText } from '@/shared/config/i18n';

export const Footer = async () => {
  const dictionary = await getDictionary(unstable_rootParams());

  return (
    <footer className="bg-basic-600 pb-20 pt-12 text-white md:pb-12">
      <div className="container">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-start">
          <div>
            <Image
              src="/assets/landing-page/logo-simple-white.svg"
              alt="島島阿學 Logo"
              width={142}
              height={24}
              className="mb-2"
            />
            <p className="text-white/80">
              {getText(dictionary, 'common.footer_tagline')}
            </p>
          </div>

          {/* 語言切換元件 */}
          <div className="mt-2 md:mt-0">
            <LanguageSwitcher />
          </div>
        </div>
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <p className="text-lg text-primary-lighter">
              {getText(dictionary, 'common.footer_about_title')}
            </p>
            <div className="space-y-2">
              <div>
                <CustomLink
                  href="/about"
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  {getText(dictionary, 'common.footer_about_us')}
                </CustomLink>
              </div>
              <div>
                <CustomLink
                  href={`/about#${ANCHOR_IDS.VISION}`}
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  {getText(dictionary, 'common.footer_vision')}
                </CustomLink>
              </div>
              <div>
                <CustomLink
                  href={`/about#${ANCHOR_IDS.MISSION}`}
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  {getText(dictionary, 'common.footer_mission')}
                </CustomLink>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-lg text-primary-lighter">
              {getText(dictionary, 'common.footer_resources_title')}
            </p>
            <div className="space-y-2">
              <div>
                <CustomLink
                  href="/learning-marathons/2025S1"
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  {getText(dictionary, 'common.footer_learning_marathons')}
                </CustomLink>
              </div>
              <div>
                <CustomLink
                  href="/terms/privacy-policy"
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  {getText(dictionary, 'common.footer_privacy_policy')}
                </CustomLink>
              </div>
              <div>
                <CustomLink
                  href="/terms/service"
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  {getText(dictionary, 'common.footer_terms_of_service')}
                </CustomLink>
              </div>
              <div>
                <CustomLink
                  href="/terms/ipr"
                  className="text-white/70 transition-colors hover:text-primary-base"
                >
                  {getText(dictionary, 'common.footer_intellectual_property')}
                </CustomLink>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-lg text-primary-lighter">
              {getText(dictionary, 'common.footer_newsletter_title')}
            </p>
            <form className="space-y-3">
              <input
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white placeholder:text-white/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-base"
                type="email"
                placeholder={getText(
                  dictionary,
                  'common.footer_email_placeholder'
                )}
              />
              <Button
                type="submit"
                variant="ctaPrimary"
                size="huge"
                className="w-full"
              >
                {getText(dictionary, 'common.footer_subscribe_button')}
                <Icon name="arrow-right" />
              </Button>
            </form>
          </div>
        </div>
        <div className="mb-8 space-y-4">
          <p className="text-lg text-primary-lighter">
            {getText(dictionary, 'common.footer_social_title')}
          </p>
          <div className="flex gap-4">
            <CustomLink
              href={SOCIAL_LINKS.INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
            >
              <Image
                src="/assets/landing-page/icon-Instagram.svg"
                alt={getText(dictionary, 'common.footer_instagram_alt')}
                width={36}
                height={36}
              />
            </CustomLink>
            <CustomLink
              href={SOCIAL_LINKS.FACEBOOK}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
            >
              <Image
                src="/assets/landing-page/icon-Facebook.svg"
                alt={getText(dictionary, 'common.footer_facebook_alt')}
                width={36}
                height={36}
              />
            </CustomLink>
          </div>
        </div>
        <p className="text-center text-basic-300">
          {getText(dictionary, 'common.footer_copyright', {
            year: new Date().getFullYear(),
          })}
        </p>
      </div>
    </footer>
  );
};
