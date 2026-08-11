"use client";

import { useState } from "react";

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
      <button type="button" onClick={() => setOpen(true)}>
        Delete
      </button>

      {open && (
        <section>
          <h2>{title}</h2>

          <p>{message}</p>

          {error && <p>{error}</p>}

          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={deleting}
          >
            Cancel
          </button>

          <button type="button" onClick={handleConfirm} disabled={deleting}>
            {deleting ? "Deleting..." : "Confirm Delete"}
          </button>
        </section>
      )}
    </>
  );
}
