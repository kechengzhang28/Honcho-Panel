import { AlertTriangle } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default";
  onConfirm: () => void;
  children: ReactNode;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "destructive",
  onConfirm,
  children,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-muted)]">
              <AlertTriangle className="h-5 w-5 text-[var(--color-destructive)]" />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-1">{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
