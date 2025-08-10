import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  rootId: string;
}

function Portal({ children, rootId }: PortalProps) {
  const [targetRoot, setTargetRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const existingRoot = document.getElementById(rootId);
    let root;

    if (existingRoot) {
      root = existingRoot;
    } else {
      root = document.createElement('div');
      root.id = rootId;
      document.body.appendChild(root);
    }
    setTargetRoot(root);

    return () => {
      if (!existingRoot) {
        document.body.removeChild(root);
      }
    };
  }, [rootId]);

  if (!targetRoot) return null;

  return createPortal(children, targetRoot);
}

export default Portal;
