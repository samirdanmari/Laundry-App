interface RangeSummary {
  date: string;
  paid: number;
  unpaid: number;
  unconfirmed: number;
  total: number;
}
export interface Report {
  reportType: 'daily' | 'range';
  statusFilter: 'All' | 'Paid' | 'Unpaid' | 'Unconfirmed';
  startDate: string;
  endDate: string;
  totalOrders: number;
  totalRevenue: number;
  totalPaid: number;
  unconfirmedTotal: number;
  unpaidTotal: number;
  paidCount: number;
  avgPerDay: number;
  table: DailyRow[]; // for daily
  rangeTable?: RangeSummary[]; // for range
}

interface DailyRow {
  room: string;
  name: string;
  amount: number;
  payment_status: string;
}

interface RangeGroup {
  date: string;
  entries: DailyRow[];
}

