import { TrashIcon } from "lucide-react";
import Modal from "./Modal";
import { useState, type SyntheticEvent } from "react";

interface DeleteButtonProps {
  onConfirm: () => void;
  isAuthor: boolean;
}

export const DeleteButton = ({ onConfirm, isAuthor }: DeleteButtonProps) => {
  const [open, setOpen] = useState(false);

  if (isAuthor) {
    return (
      <>
        <button className="p-2 hover:text-red-500" onClick={(e) => {e.stopPropagation();setOpen(true)}}>
          <TrashIcon className="w-4 h-4" />
        </button>

        {open && (
          <Modal onClose={() => setOpen(false)} background={true} lightbox={false}>
            <div className="p-4 flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Do you really want to delete?</h2>
              <p className="text-sm text-gray-500">This can't be undone.</p>
              <div className="flex gap-2 justify-end">
                <button className="btn px-3 hover:text-tw-primary" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button
                  className="btn danger px-3 hover:text-tw-primary"
                  onClick={(e:SyntheticEvent) => {
                    e.stopPropagation()
                    onConfirm();
                    setOpen(false);
                  }}>
                  Remove
                </button>
              </div>
            </div>
          </Modal>
        )}
      </>
    );
  }
};
