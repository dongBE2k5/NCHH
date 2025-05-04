// src/components/MyDocument.jsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Style cho PDF
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  section: { marginBottom: 10 },
  title: { fontSize: 18, marginBottom: 15, textAlign: 'center' },
  label: { fontWeight: 'bold' },
});

const MyDocument = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Đơn Xin Xác Nhận</Text>

      <View style={styles.section}>
        <Text><Text style={styles.label}>Họ và tên:</Text> {data.name}</Text>
      </View>
      <View style={styles.section}>
        <Text><Text style={styles.label}>Ngày sinh:</Text> {data.birthday}</Text>
      </View>
      <View style={styles.section}>
        <Text><Text style={styles.label}>Lớp:</Text> {data.className}</Text>
      </View>
      <View style={styles.section}>
        <Text><Text style={styles.label}>Ngành:</Text> {data.major}</Text>
      </View>
    </Page>
  </Document>
);

export default MyDocument;
