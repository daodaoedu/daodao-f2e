import Image from "@/shared/components/Image";
import ResponsiveModal from "@/components/molecules/responsive-modal";

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOk: () => void;
}

function TipModal({ isOpen, onClose, onOk }: Readonly<TipModalProps>) {
  return (
    <ResponsiveModal open={isOpen} onClose={onClose} title="帳號註冊成功！">
      <p className="mt-2 mb-6 text-center text-basic-400 body-sm">
        記得到信箱確認收到帳號驗證信件，並點選驗證Email按鈕，如果沒有看到信件，可以到垃圾桶確認。
      </p>
      <Image
        src="/assets/partner-popup.png"
        alt="dao-dao-island"
        width="360"
        height="280"
      />
      <p className="my-6 text-center text-basic-400 body-sm">
        我們會公開你的<strong className="font-bold">個人檔案</strong>
        ，填寫完整的資料，才能讓其他夥伴們更了解你喔！
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 py-2 shadow-lg transition-colors rounded-full bg-white text-primary-darker hover:bg-basic-100"
          onClick={onClose}
        >
          暫時不需要
        </button>
        <button
          type="button"
          className="flex-1 py-2 shadow-lg transition-colors rounded-full bg-primary-base text-white hover:bg-primary-darker"
          onClick={onOk}
        >
          想，填寫資料
        </button>
      </div>
    </ResponsiveModal>
  );
}

export default TipModal;
