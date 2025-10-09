import { TrendingUp, TrendingDown, Package, Leaf, Recycle, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  accentColor: string;
}

function StatCard({ title, value, subtitle, trend, icon, accentColor }: StatCardProps) {
  return (
    <Card className="border-l-4" style={{ borderLeftColor: `hsl(var(--${accentColor}))` }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="p-2 rounded-lg bg-muted/50">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-3xl font-bold text-primary" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              trend.isPositive ? 'text-primary' : 'text-destructive'
            }`}>
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  stats?: {
    wasteDiverted: number;
    co2Saved: number;
    exchanges: number;
    activeListings: number;
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const defaultStats = stats || {
    wasteDiverted: 1247,
    co2Saved: 523,
    exchanges: 45,
    activeListings: 12,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Waste Diverted"
        value={`${defaultStats.wasteDiverted}kg`}
        subtitle="Total materials exchanged"
        trend={{ value: 12, isPositive: true }}
        icon={<Package className="w-5 h-5 text-primary" />}
        accentColor="primary"
      />
      <StatCard
        title="CO₂ Saved"
        value={`${defaultStats.co2Saved}kg`}
        subtitle="Environmental impact"
        trend={{ value: 8, isPositive: true }}
        icon={<Leaf className="w-5 h-5 text-primary" />}
        accentColor="primary"
      />
      <StatCard
        title="Exchanges"
        value={defaultStats.exchanges}
        subtitle="Successful connections"
        icon={<Recycle className="w-5 h-5 text-accent" />}
        accentColor="accent"
      />
      <StatCard
        title="Active Listings"
        value={defaultStats.activeListings}
        subtitle="Currently available"
        icon={<ArrowUpRight className="w-5 h-5 text-chart-3" />}
        accentColor="chart-3"
      />
    </div>
  );
}
