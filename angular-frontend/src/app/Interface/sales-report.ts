export interface Report {
  reportType: 'daily' | 'range';
  startDate: string;
  endDate: string;
  totalOrders: number;
  totalPaid: number;
  unconfirmedTotal: number;
  unpaidTotal: number;
  paidCount: number;
  avgPerDay: number;
  table: Array<
    | { room: string; name: string; amount: number }
    | { date: string; amount: number }
  >;
}
