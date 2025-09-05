import { useEffect, useRef, useState } from 'react';

export function useFeatureVisibility() {
  const [visibleFeatures, setVisibleFeatures] = useState<number[]>([]);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = featureRefs.current.findIndex(ref => ref === entry.target);
            if (index !== -1 && !visibleFeatures.includes(index)) {
              setVisibleFeatures(prev => [...prev, index]);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    featureRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [visibleFeatures]);

  const registerFeature = (index: number, ref: HTMLDivElement | null) => {
    featureRefs.current[index] = ref;
  };

  return {
    visibleFeatures,
    registerFeature,
  };
}
