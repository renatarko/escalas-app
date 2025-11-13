import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

type PreviewSchedulesMembersProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  children: React.ReactNode;
  title: string;
  description: string;
  handleCleanClick: () => void;
  handleConfirmClick: () => Promise<void> | void;
  disabled?: boolean;
  labelBtnClose?: string;
  labelBtnConfirm?: string;
};

export const DialogScheduleForm = ({
  open,
  setOpen,
  handleCleanClick,
  disabled,
  handleConfirmClick,
  children,
  title,
  description,
  labelBtnClose = "Cancelar",
  labelBtnConfirm = "Confirmar",
}: PreviewSchedulesMembersProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            onClick={handleCleanClick}
          >
            {labelBtnClose}
          </Button>
          <Button
            type="button"
            onClick={handleConfirmClick}
            disabled={disabled}
          >
            {labelBtnConfirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
