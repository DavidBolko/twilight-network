import {createPortal} from "react-dom";
import type {ReactNode} from "react";
import {XIcon} from "lucide-react";

export default function Modal({ children, onClose, background, lightbox, title }:{children:ReactNode, onClose:() => void, background:boolean, lightbox:boolean, title?:string}) {
    const modalRoot = document.getElementById('modal-root');

    if (!modalRoot) {
        throw new Error("Missing #modal-root in HTML");
    }

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl flex items-end justify-center " onClick={onClose}>
            <div className={`${background ? "card" : "panel"} ${lightbox ? "" : "sm:max-w-md"} flex-col w-full sm:rounded-xl sm:fixed sm:left-1/2 sm:top-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2`} onClick={(e) => e.stopPropagation()}>
                <span className="flex justify-between items-center px-2 pb-2 border-b border-tw-border ">
                    <p className="text-xl font-black uppercase italic">{title}</p>
                    <button onClick={onClose} className="btn border-none"><XIcon className="text-tw-text  hover:text-indigo-600"/></button>
                </span>
                {children}
            </div>
        </div>,
        modalRoot
    );
}