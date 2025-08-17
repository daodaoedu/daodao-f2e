import { useState, forwardRef, useImperativeHandle } from 'react';

const ApplyClosePopup = forwardRef((props, ref) => {
  const [isVisible, setIsVisible] = useState(false);

  const popupContent = {
    title: '活動申請已截止',
    description: '本次活動申請已截止，但您仍可以加入排隊名單',
    content: '預計7月初開放申請，8月底申請截止。加入排隊清單後，我們會在下次開放申請時第一時間通知您。同時也歡迎追蹤社群媒體，接收最新活動訊息。',
    waitingListButton: '加入排隊清單',
    closeButton: '稍後再說',
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-[400px] rounded-2xl bg-white p-6 shadow-lg">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800">{popupContent.title}</h1>
          <p className="leading-relaxed text-gray-600">{popupContent.description}</p>
          <p className="leading-relaxed text-gray-600">
            {popupContent.content}
          </p>
        </div>

        <div className="relative h-64 w-full">
          <img
            src="/assets/images/403-error.png"
            alt="Registration closed illustration"
            className="object-contain"
          />
        </div>

        <div className="mt-4 space-y-3">
          <button
            type="button"
            className="w-full rounded-full bg-primary-base p-4 text-base font-medium text-white hover:bg-teal-600 hover:shadow-[0px_4px_10px_0px_rgba(89,182,178,0.50)]"
            onClick={handleWaitingListClick}
          >
            {popupContent.waitingListButton}
          </button>

          <button
            type="button"
            className="w-full rounded-full border border-[#16B9B3] bg-white p-4 text-base font-medium text-teal-500 transition-shadow hover:bg-gray-50 hover:shadow-[0px_4px_10px_0px_rgba(89,182,178,0.50)] "
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
