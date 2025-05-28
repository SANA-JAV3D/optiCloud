import React from 'react'
import { useSelector } from 'react-redux'
import { useGetAdminStatsQuery } from '../../../../redux/features/stats/statsApi';
import AdminStats from './AdminStats';
import AdminStatsChart from './AdminStatsChart';
import { Link } from 'react-router-dom';
import {
  ShoppingBagIcon,
  UsersIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const AdminDMain = () => {
  const { user } = useSelector((state) => state.auth);
  const { data: stats, error, isLoading } = useGetAdminStatsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">Dashboard statistics are not available at the moment.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">Failed to load dashboard statistics.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate percentage changes (mock data - you'd want to get this from your API)
  const previousMonthEarnings = stats.totalEarnings * 0.85; // Mock previous month
  const earningsChange = ((stats.totalEarnings - previousMonthEarnings) / previousMonthEarnings * 100).toFixed(1);

  const quickStats = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalEarnings?.toLocaleString() || 0}`,
      change: earningsChange,
      changeType: earningsChange > 0 ? 'increase' : 'decrease',
      icon: CurrencyDollarIcon,
      color: 'indigo',
      description: 'Total earnings this month'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders?.toLocaleString() || 0,
      change: '+12.5',
      changeType: 'increase',
      icon: ShoppingBagIcon,
      color: 'blue',
      description: 'Orders placed this month'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts?.toLocaleString() || 0,
      change: '+3.2',
      changeType: 'increase',
      icon: CubeIcon,
      color: 'green',
      description: 'Products in inventory'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers?.toLocaleString() || 0,
      change: '+8.1',
      changeType: 'increase',
      icon: UsersIcon,
      color: 'purple',
      description: 'Registered users'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Product',
      description: 'Add a new product to your inventory',
      icon: PlusIcon,
      color: 'bg-green-500',
      link: '/dashboard/add-product'
    },
    {
      title: 'Manage Orders',
      description: 'View and update order statuses',
      icon: ShoppingBagIcon,
      color: 'bg-blue-500',
      link: '/dashboard/manage-orders'
    },
    {
      title: 'View Products',
      description: 'Manage your product catalog',
      icon: EyeIcon,
      color: 'bg-indigo-500',
      link: '/dashboard/manage-products'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and roles',
      icon: UsersIcon,
      color: 'bg-purple-500',
      link: '/dashboard/users'
    }
  ];

  const recentActivities = [
    {
      title: 'New order received',
      description: 'Order #12345 from customer@email.com',
      time: '2 minutes ago',
      icon: ShoppingBagIcon,
      iconColor: 'text-blue-600'
    },
    {
      title: 'Product stock low',
      description: 'Spherical Lens has only 3 units left',
      time: '15 minutes ago',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-yellow-600'
    },
    {
      title: 'New user registered',
      description: 'newuser@email.com joined the platform',
      time: '1 hour ago',
      icon: UsersIcon,
      iconColor: 'text-green-600'
    },
    {
      title: 'Order completed',
      description: 'Order #12340 has been delivered',
      time: '2 hours ago',
      icon: CheckCircleIcon,
      iconColor: 'text-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.username}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your store today.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <BellIcon className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Cog6ToothIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stat.changeType === 'increase'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {stat.changeType === 'increase' ? (
                      <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                    )}
                    {stat.change}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Stats Component */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Performance Overview</h2>
                <ChartBarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <AdminStats stats={stats} />
            </div>

            {/* Enhanced Charts Component */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <AdminStatsChart stats={stats} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                  >
                    <div className={`p-2 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
                      <action.icon className="h-4 w-4" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{action.title}</p>
                      <p className="text-xs text-gray-500">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="p-1.5 rounded-full bg-gray-100">
                        <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link
                  to="/dashboard/activity"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View all activity →
                </Link>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Server Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Backup</span>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Storage Used</span>
                  <span className="text-xs text-gray-500">45.2 GB / 100 GB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDMain;