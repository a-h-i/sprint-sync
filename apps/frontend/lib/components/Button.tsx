import { Button as HeadlessButton } from '@headlessui/react';
import React from 'react';
import { clsx } from 'clsx';

type ButtonVariants = 'primary' | 'secondary';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant: ButtonVariants;
}

export default function Button({ variant, children, className, ...rest }: ButtonProps) {
  return (
    <HeadlessButton
      className={clsx(`me-2 mb-2 rounded-lg ${className}`, {
        'bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800':
          variant === 'primary',
        'border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-gray-700':
          variant === 'secondary',
        'cursor-not-allowed bg-blue-400': rest.disabled && variant === 'primary',
        'cursor-not-allowed opacity-50': rest.disabled && variant === 'secondary',
      })}
      {...rest}
    >
      {children}
    </HeadlessButton>
  );
}
