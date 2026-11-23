export type EmailMode = "login" | "signup";

export interface EmailAuthFormProps {
  variant?: "full" | "compact";
  onSignedIn?: () => void;
  className?: string;
}