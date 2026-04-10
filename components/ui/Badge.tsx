type BadgeProps = { status: string };

const colors: any = {
  New: 'bg-blue-100 text-blue-700',
  Contacted: 'bg-yellow-100 text-yellow-700',
  Interested: 'bg-purple-100 text-purple-700',
  Paid: 'bg-green-100 text-green-700',
  Admitted: 'bg-emerald-100 text-emerald-700',
};

export default function Badge({ status }: BadgeProps) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}