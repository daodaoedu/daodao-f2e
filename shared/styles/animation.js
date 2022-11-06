import { keyframes } from '@emotion/react';

export const slideInUp = keyframes`
    0% {
      opacity: 0;
      transform: translateY(25%);
    }
    100% {
      opacity: 1;
      transform: none;
    }
`;

export const slideInDown = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-25%);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}
`;

export const slideInleft = keyframes`
  0% {
    opacity: 0;
    transform: translateX(25%);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}`;

export const slideInRight = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-25%);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}
`;

export const fadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
`;

export const zoomIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.75);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}
`;

export const zoomReverseIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(1.25);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}
`;

export const flipInY = keyframes`
  0% {
    opacity: 0;
    transform: perspective(90vw) rotateY(67.50deg);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}
`;

export const bounce = keyframes`
  from, 20%, 53%, 80%, to {
    transform: translate3d(0,0,0);
  }

  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }

  70% {
    transform: translate3d(0, -15px, 0);
  }

  90% {
    transform: translate3d(0,-4px,0);
  }
`;

export const TikTokShaking = keyframes`
    0%, 100% {
    text-shadow: 4px 0 0 #ee1d52, 0 -4px 0 #69c9d0;
  }
  25% {
    text-shadow: 4px 4px 0 #ee1d52, -4px -4px 0 #69c9d0;
  }
  50% {
    text-shadow: 0 4px 0 #ee1d52, -4px 0 0 #69c9d0;
  }
  75% {
    text-shadow: 0 0 0 #ee1d52, 0 0 0 #69c9d0;
  }
`;
