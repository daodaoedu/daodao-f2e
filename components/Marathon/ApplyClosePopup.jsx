import { useState, forwardRef, useImperativeHandle } from 'react';

const ApplyClosePopup = forwardRef((props, ref) => {
  const [isVisible, setIsVisible] = useState(false);

  const popupContent = {
    title: '活動申請已截止',
    description: '本次活動申請已截止，但您仍可以加入排隊名單',
    content: '預計7月初開放申請，8月底申請截止。加入排隊清單後，我們會在下次開放申請時第一時間通知您。同時也歡迎追蹤社群媒體，接收最新活動訊息。',
    waitingListButton: '加入排隊清單',
    closeButton: '稍後再說'
  };

  const handleWaitingListClick = () => {
    window.open('https://daoda.kit.com/marathon', '_blank');
  };

  useImperativeHandle(ref, () => ({
    showPopup: () => {
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

        <div className="space-y-3 mt-4">
          <button
            type="button"
            className="w-full bg-teal-500 hover:bg-teal-600 text-white p-4 rounded-full text-base font-medium"
            onClick={handleWaitingListClick}
          >
            {popupContent.waitingListButton}
          </button>

          <button
            type="button"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 p-4 rounded-full text-base font-medium"
            onClick={() => setIsVisible(false)}
          >
            {popupContent.closeButton}
          </button>
        </div>
      </div>
    </div>
  );
});

export default ApplyClosePopup;
