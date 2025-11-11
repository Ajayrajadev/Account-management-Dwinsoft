import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { transactionsApi } from '../services/api';
import { Transaction } from '../types';
import { getCardStyle } from '../utils/styles';

const TransactionsScreen = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await transactionsApi.getAll();
      setTransactions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      Alert.alert('Error', 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Ionicons
          name={item.type === 'CREDIT' ? 'arrow-down' : 'arrow-up'}
          size={20}
          color={item.type === 'CREDIT' ? '#10B981' : '#EF4444'}
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionCategory}>
          {item.category} • {formatDate(item.date)}
        </Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text
          style={[
            styles.amountText,
            { color: item.type === 'CREDIT' ? '#10B981' : '#EF4444' },
          ]}
        >
          {item.type === 'CREDIT' ? '+' : '-'}{formatCurrency(item.amount)}
        </Text>
        <Text style={styles.transactionType}>
          {item.type === 'CREDIT' ? 'Income' : 'Expense'}
        </Text>
      </View>
    </View>
  );

  const calculateTotals = () => {
    const income = transactions
      .filter(t => t.type === 'CREDIT')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'DEBIT')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expenses, balance: income - expenses };
  };

  const totals = calculateTotals();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <Text style={styles.subtitle}>Manage your income and expenses</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: '#ECFDF5' }]}>
          <Text style={styles.summaryLabel}>Total Income</Text>
          <Text style={[styles.summaryValue, { color: '#10B981' }]}>
            {formatCurrency(totals.income)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#FEF2F2' }]}>
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
            {formatCurrency(totals.expenses)}
          </Text>
        </View>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Net Balance</Text>
        <Text
          style={[
            styles.balanceValue,
            { color: totals.balance >= 0 ? '#10B981' : '#EF4444' },
          ]}
        >
          {formatCurrency(totals.balance)}
        </Text>
      </View>

      {/* Transactions List */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>All Transactions</Text>
          <Text style={styles.transactionCount}>
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Your transactions will appear here
              </Text>
            </View>
          }
        />
      </View>

      {/* Add Transaction Button */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  balanceCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    alignItems: 'center',
    ...getCardStyle(2),
  },
  balanceLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
    marginHorizontal: 16,
    ...getCardStyle(2),
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  transactionCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    paddingBottom: 80,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionType: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    ...getCardStyle(5),
    borderRadius: 28,
    backgroundColor: '#3B82F6',
  },
});

export default TransactionsScreen;
