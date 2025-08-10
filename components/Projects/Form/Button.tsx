import { cn } from '@/utils/cn';

/**
 * Button component for rendering customizable buttons.
 *
 * This component allows you to create buttons with:
 * - different styles,
 * - handle click events,
 * - apply custom styles via the `className` and `style` props
 *
 * @param {string} id
 *  - The unique identifier for the button. Also used as the `name` attribute.
 * @param {string} buttonStyle
 *  - The style variant of the button (e.g., "default", "outline"). Default is "default".
 * @param {string} buttonText
 *  - The text displayed on the button.
 * @param {string} [className]
 *  - Optional custom classes to apply to the button (uses Tailwind CSS).
 * @param {() => void} onClick
 *  - Function to call when the button is clicked.
 * @param {React.CSSProperties} [style]
 *  - Optional inline styles to apply to the button. Can be used to override the default styling.
 *
 * @returns {JSX.Element} The button element.
 */

interface ButtonProps {
  id: string,
  buttonStyle: string;
  buttonText: string;
  className?: string;
  onClick: () => void;
  style?: React.CSSProperties;
}

const Button = ({
  buttonText,
  buttonStyle = 'default',
  className = '',
  id = '',
  style = {},
  onClick = () => { },
}: ButtonProps) => {
  let styleClasses = '';

  switch (buttonStyle) {
    case 'outline':
      styleClasses = `bg-white text-[#29CAA3] 
        border border-solid border-primary-base 
        hover:border-primary-lighter`;
      break;
    case 'default':
      styleClasses = `bg-primary-base text-white 
        hover:bg-primary-darker`;
      break;
    default:
      break;
  }
  return (
    <button
      id={id}
      name={id}
      type="button"
      onClick={onClick}
      className={cn(`
          box-border
          w-full md:w-[272px] 
          font-sans font-normal leading-[140%]
          text-center
          py-2 px-5 
          rounded-[20px] 
          transition-colors ease-in
          ${styleClasses}`, className)}
      style={style}
    >
      {buttonText}
    </button>
  );
};

export default Button;
