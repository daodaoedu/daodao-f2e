import React from 'react';
import { Button } from '@/components/atoms/button';
import { Lightbulb, Plus } from 'lucide-react';
import Image from '@/shared/components/Image';
import groupBannerImg from '@/public/assets/group-banner.png';

interface BannerProps {
  onCreateClick?: () => void;
  className?: string;
}

const Banner: React.FC<BannerProps> = ({ onCreateClick, className = '' }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background Image */}
      <div className="relative w-full h-[398px]">
        <Image
          src={groupBannerImg.src}
          alt="想法分享封面"
          height="inherit"
          background="linear-gradient(#fcfefe 10%, #e0f1f2 40%)"
          borderRadius="0"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* Icon and Title */}
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-primary-base bg-opacity-20 rounded-full flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-primary-base" />
            </div>
            <h1 className="heading-lg font-bold text-basic-500">想法分享</h1>
          </div>

          {/* Main Content */}
          <div className="space-y-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight text-basic-500">
              分享你的學習洞察
            </h2>
            <div className="space-y-2">
              <p className="body-lg text-basic-400 leading-relaxed">
                歡迎分享最近在學什麼？
              </p>
              <p className="body-md text-basic-400">
                註冊並加入我們，然後分享你的想法，讓更多人一起交流！
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onCreateClick}
              size="lg"
              className="bg-primary-base text-white hover:bg-primary-darker font-medium"
            >
              <Plus className="h-5 w-5 mr-2" />
              我想分享
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
