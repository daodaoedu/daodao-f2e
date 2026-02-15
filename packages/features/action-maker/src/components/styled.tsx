/** Action Maker CSS custom properties and shared styles */

export const AM_VARS = {
	"--am-bg": "#18215E",
	"--am-bg-gradient": "linear-gradient(180deg, #0D1333 0%, #18215E 40%, #1E2D6F 100%)",
	"--am-gray-blue": "#7B9FC4",
	"--am-light-blue": "#BCD5EE",
	"--am-very-light-blue": "#E1F0FB",
	"--am-white": "#FFFFFF",
	"--am-card-bg": "rgba(24, 33, 94, 0.6)",
	"--am-card-border": "rgba(188, 213, 238, 0.3)",
	"--am-badge-beginner": "#4CAF50",
	"--am-badge-intermediate": "#5B8DB8",
	"--am-badge-advanced": "#B8865B",
} as const;

export const amVarStyle = AM_VARS as React.CSSProperties;
