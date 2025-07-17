import {createPortal} from "react-dom";
import type {ReactNode} from "react";
import {XIcon} from "lucide-react";

export default function Modal({ children, onClose }:{children:ReactNode, onClose:() => void}) {
    const modalRoot = document.getElementById('modal-root');

    if (!modalRoot) {
        throw new Error("Missing #modal-root in HTML");
    }

    return createPortal(
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm flex items-end justify-center sm:items-center sm:justify-center" onClick={onClose}>
            <div className="card flex-col relative z-50 w-full max-w-md p-6 sm:rounded-xl sm:fixed sm:left-1/2 sm:top-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="btn border-none self-end"><XIcon className="hover:text-indigo-600"/></button>
                {children}
            </div>
        </div>,
        modalRoot
    );
}