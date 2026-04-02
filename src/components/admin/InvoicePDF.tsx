import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { Invoice, Order, Client, OrderItem } from '@/types'
import { formatGNF, formatDate } from '@/lib/utils'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
  },
  header: {
    backgroundColor: '#0A0A0A',
    padding: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: { color: '#C8952A', fontSize: 22, fontFamily: 'Helvetica-Bold' },
  headerSubtitle: { color: '#F4F2EE', fontSize: 11, marginTop: 2 },
  headerSmall: { color: '#888888', fontSize: 8, marginTop: 1 },
  invoiceInfo: { textAlign: 'right' },
  invoiceNumber: { color: '#C8952A', fontSize: 16, fontFamily: 'Helvetica-Bold' },
  section: { padding: '20 30' },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    color: '#0A0A0A',
    borderBottomWidth: 1,
    borderBottomColor: '#C8952A',
    paddingBottom: 4,
  },
  infoRow: { flexDirection: 'row', marginBottom: 3 },
  infoLabel: { width: 100, color: '#666666', fontSize: 9 },
  infoValue: { flex: 1, color: '#1a1a1a' },
  table: { marginTop: 8 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0A',
    padding: '6 8',
    borderRadius: 2,
  },
  tableHeaderText: { color: '#C8952A', fontSize: 9, fontFamily: 'Helvetica-Bold' },
  tableRow: {
    flexDirection: 'row',
    padding: '6 8',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: '6 8',
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  col1: { flex: 3 },
  col2: { width: 50, textAlign: 'center' },
  col3: { width: 80, textAlign: 'right' },
  col4: { width: 80, textAlign: 'right' },
  total: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: '0 30',
  },
  totalBox: {
    backgroundColor: '#0A0A0A',
    padding: 12,
    borderRadius: 4,
    minWidth: 200,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  totalLabel: { color: '#888888', fontSize: 9 },
  totalValue: { color: '#F4F2EE', fontSize: 9, fontFamily: 'Helvetica-Bold' },
  grandTotalLabel: { color: '#C8952A', fontSize: 11, fontFamily: 'Helvetica-Bold' },
  grandTotalValue: { color: '#C8952A', fontSize: 11, fontFamily: 'Helvetica-Bold' },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    paddingTop: 8,
  },
  footerText: { color: '#aaaaaa', fontSize: 8, textAlign: 'center' },
})

interface InvoicePDFProps {
  invoice: Invoice
  order: Order & { client?: Client; order_items?: (OrderItem & { packaging?: any })[] }
}

export default function InvoicePDF({ invoice, order }: InvoicePDFProps) {
  const client = order.client
  const items = order.order_items || []

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>MASTER OIL GUINÉE</Text>
            <Text style={styles.headerSubtitle}>Distributeur exclusif de Master Oil Canada en Guinée</Text>
            <Text style={styles.headerSmall}>Conakry, République de Guinée</Text>
            <Text style={styles.headerSmall}>Huiles moteur synthétiques</Text>
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
            <Text
              style={{
                color: '#888888',
                fontSize: 9,
                textAlign: 'right',
                marginTop: 4,
              }}
            >
              Date : {formatDate(invoice.created_at)}
            </Text>
          </View>
        </View>

        {/* Client Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FACTURER À</Text>
          {client && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nom :</Text>
                <Text style={styles.infoValue}>{client.name}</Text>
              </View>
              {client.phone && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Téléphone :</Text>
                  <Text style={styles.infoValue}>{client.phone}</Text>
                </View>
              )}
              {client.email && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email :</Text>
                  <Text style={styles.infoValue}>{client.email}</Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Type :</Text>
                <Text style={styles.infoValue}>{client.client_type}</Text>
              </View>
            </>
          )}
          <View style={[styles.infoRow, { marginTop: 6 }]}>
            <Text style={styles.infoLabel}>Statut paiement :</Text>
            <Text
              style={[
                styles.infoValue,
                {
                  fontFamily: 'Helvetica-Bold',
                  color:
                    invoice.status === 'paye'
                      ? '#16a34a'
                      : '#d97706',
                },
              ]}
            >
              {invoice.status === 'en_attente'
                ? 'En attente'
                : invoice.status === 'partiel'
                ? 'Paiement partiel'
                : 'Payé'}
            </Text>
          </View>
        </View>

        {/* Items */}
        <View style={[styles.section, { paddingTop: 0 }]}>
          <Text style={styles.sectionTitle}>DÉTAIL DE LA COMMANDE</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.col1]}>Produit</Text>
              <Text style={[styles.tableHeaderText, styles.col2]}>Qté</Text>
              <Text style={[styles.tableHeaderText, styles.col3]}>Prix unitaire</Text>
              <Text style={[styles.tableHeaderText, styles.col4]}>Total</Text>
            </View>
            {items.map((item, i) => (
              <View key={item.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={styles.col1}>
                  {item.packaging?.product?.name || 'Produit'}
                  {item.packaging ? ` — ${item.packaging.volume_liters}L` : ''}
                </Text>
                <Text style={styles.col2}>{item.quantity}</Text>
                <Text style={styles.col3}>{formatGNF(item.unit_price_gnf)}</Text>
                <Text style={styles.col4}>
                  {formatGNF(item.quantity * item.unit_price_gnf)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Total */}
        <View style={styles.total}>
          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <Text style={styles.grandTotalLabel}>TOTAL</Text>
              <Text style={styles.grandTotalValue}>{formatGNF(order.total_gnf)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Master Oil Guinée · Conakry, République de Guinée · Distributeur exclusif de Master Oil Canada en Guinée
          </Text>
          <Text style={[styles.footerText, { marginTop: 2 }]}>{invoice.invoice_number}</Text>
        </View>
      </Page>
    </Document>
  )
}
