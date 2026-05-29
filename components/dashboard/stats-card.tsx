import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
}: StatsCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-bold">
            {value}
          </h3>

          {description && (
            <p className="mt-1 text-sm text-gray-400">
              {description}
            </p>
          )}
        </div>

        <div className="rounded-lg bg-gray-100 p-3">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
