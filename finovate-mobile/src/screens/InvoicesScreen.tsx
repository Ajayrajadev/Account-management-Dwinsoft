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
import { invoicesApi } from '../services/api';
import { Invoice } from '../types';

const InvoicesScreen = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await invoicesApi.getAll();
      setInvoices(response.data.data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      Alert.alert('Error', 'Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInvoices();
    setRefreshing(false);
  };

  const handleStatusChange = async (invoice: Invoice) => {
    try {
      if (invoice.status === 'PAID') {
        await invoicesApi.markUnpaid(invoice.id);
      } else {
        await invoicesApi.markPaid(invoice.id);
      }
      await fetchInvoices(); // Refresh the list
      Alert.alert('Success', `Invoice marked as ${invoice.status === 'PAID' ? 'unpaid' : 'paid'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update invoice status');
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return '#10B981';
      case 'PENDING':
        return '#F59E0B';
      case 'OVERDUE':
        return '#EF4444';
      case 'CANCELLED':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const renderInvoice = ({ item }: { item: Invoice }) => (
    <View style={styles.invoiceItem}>
      <View style={styles.invoiceHeader}>
        <View style={styles.invoiceInfo}>
          <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
          <Text style={styles.clientName}>{item.clientName}</Text>
          <Text style={styles.invoiceDate}>
            {formatDate(item.issueDate)}
            {item.dueDate && ` • Due: ${formatDate(item.dueDate)}`}
          </Text>
        </View>
        <View style={styles.invoiceAmount}>
          <Text style={styles.amountText}>{formatCurrency(item.totalAmount)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
      
      {item.items && item.items.length > 0 && (
        <View style={styles.itemsContainer}>
          <Text style={styles.itemsTitle}>Items:</Text>
          {item.items.slice(0, 2).map((invoiceItem, index) => (
            <Text key={index} style={styles.itemText}>
              • {invoiceItem.name} ({invoiceItem.quantity}x) - {formatCurrency(invoiceItem.amount)}
            </Text>
          ))}
          {item.items.length > 2 && (
            <Text style={styles.moreItems}>+{item.items.length - 2} more items</Text>
          )}
        </View>
      )}

      <View style={styles.invoiceActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: item.status === 'PAID' ? '#FEF2F2' : '#ECFDF5' },
          ]}
          onPress={() => handleStatusChange(item)}
        >
          <Ionicons
            name={item.status === 'PAID' ? 'close-circle' : 'checkmark-circle'}
            size={16}
            color={item.status === 'PAID' ? '#EF4444' : '#10B981'}
          />
          <Text
            style={[
              styles.actionButtonText,
              { color: item.status === 'PAID' ? '#EF4444' : '#10B981' },
            ]}
          >
            Mark as {item.status === 'PAID' ? 'Unpaid' : 'Paid'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const calculateTotals = () => {
    const total = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paid = invoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const pending = total - paid;

    return { total, paid, pending };
  };

  const totals = calculateTotals();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading invoices...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Invoices</Text>
        <Text style={styles.subtitle}>Create and manage your invoices</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Value</Text>
          <Text style={[styles.summaryValue, { color: '#3B82F6' }]}>
            {formatCurrency(totals.total)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Paid</Text>
          <Text style={[styles.summaryValue, { color: '#10B981' }]}>
            {formatCurrency(totals.paid)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Pending</Text>
          <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
            {formatCurrency(totals.pending)}
          </Text>
        </View>
      </View>

      {/* Invoices List */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>All Invoices</Text>
          <Text style={styles.invoiceCount}>
            {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <FlatList
          data={invoices}
          renderItem={renderInvoice}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No invoices yet</Text>
              <Text style={styles.emptySubtext}>
                Your invoices will appear here
              </Text>
            </View>
          }
        />
      </View>

      {/* Add Invoice Button */}
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
    marginBottom: 24,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  invoiceCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    paddingBottom: 80,
  },
  invoiceItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  invoiceAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  moreItems: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  invoiceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
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
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default InvoicesScreen;
