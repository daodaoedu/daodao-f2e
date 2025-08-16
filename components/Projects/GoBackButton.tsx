import { cn } from '@/utils/cn';
import React from 'react';

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
 * @param {React.ReactNode} [icon]
 *  - Optional custom icon to apply on the button. Typically, a MUI Icon component.
 * @param {() => void} onClick
 *  - Function to call when the button is clicked.
 * @returns {JSX.Element} The button element.
 */

interface ButtonProps {
  id: string,
  icon?: React.ReactNode,
  buttonText: string;
  className?: string;
  onClick: () => void;
}

const GoBackButton = ({
  buttonText,
  className = '',
  id = '',
  onClick = () => { },
  icon = null,
}: ButtonProps) => (
  <button
    id={id}
    name={id}
    type="button"
    onClick={onClick}
    className={cn(
      'flex flex-row items-center group',
      className
    )}
  >
    {icon && icon}
    <span className="
      font-sans text-sm font-normal text-basic-400
      group-hover:text-primary-base"
    >
      {buttonText}
    </span>
  </button>
);

export default GoBackButton;
