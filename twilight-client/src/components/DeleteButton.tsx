import { TrashIcon } from "lucide-react";
import Modal from "./Modal";
import { useState } from "react";

interface DeleteButtonProps {
  onConfirm: () => void;
  isAuthor: boolean;
}

export const DeleteButton = ({ onConfirm, isAuthor }: DeleteButtonProps) => {
  const [open, setOpen] = useState(false);

  if (isAuthor) {
    return (
      <>
        <button className="p-2 hover:stroke-red-500" onClick={() => setOpen(true)}>
          <TrashIcon className="w-4 h-4" />
        </button>

        {open && (
          <Modal onClose={() => setOpen(false)}>
            <div className="p-4 flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Naozaj chceš odstrániť?</h2>
              <p className="text-sm text-gray-500">Túto akciu už nebude možné vrátiť späť.</p>
              <div className="flex gap-2 justify-end">
                <button className="btn px-3" onClick={() => setOpen(false)}>
                  Zrušiť
                </button>
                <button
                  className="btn danger px-3"
                  onClick={() => {
                    onConfirm();
                    setOpen(false);
                  }}>
                  Odstrániť
                </button>
              </div>
            </div>
          </Modal>
        )}
      </>
    );
  }
};
