"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface ConfirmDeleteProps {
  title?: string;
  message?: string;
  onConfirm: () => Promise<void> | void;
}

export default function ConfirmDelete({
  title = "Delete Project",
  message = "Are you sure you want to delete this project?",
  onConfirm,
}: ConfirmDeleteProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setError("");
    setDeleting(true);

    try {
      await onConfirm();
      setOpen(false);
    } catch (error: any) {
      setError(error?.response?.data?.error || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Button type="button" variant="danger" onClick={() => setOpen(true)}>
        Delete
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/80 p-4">
          <Card className="w-full max-w-md">
            <CardHeader label="// CONFIRM">
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-text-secondary">{message}</p>

              {error && <Alert>{error}</Alert>}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  variant="danger"
                  onClick={handleConfirm}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
