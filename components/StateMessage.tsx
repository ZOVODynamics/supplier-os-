export function StateMessage({
  type,
  title,
  children
}: {
  type: "loading" | "empty" | "error" | "success";
  title: string;
  children?: React.ReactNode;
}) {
  const className = type === "error" ? "error" : type === "success" ? "success" : "state-card";
  return (
    <div className={className}>
      <strong>{title}</strong>
      {children ? <p className="muted">{children}</p> : null}
    </div>
  );
}
