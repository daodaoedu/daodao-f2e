import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { colors, contentTypeOptions } from '../constants';
import { PathInfo } from '../types';
import StepOne from './setup/StepOne';
import StepTwo from './setup/StepTwo';
import StepThree from './setup/StepThree';
import Confetti from './Confetti';
import CelebrationMessage from './CelebrationMessage';

interface SetupFlowProps {
  setupStep: number;
  pathInfo: PathInfo;
  handlePathInfoChange: (field: keyof PathInfo, value: any) => void;
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  handleCreatePath: () => void;
  showConfetti: boolean;
  celebrationMessage: string;
}

const SetupFlow: React.FC<SetupFlowProps> = ({
  setupStep,
  pathInfo,
  handlePathInfoChange,
  handleNextStep,
  handlePreviousStep,
  handleCreatePath,
  showConfetti,
  celebrationMessage
}) => {
  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* 紙屑動畫 */}
      <Confetti active={showConfetti} />

      {/* 慶祝訊息 */}
      <CelebrationMessage 
        message={celebrationMessage} 
        isVisible={!!celebrationMessage} 
      />

      {/* 帶有返回按鈕的頁眉 */}
      {setupStep > 1 && setupStep < 4 && (
        <button
          className="flex items-center text-gray-600 mb-4 hover:text-gray-900"
          onClick={handlePreviousStep}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>返回</span>
        </button>
      )}

      {/* 進度指示器 */}
      <div className="w-full flex mb-6">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex-1 flex items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-medium"
              style={{
                backgroundColor: stepNumber === setupStep
                  ? colors.primary
                  : stepNumber < setupStep
                    ? `${colors.primary}20`
                    : '#f1f1f1',
                color: stepNumber === setupStep
                  ? 'white'
                  : stepNumber < setupStep
                    ? colors.primary
                    : '#aaa',
                border: stepNumber < setupStep ? `1px solid ${colors.primary}` : 'none'
              }}
            >
              {stepNumber < setupStep ? <Check className="h-4 w-4" /> : stepNumber}
            </div>
            {stepNumber < 3 && (
              <div
                className="h-1 flex-1"
                style={{
                  backgroundColor: stepNumber < setupStep ? colors.primary : '#f1f1f1'
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* 步驟1：基本信息 */}
      {setupStep === 1 && (
        <StepOne
          pathInfo={pathInfo}
          handlePathInfoChange={handlePathInfoChange}
          handleNextStep={handleNextStep}
        />
      )}

      {/* 步驟2：進度設置 */}
      {setupStep === 2 && (
        <StepTwo
          pathInfo={pathInfo}
          handlePathInfoChange={handlePathInfoChange}
          handleNextStep={handleNextStep}
        />
      )}

      {/* 步驟3：最終細節 */}
      {setupStep === 3 && (
        <StepThree
          pathInfo={pathInfo}
          handlePathInfoChange={handlePathInfoChange}
          handleCreatePath={handleCreatePath}
        />
      )}
    </div>
  );
};

export default SetupFlow;