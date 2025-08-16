import {
  useState, forwardRef, useId, useImperativeHandle,
} from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Text } from '@/components/ui/typography';
import { getTrustWebsitesStorage } from '@/utils/storage';

function InternalCheckLink(props, ref) {
  const id = useId();
  const [link, setLink] = useState(null);
  const [isTrust, setIsTrust] = useState(false);
  const titleId = `modal-title-${id}`;
  const descriptionId = `modal-description-${id}`;

  const handleClose = () => {
    setLink(null);
    setIsTrust(false);
  };

  const handleGoToWebsite = () => {
    const trustWebsites = getTrustWebsitesStorage().get();
    const data = Array.isArray(trustWebsites) ? trustWebsites : [];

    if (isTrust && link) {
      data.push(link.hostname);
    }

    getTrustWebsitesStorage().set(data);
    handleClose();
  };

  useImperativeHandle(
    ref,
    () => ({
      check: (href) => {
        try {
          const trustWebsites = getTrustWebsitesStorage().get();
          const data = Array.isArray(trustWebsites) ? trustWebsites : [];
          const newLink = new URL(href);

          if (data.includes(newLink.hostname) || newLink.hostname === window.location.hostname) {
            window.open(newLink.href, '_blank');
            return;
          }
          setLink(newLink);
        } catch {
          window.open(href, '_blank');
        }
      },
    }),
    []
  );

  return (
    <Dialog open={!!link} onOpenChange={handleClose}>
      <DialogContent className="max-w-[400px] w-full rounded-2xl p-8">
        <DialogHeader>
          <DialogTitle
            id={titleId}
            className="text-center text-[#536166] font-bold text-[22px] mb-2"
          >
            正在離開島島阿學
          </DialogTitle>
          {link && (
            <DialogDescription id={descriptionId} className="space-y-2">
              <Text>這個連結將帶您前往以下網站</Text>
              <Text className="text-sm text-gray-500 break-words">
                {decodeURI(link.href)}
              </Text>
            </DialogDescription>
          )}
        </DialogHeader>
        {link && (
          <>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="trust-link"
                checked={isTrust}
                onCheckedChange={setIsTrust}
              />
              <label htmlFor="trust-link" className="text-sm">
                {`從現在開始信任 ${link.hostname} 連結`}
              </label>
            </div>
            <div className="flex flex-row-reverse gap-2 mt-4">
              <Button
                asChild
                className="rounded-3xl text-white bg-[#16B9B3] shadow-md w-full"
                onClick={handleGoToWebsite}
              >
                <Link href={link.href} target="_blank" rel="noopener noreferrer">
                  前往網站
                </Link>
              </Button>
              <Button
                variant="outline"
                className="rounded-3xl bg-white text-[#1f4645] shadow-md w-full hover:bg-gray-100"
                onClick={handleClose}
              >
                返回
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

const CheckLink = forwardRef(InternalCheckLink);

export default CheckLink;
