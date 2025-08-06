import React, {HTMLAttributes} from "react";
import {Label as HeadlessLabel} from "@headlessui/react";

interface LabelProps extends HTMLAttributes<HTMLLabelElement> {
    children: React.ReactNode;
}

export default function Label({children, ...rest}: LabelProps) {
    return <HeadlessLabel className="block mb-2 text-sm font-medium text-gray-900" {...rest}>{children}</HeadlessLabel>
}