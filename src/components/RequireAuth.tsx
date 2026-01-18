import { cloneElement, isValidElement } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

type Props = {
  children: React.ReactElement;
  onAuthed?: () => void;
  preferredTab?: "login" | "register";
};

export default function RequireAuth({ children, onAuthed, preferredTab = "login" }: Props) {
  const requireAuth = useRequireAuth();

  if (!isValidElement(children)) return children as any;

  const originalOnClick = (children.props as any)?.onClick as ((e: any) => void) | undefined;

  return cloneElement(children, {
    onClick: (e: any) => {
      e?.preventDefault?.();
      requireAuth(() => {
        originalOnClick?.(e);
        onAuthed?.();
      }, preferredTab);
    },
  });
}


