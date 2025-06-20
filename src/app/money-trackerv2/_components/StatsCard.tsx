export default function StatsCard({
  icon,
  label,
  value,
  isPositive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isPositive?: boolean;
}) {
  const colorClass =
    isPositive !== undefined
      ? isPositive
        ? 'text-green-600 dark:text-green-400'
        : 'text-red-600 dark:text-red-400'
      : '';

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className={`text-lg font-semibold ${colorClass}`}>{value}</p>
    </div>
  );
}
