import { useEffect, useCallback } from "react";
import { useBlocker } from "react-router-dom";
import Swal from "sweetalert2";

const useUnsavedChanges = (isDirty) => {
  // 1. Browser Native Alert (For Tab Close or F5 Refresh)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ""; // Chrome ke liye zaroori hai
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // 2. React Router Alert (For In-App Link Clicks)
  let blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) =>
        isDirty && currentLocation.pathname !== nextLocation.pathname,
      [isDirty],
    ),
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      Swal.fire({
        title: "Are you sure?",
        text: "You have unsaved changes. If you leave, your data will be lost!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0ea5e9", // accent-1
        cancelButtonColor: "#ef4444", // red-500
        confirmButtonText: "Yes, leave page!",
        cancelButtonText: "No, stay here",
        background: "#0f172a", // card-bg
        color: "#ffffff",
      }).then((result) => {
        if (result.isConfirmed) {
          blocker.proceed(); // User ne kaha leave kar do
        } else {
          blocker.reset(); // User ne kaha ruk jao
        }
      });
    }
  }, [blocker]);
};

export default useUnsavedChanges;
