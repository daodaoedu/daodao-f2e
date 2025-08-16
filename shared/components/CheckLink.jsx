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
      <DialogContent className="w-full max-w-[400px] rounded-2xl p-8">
        <DialogHeader>
          <DialogTitle
            id={titleId}
            className="mb-2 text-center text-[22px] font-bold text-[#536166]"
          >
            正在離開島島阿學
          </DialogTitle>
          {link && (
            <DialogDescription id={descriptionId} className="space-y-2">
              <Text>這個連結將帶您前往以下網站</Text>
              <Text className="break-words text-sm text-gray-500">
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
            <div className="mt-4 flex flex-row-reverse gap-2">
              <Button
                asChild
                className="w-full rounded-3xl bg-[#16B9B3] text-white shadow-md"
                onClick={handleGoToWebsite}
              >
                <Link href={link.href} target="_blank" rel="noopener noreferrer">
                  前往網站
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-3xl bg-white text-[#1f4645] shadow-md hover:bg-gray-100"
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
