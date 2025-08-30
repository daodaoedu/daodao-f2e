import { useCallback, useEffect } from 'react';
import { MicIcon } from 'lucide-react';
import SpeechRecognition, {
  ListeningOptions,
  SpeechRecognitionOptions,
  useSpeechRecognition,
} from 'react-speech-recognition';
import { Image } from '@/components/ui/image';
import { useDialog } from '@/contexts/Dialog';
import faviconPng from '@/public/assets/brand/favicon.png';
import { Button, ButtonProps } from '@/components/ui';

interface SpeechProps
  extends ListeningOptions,
    SpeechRecognitionOptions,
    Omit<ButtonProps, 'onClick'> {
  onTranscriptEnd?: (transcript: string) => void;
}

export default function Speech({
  onTranscriptEnd,
  continuous,
  interimResults,
  language,
  clearTranscriptOnListen,
  commands,
  transcribing,
  ...buttonProps
}: SpeechProps) {
  const { transcript } = useSpeechRecognition({
    clearTranscriptOnListen,
    commands,
    transcribing,
  });
  const { openDialog, closeDialog } = useDialog();

  const openSpeech = useCallback(() => {
    SpeechRecognition.startListening({
      continuous,
      interimResults,
      language,
    });
    openDialog({
      content: (
        <div>
          <div className="mb-8 flex justify-center">
            <div className="relative size-20">
              <span className="absolute inset-2 animate-ping rounded-full bg-primary-base opacity-75" />
              <div className="relative z-10 rounded-full border border-solid border-primary-base bg-white p-2.5">
                <Image src={faviconPng} alt="daodao" width={60} height={60} />
              </div>
            </div>
          </div>
          <p>說些什麼</p>
        </div>
      ),
      disableFooter: true,
    });
  }, [continuous, interimResults, language]);

  const closeSpeech = useCallback(() => {
    SpeechRecognition.stopListening();
    closeDialog();
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (transcript) {
      timeout = setTimeout(() => {
        onTranscriptEnd?.(transcript);
        closeSpeech();
      }, 1000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [transcript, closeSpeech, onTranscriptEnd]);

  return (
    <Button {...buttonProps} onClick={() => openSpeech()}>
      <MicIcon size={20} />
    </Button>
  );
}
