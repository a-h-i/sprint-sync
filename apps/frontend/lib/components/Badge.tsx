'use client';

import React from 'react';

const colorMap = {
  gray: 'bg-gray-50 text-gray-600 ring-gray-500/10',
  red: 'bg-red-50 text-red-700 ring-red-600/10',
  yellow: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
  green: 'bg-green-50 text-green-700 ring-green-600/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-700/10',
};

interface BadgeProps {
  children: React.ReactNode;
  color: keyof typeof colorMap;
}

export default function Badge(props: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colorMap[props.color]}`}
    >
      {props.children}
    </span>
  );
}
