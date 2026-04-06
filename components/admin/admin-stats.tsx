interface AdminStatsProps {
  stats: {
    totalToday: number;
    pending: number;
    notified: number;
    rescued: number;
  };
}

export default function AdminStats({ stats }: AdminStatsProps) {
  const cards = [
    {
      label: 'Total Reports Today',
      value: stats.totalToday,
      color: 'bg-blue-50 text-blue-900',
      borderColor: 'border-blue-200',
    },
    {
      label: 'Rescue Pending',
      value: stats.pending,
      color: 'bg-amber-50 text-amber-900',
      borderColor: 'border-amber-200',
    },
    {
      label: 'Volunteer Notified',
      value: stats.notified,
      color: 'bg-purple-50 text-purple-900',
      borderColor: 'border-purple-200',
    },
    {
      label: 'Rescued',
      value: stats.rescued,
      color: 'bg-green-50 text-green-900',
      borderColor: 'border-green-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`rounded-lg border-2 p-6 ${card.color} ${card.borderColor}`}
        >
          <p className="text-sm font-medium mb-2">{card.label}</p>
          <p className="text-3xl font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
