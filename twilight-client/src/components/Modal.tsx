import {createPortal} from "react-dom";
import type {ReactNode} from "react";
import {XIcon} from "lucide-react";

export default function Modal({ children, onClose, background, lightbox }:{children:ReactNode, onClose:() => void, background:boolean, lightbox:boolean}) {
    const modalRoot = document.getElementById('modal-root');

    if (!modalRoot) {
        throw new Error("Missing #modal-root in HTML");
    }

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl flex items-end justify-center " onClick={onClose}>
            <div className={`${background ? "card" : "panel"} ${lightbox ? "" : "sm:max-w-md"} flex-col w-full  sm:rounded-xl sm:fixed sm:left-1/2 sm:top-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2`} onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="btn border-none self-end"><XIcon className="text-tw-text hover:text-indigo-600"/></button>
                {children}
            </div>
        </div>,
        modalRoot
    );
}