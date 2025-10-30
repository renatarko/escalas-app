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

type AlertCustomProps = {
  title?: string;
  description?: string;
  disabled?: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  handleConfirm: () => void;
};

export const AlertCustom = ({
  title = "Tem certeza?",
  description = "Esta é uma ação irreversível, deseja realmente prosseguir?",
  disabled,
  open,
  setOpen,
  handleConfirm,
}: AlertCustomProps) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogTrigger />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction disabled={disabled} onClick={handleConfirm}>
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
