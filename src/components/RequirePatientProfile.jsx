import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import Loader from "./Loader";
import { patientProfileService } from "../services/patientProfileService";

// Gates patient-only routes behind mandatory profile completion.
// Non-patient roles pass through untouched.
function RequirePatientProfile({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const [status, setStatus] = useState(null);
  const [checkFailed, setCheckFailed] = useState(false);

  const clerkId = user?.id;
  // Role hint stored by the login/register flow; backend re-verifies anyway.
  const roleHint = localStorage.getItem("userRole") || "";

  useEffect(() => {
    if (!isSignedIn || !clerkId) return;
    let cancelled = false;

    patientProfileService
      .getProfileStatus(clerkId, roleHint)
      .then((data) => {
        if (!cancelled) setStatus(data);
      })
      .catch((err) => {
        console.error("Profile status check failed:", err?.message);
        if (!cancelled) setCheckFailed(true);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, clerkId]);

  if (!isLoaded || (isSignedIn && !userLoaded)) {
    return <Loader text="Authenticating..." />;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // If the status check fails, do not lock the user out of the app.
  if (checkFailed) {
    return children;
  }

  if (!status) {
    return <Loader text="Checking your profile..." />;
  }

  if (status.role === "patient" && !status.isProfileComplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
}

export default RequirePatientProfile;
