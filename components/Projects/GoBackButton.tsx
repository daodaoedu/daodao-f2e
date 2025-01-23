import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
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
 * @param {string} buttonText
 *  - The text displayed on the button.
 * @param {string} [className]
 *  - Optional custom classes to apply to the button (uses Tailwind CSS).
 * @param {() => void} onClick
 *  - Function to call when the button is clicked.
 * @returns {JSX.Element} The button element.
 */

interface ButtonProps {
  id: string,
  buttonText: string;
  className?: string;
  onClick: () => void;
}

const GoBackButton = ({
  buttonText,
  className = "",
  id = "",
  onClick = () => { },
}: ButtonProps
) => {
  return (
    <button
      id={id}
      name={id}
      type="button"
      onClick={onClick}
      className={cn(`flex flex-row items-center group`, className)}
    >
      <KeyboardArrowLeftIcon className="
      text-basic-400
      group-hover:text-primary-base"
      />
      <span className="
      text-basic-400 font-sans text-sm font-normal
      group-hover:text-primary-base"
      >
        {buttonText}
      </span>
    </button>
  );
};

export default GoBackButton;
