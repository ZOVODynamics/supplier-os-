import { auth } from "@/lib/auth";
import { User, Mail, Shield, Bell } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      {/* Profile Section */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Profile</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              {session?.user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">
                {session?.user?.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {session?.user?.email}
              </p>
            </div>
          </div>

          <div className="grid gap-4 pt-4 border-t border-border">
            <div>
              <label className="text-sm font-medium text-foreground">Name</label>
              <input
                type="text"
                defaultValue={session?.user?.name || ""}
                className="mt-1 flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                disabled
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                defaultValue={session?.user?.email || ""}
                className="mt-1 flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      {/* Account Type */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Account Type</h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground capitalize">
              {session?.user?.role} Account
            </p>
            <p className="text-sm text-muted-foreground">
              {session?.user?.role === "company"
                ? "You can create and manage supply requests"
                : session?.user?.role === "supplier"
                ? "You can view and respond to supply requests"
                : "You have full administrative access"}
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary capitalize">
            {session?.user?.role}
          </span>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              title: "Email Notifications",
              description: "Receive updates about your requests via email",
            },
            {
              title: "Match Alerts",
              description: "Get notified when new suppliers are matched",
            },
            {
              title: "Status Updates",
              description: "Receive updates when request status changes",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-center justify-between py-2"
            >
              <div>
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-background after:shadow-sm after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-destructive/50 bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-destructive mb-4">
          Danger Zone
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        <button
          disabled
          className="inline-flex h-10 items-center justify-center rounded-md bg-destructive/10 px-4 text-sm font-medium text-destructive hover:bg-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
