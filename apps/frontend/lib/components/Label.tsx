import React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    children: React.ReactNode;
}

export default function Label({children, ...rest}: LabelProps) {
    return <label className="block mb-2 text-sm font-medium text-gray-900" {...rest}>{children}</label>
}