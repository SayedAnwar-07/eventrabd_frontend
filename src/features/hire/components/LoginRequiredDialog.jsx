import { useLocation, useNavigate } from "react-router-dom";

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
} from "@/components/ui/alert-dialog";

const LoginRequiredDialog = ({ trigger }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    navigate("/login", {
      state: {
        from: `${location.pathname}${location.search}`,
      },
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent className="">
        <AlertDialogHeader className="text-left">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
            Authentication Required
          </p>

          <AlertDialogTitle className="text-2xl font-semibold tracking-tight text-gray-950">
            Log in to hire this seller
          </AlertDialogTitle>

          <AlertDialogDescription className="text-sm leading-6 text-gray-600">
            You need to log in as a customer before you can submit a hire
            request for this service.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction type="button" onClick={handleLogin}>
            Log In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LoginRequiredDialog;
