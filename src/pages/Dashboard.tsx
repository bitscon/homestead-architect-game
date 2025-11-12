import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus,
  DollarSign,
  Heart,
  BookOpen,
  Package,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Cloud,
  Droplets,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { getTasks } from '@/features/tasks/api';
import { getTransactions } from '@/features/finance/api';
import { getAnimals } from '@/features/animals/api';
import { format, isAfter, isBefore, addDays, startOfMonth, endOfMonth } from 'date-fns';

const Dashboard = () => {
  const { profile, user } = useAuth();
  const [zipCode, setZipCode] = useState('');
  const displayName = profile?.first_name || user?.email?.split('@')[0] || 'there';
  
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  // Fetch data
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => getTasks(user!.id),
    enabled: !!user?.id,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: () => getTransactions(user!.id, {
      start_date: format(startOfMonth(now), 'yyyy-MM-dd'),
      end_date: format(endOfMonth(now), 'yyyy-MM-dd'),
    }),
    enabled: !!user?.id,
  });

  const { data: animals = [] } = useQuery({
    queryKey: ['animals', user?.id],
    queryFn: () => getAnimals(user!.id),
    enabled: !!user?.id,
  });

  // Calculate upcoming tasks (next 7 days)
  const upcomingTasks = tasks
    .filter(t => t.due_date && isAfter(new Date(t.due_date), now) && isBefore(new Date(t.due_date), addDays(now, 7)))
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5);

  // Calculate monthly finances
  const monthlyIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netIncome = monthlyIncome - monthlyExpenses;

  // Calculate task statistics
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const activeTasksCount = tasks.filter(t => t.status === 'in_progress').length;
  const pendingTasksCount = tasks.filter(t => t.status === 'pending').length;

  // Quick actions
  const quickActions = [
    { title: 'New Task', icon: Plus, href: '/seasonal-calendar', color: 'bg-blue-500' },
    { title: 'Log Expense', icon: DollarSign, href: '/homestead-balance', color: 'bg-green-500' },
    { title: 'Animal Care', icon: Heart, href: '/health-hub', color: 'bg-red-500' },
    { title: 'Journal Entry', icon: BookOpen, href: '/journal', color: 'bg-purple-500' },
    { title: 'Check Inventory', icon: Package, href: '/inventory', color: 'bg-orange-500' },
    { title: 'Ask Community', icon: Users, href: 'https://community.homesteadarchitect.com', color: 'bg-teal-500', external: true },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'in_progress': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
      {/* Main Content */}
      <div className="space-y-6">
        {/* Hero Section */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {greeting}, {displayName}!
          </h1>
          <p className="text-muted-foreground">
            Here's a snapshot of your homestead today.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Tasks"
            value={activeTasksCount}
            icon={Clock}
            tone="blue"
            description="Currently in progress"
            href="/seasonal-calendar"
          />
          <StatCard
            title="Pending Tasks"
            value={pendingTasksCount}
            icon={Target}
            tone="amber"
            description="Awaiting action"
            href="/seasonal-calendar"
          />
          <StatCard
            title="This Month's Net"
            value={`$${netIncome.toFixed(0)}`}
            icon={TrendingUp}
            tone={netIncome >= 0 ? "green" : "neutral"}
            description={format(now, 'MMMM yyyy')}
            href="/homestead-balance"
          />
          <StatCard
            title="Animals"
            value={animals.length}
            icon={Heart}
            tone="green"
            description="Total tracked"
            href="/health-hub"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              if (action.external) {
                return (
                  <a
                    key={action.title}
                    href={action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${action.color} rounded-lg shadow-md p-6 flex flex-col items-center justify-center gap-3 hover:shadow-lg transition-shadow text-white`}
                  >
                    <Icon className="h-8 w-8" />
                    <span className="font-medium text-center">{action.title}</span>
                  </a>
                );
              }
              return (
                <Link
                  key={action.title}
                  to={action.href}
                  className={`${action.color} rounded-lg shadow-md p-6 flex flex-col items-center justify-center gap-3 hover:shadow-lg transition-shadow text-white`}
                >
                  <Icon className="h-8 w-8" />
                  <span className="font-medium text-center">{action.title}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Tasks due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <p className="text-muted-foreground text-sm">No upcoming tasks. You're all caught up!</p>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3 flex-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Due {format(new Date(task.due_date!), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Finances & Projects */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* This Month's Finances */}
          <Card>
            <CardHeader>
              <CardTitle>This Month's Finances</CardTitle>
              <CardDescription>{format(now, 'MMMM yyyy')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Income</span>
                <span className="text-lg font-semibold text-green-600">${monthlyIncome.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Expenses</span>
                <span className="text-lg font-semibold text-red-600">${monthlyExpenses.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Net Income</span>
                  <span className={`text-xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${netIncome.toFixed(2)}
                  </span>
                </div>
              </div>
              <Link to="/homestead-balance">
                <Button variant="outline" className="w-full mt-2">View Details</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Active Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>Goals in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.filter(t => t.status === 'in_progress').slice(0, 3).length === 0 ? (
                  <p className="text-muted-foreground text-sm">No active projects. Start a new goal!</p>
                ) : (
                  tasks.filter(t => t.status === 'in_progress').slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{task.title}</span>
                    </div>
                  ))
                )}
              </div>
              <Link to="/goals">
                <Button variant="outline" className="w-full mt-4">Manage Goals</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        {/* Animal Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Animal Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            {animals.length === 0 ? (
              <p className="text-muted-foreground text-sm">No animals tracked yet.</p>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Animals</span>
                  <span className="font-semibold">{animals.length}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>All animals healthy</span>
                </div>
              </div>
            )}
            <Link to="/health-hub">
              <Button variant="outline" className="w-full mt-4">View Details</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Weather & Growing Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-blue-500" />
              Weather & Growing Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter ZIP code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => alert('Weather API integration coming soon!')}>
                Get Weather
              </Button>
            </div>
            <div className="space-y-3 p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Temperature</span>
                <span className="font-semibold">72°F</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Droplets className="h-4 w-4" />
                  Humidity
                </span>
                <span className="font-semibold">65%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Conditions</span>
                <span className="font-semibold">Partly Cloudy</span>
              </div>
              <p className="text-xs text-muted-foreground italic mt-2">
                Mock data - Enter ZIP and click Get Weather for real data
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
