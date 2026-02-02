import "regenerator-runtime/runtime";
import { MicIcon } from "lucide-react";
import { useCallback, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useDialog } from "@/contexts/Dialog";
import faviconPng from "@/public/assets/brand/favicon.png";
import { Button, type ButtonProps } from "@/shared/ui";
import { Image } from "@/shared/ui/image";

interface SpeechProps extends Omit<ButtonProps, "onClick"> {
  onTranscriptEnd?: (transcript: string) => void;
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  clearTranscriptOnListen?: boolean;
  commands?: Array<{
    command: string;
    callback: (...args: unknown[]) => void;
  }>;
  transcribing?: boolean;
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
  const { transcript } = useSpeechRecognition();
  const { openDialog, closeDialog } = useDialog();

  const openSpeech = useCallback(() => {
    if (clearTranscriptOnListen) {
      SpeechRecognition.abortListening();
    }

    const options: {
      continuous?: boolean;
      interimResults?: boolean;
      language?: string;
    } = {};

    if (continuous !== undefined) {
      options.continuous = continuous;
    }
    if (interimResults !== undefined) {
      options.interimResults = interimResults;
    }
    if (language) {
      options.language = language;
    }

    SpeechRecognition.startListening(options);

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
  }, [continuous, interimResults, language, clearTranscriptOnListen, openDialog]);

  const closeSpeech = useCallback(() => {
    SpeechRecognition.stopListening();
    closeDialog();
  }, [closeDialog]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (transcript && transcribing !== false) {
      timeout = setTimeout(() => {
        onTranscriptEnd?.(transcript);
        closeSpeech();
      }, 1000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [transcript, transcribing, closeSpeech, onTranscriptEnd]);

  return (
    <Button {...buttonProps} onClick={() => openSpeech()}>
      <MicIcon size={20} />
    </Button>
  );
}
