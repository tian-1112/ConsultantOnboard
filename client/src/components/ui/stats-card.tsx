import { Card } from "@/components/ui/card";
import { StatsCardProps } from "@/lib/types";

const StatsCard = ({ title, value, icon, change, changeType = 'neutral', borderColor = 'border-primary' }: StatsCardProps) => {
  // Determine change indicator color and icon
  const getChangeColor = () => {
    if (changeType === 'increase') return 'text-green-500';
    if (changeType === 'decrease') return 'text-red-500';
    return 'text-gray-500';
  };

  const getChangeIcon = () => {
    if (changeType === 'increase') return 'ri-arrow-up-line';
    if (changeType === 'decrease') return 'ri-arrow-down-line';
    return 'ri-time-line';
  };

  return (
    <Card className={`p-4 border-l-4 ${borderColor}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className="h-12 w-12 rounded-full bg-primary-light bg-opacity-20 flex items-center justify-center text-primary">
          <i className={`${icon} text-xl`}></i>
        </div>
      </div>
      {change && (
        <div className={`mt-2 text-sm ${getChangeColor()} flex items-center`}>
          <i className={`${getChangeIcon()} mr-1`}></i>
          <span>{change}</span>
        </div>
      )}
    </Card>
  );
};

export default StatsCard;
