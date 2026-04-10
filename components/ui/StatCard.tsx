type StatCardProps = {
  title: string;
  value: string | number;
  icon: string;
  color: string;
};

export default function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className={`rounded-2xl p-6 text-white shadow-lg ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}