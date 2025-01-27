import { useState, forwardRef, useImperativeHandle } from 'react';

const ApplyClosePopup = forwardRef((props, ref) => {
  const [isVisible, setIsVisible] = useState(false);

  const popupContent = {
    title: '活動申請已截止',
    description: '本次活動申請已截止，歡迎關注下次時間。',
    content: '預計是7月初開放申請，8月底申請截止，歡迎追蹤社群媒體與訂閱電子報，接收最新訊息。',
  };

  useImperativeHandle(ref, () => ({
    showPopup: () => {
      console.log('showPopup called');
      setIsVisible(true);
    },
    hidePopup: () => {
      setIsVisible(false);
    },
  }));

  if (!isVisible) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center">
      <div className="w-full max-w-[400px] bg-white p-6 rounded-2xl shadow-lg">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800">{popupContent.title}</h1>

          <p className="text-gray-600 leading-relaxed">{popupContent.description}</p>

          <p className="text-gray-600 leading-relaxed">
            {popupContent.content}
          </p>
        </div>

        <div className="relative h-64 w-full">
          <img
            src="/assets/marathon-apply-close.png"
            alt="Registration closed illustration"
            fill
            className="object-contain"
          />
        </div>

        <div className="mr-10 ml-10">
          <button
            type="button"
            className="w-full bg-teal-500 hover:bg-teal-600 text-white p-4  rounded-full text-base font-medium"
            onClick={() => setIsVisible(false)}
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
});

export default ApplyClosePopup;
