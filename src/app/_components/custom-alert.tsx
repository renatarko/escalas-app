import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Spinner } from "./ui/spinner";

type AlertCustomProps = {
  title?: string;
  description?: string;
  disabled?: boolean;
  loading?: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  handleConfirm: () => void;
};

export const AlertCustom = ({
  title = "Tem certeza?",
  description = "Esta é uma ação irreversível, deseja realmente prosseguir?",
  disabled,
  loading,
  open,
  setOpen,
  handleConfirm,
}: AlertCustomProps) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogTrigger className="hidden" />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={disabled ?? !!loading}
            onClick={handleConfirm}
          >
            {loading && <Spinner className="size-4" />} Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
