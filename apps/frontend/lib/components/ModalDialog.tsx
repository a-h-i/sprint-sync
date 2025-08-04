import React, {Fragment} from "react";
import {Dialog, DialogPanel, Transition, TransitionChild} from "@headlessui/react";
import {XMarkIcon} from "@heroicons/react/24/outline";


interface ModalDialogProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export default function ModalDialog(props: ModalDialogProps) {
    return (
        <Transition show={props.open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={props.onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-150"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-150"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-100"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                            <button
                                onClick={props.onClose}
                                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                            {props.children}
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
    return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
    return <h2 className="text-lg font-semibold">{children}</h2>;
}

export const DialogContent = ({ children }: { children: React.ReactNode }) => {
    return <div className="space-y-4">{children}</div>;
};