import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return <AuthShell title="Definí una nueva contraseña" description="El cambio se aplica a tu sesión verificada."><ResetPasswordForm /></AuthShell>;
}
