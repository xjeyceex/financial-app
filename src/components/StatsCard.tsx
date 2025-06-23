export default function StatsCard({
  icon,
  label,
  value,
  isPositive,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isPositive?: boolean; // true = green, false = red, undefined = neutral
  color?: string; // Optional manual override
}) {
  const colorClass = color
    ? color
    : isPositive === true
      ? 'text-green-600 dark:text-green-400'
      : isPositive === false
        ? 'text-red-600 dark:text-red-400'
        : 'text-muted-foreground';

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
