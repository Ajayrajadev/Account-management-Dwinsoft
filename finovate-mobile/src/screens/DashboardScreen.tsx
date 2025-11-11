import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Dimensions,
} from 'react-native';
// Charts will be implemented with simple components for now
import { dashboardApi } from '../services/api';
import { DashboardSummary } from '../types';
import { getShadowStyle, getCardStyle } from '../utils/styles';

const { width: screenWidth } = Dimensions.get('window');

const DashboardScreen = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardApi.getSummary();
      setSummary(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const StatCard = ({ title, value, color = '#3B82F6' }: { title: string; value: number; color?: string }) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{formatCurrency(value)}</Text>
    </View>
  );

  const prepareIncomeExpenseData = () => {
    if (!summary?.incomeExpenseData || summary.incomeExpenseData.length === 0) {
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr'],
        datasets: [
          {
            data: [5000, 6000, 5500, 7000],
            color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
            strokeWidth: 2,
          },
          {
            data: [3000, 3500, 3200, 4000],
            color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
            strokeWidth: 2,
          },
        ],
        legend: ['Income', 'Expenses'],
      };
    }

    const labels = summary.incomeExpenseData.slice(-6).map(item => {
      const date = new Date(item.month + '-01');
      return date.toLocaleDateString('en-US', { month: 'short' });
    });

    return {
      labels,
      datasets: [
        {
          data: summary.incomeExpenseData.slice(-6).map(item => item.income),
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: summary.incomeExpenseData.slice(-6).map(item => item.expenses),
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ['Income', 'Expenses'],
    };
  };

  const prepareCategoryData = () => {
    if (!summary?.categoryExpenses || summary.categoryExpenses.length === 0) {
      return [
        { name: 'Food', population: 30, color: '#3B82F6', legendFontColor: '#7F7F7F' },
        { name: 'Transport', population: 20, color: '#EF4444', legendFontColor: '#7F7F7F' },
        { name: 'Utilities', population: 15, color: '#F59E0B', legendFontColor: '#7F7F7F' },
        { name: 'Other', population: 35, color: '#10B981', legendFontColor: '#7F7F7F' },
      ];
    }

    const colors = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#F97316'];
    
    return summary.categoryExpenses.slice(0, 6).map((item, index) => ({
      name: item.category,
      population: item.percentage,
      color: colors[index % colors.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Overview of your finances</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard title="Total Balance" value={summary?.totalBalance || 0} color="#3B82F6" />
          <StatCard title="Invoice Amount" value={summary?.totalInvoiceAmount || 0} color="#8B5CF6" />
          <StatCard title="Monthly Income" value={summary?.monthlyIncome || 0} color="#10B981" />
          <StatCard title="Monthly Expenses" value={summary?.monthlyExpenses || 0} color="#EF4444" />
        </View>

        {/* Income vs Expenses Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Income vs Expenses</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>📊 Chart View</Text>
            <Text style={styles.chartPlaceholderSubtext}>
              Monthly Income: {formatCurrency(summary?.monthlyIncome || 0)}
            </Text>
            <Text style={styles.chartPlaceholderSubtext}>
              Monthly Expenses: {formatCurrency(summary?.monthlyExpenses || 0)}
            </Text>
          </View>
        </View>

        {/* Category Expenses Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Expense Categories</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>🥧 Pie Chart</Text>
            {summary?.categoryExpenses && summary.categoryExpenses.length > 0 ? (
              summary.categoryExpenses.slice(0, 3).map((item, index) => (
                <Text key={index} style={styles.categoryItem}>
                  {item.category}: {item.percentage}% ({formatCurrency(item.amount)})
                </Text>
              ))
            ) : (
              <Text style={styles.chartPlaceholderSubtext}>No expense data available</Text>
            )}
          </View>
        </View>

        {/* Recent Transactions */}
        {summary?.recentTransactions && summary.recentTransactions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {summary.recentTransactions.slice(0, 5).map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription}>{transaction.description}</Text>
                  <Text style={styles.transactionCategory}>{transaction.category}</Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    { color: transaction.type === 'CREDIT' ? '#10B981' : '#EF4444' },
                  ]}
                >
                  {transaction.type === 'CREDIT' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    padding: 16,
    marginBottom: 16,
    marginRight: '2%',
    ...getCardStyle(2),
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  chartContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    ...getCardStyle(2),
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  chartPlaceholderText: {
    fontSize: 24,
    marginBottom: 16,
  },
  chartPlaceholderSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  categoryItem: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 4,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    ...getCardStyle(2),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#6B7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DashboardScreen;
