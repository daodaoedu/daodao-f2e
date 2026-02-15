"use client";

import { amVarStyle } from "./styled";

const STAR_COUNT = 60;

function generateStars() {
	return Array.from({ length: STAR_COUNT }, (_, i) => ({
		id: i,
		left: `${Math.random() * 100}%`,
		top: `${Math.random() * 100}%`,
		size: Math.random() * 2 + 1,
		delay: `${Math.random() * 3}s`,
		duration: `${Math.random() * 2 + 2}s`,
	}));
}

const stars = generateStars();

export function StarryBackground({ children }: React.PropsWithChildren) {
	return (
		<div
			className="relative min-h-dvh overflow-hidden"
			style={{
				...amVarStyle,
				background: "var(--am-bg-gradient)",
			}}
		>
			{/* Stars */}
			<div className="pointer-events-none absolute inset-0" aria-hidden="true">
				{stars.map((star) => (
					<div
						key={star.id}
						className="absolute rounded-full bg-white animate-pulse"
						style={{
							left: star.left,
							top: star.top,
							width: `${star.size}px`,
							height: `${star.size}px`,
							animationDelay: star.delay,
							animationDuration: star.duration,
							opacity: 0.6 + Math.random() * 0.4,
						}}
					/>
				))}
			</div>
			{/* Content */}
			<div className="relative z-10">{children}</div>
		</div>
	);
}
