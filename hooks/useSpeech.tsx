import { useCallback } from "react";
import SpeechRecognition, {
  ListeningOptions,
  useSpeechRecognition,
} from "react-speech-recognition";
import { Image } from "@/components/ui/image";
import { useDialog } from "@/contexts/Dialog";
import faviconPng from "@/public/favicon.png";

export default function useSpeech() {
  const hook = useSpeechRecognition();
  const { openDialog, closeDialog } = useDialog();

  const openSpeech = useCallback((options?: ListeningOptions) => {
    SpeechRecognition.startListening(options);
    openDialog({
      content: (
        <div>
          <div className="mb-8 flex justify-center">
            <div className="relative size-20">
              <span className="animate-ping absolute inset-2 rounded-full bg-primary-base opacity-75" />
              <div className="relative z-10 p-2.5 bg-white border border-solid border-primary-base rounded-full">
                <Image src={faviconPng} alt="daodao" width={60} height={60} />
              </div>
            </div>
          </div>
          <p>說些什麼</p>
        </div>
      ),
      disableFooter: true,
    });
  }, []);

  const closeSpeech = useCallback(() => {
    SpeechRecognition.stopListening();
    closeDialog();
  }, []);

  return {
    ...hook,
    openSpeech,
    closeSpeech,
  };
}
