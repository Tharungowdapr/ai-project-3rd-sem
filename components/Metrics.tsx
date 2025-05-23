import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const { Title, Text } = Typography;

interface Metrics {
  total_requests: number;
  successful_analyses: number;
  failed_analyses: number;
  average_processing_time: number;
  last_request_time: string;
  uptime: number;
  status: string;
}

const Metrics: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('https://traffic-monitoring-backend.onrender.com/metrics');
        if (!response.ok) throw new Error('Failed to fetch metrics');
        const data = await response.json();
        setMetrics(data.metrics);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) return <Spin size="large" />;
  if (error) return <Text type="danger">{error}</Text>;
  if (!metrics) return null;

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card title="System Metrics" style={{ margin: '20px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div>
          <Title level={5}>Total Requests</Title>
          <Text>{metrics.total_requests}</Text>
        </div>
        <div>
          <Title level={5}>Successful Analyses</Title>
          <Text>{metrics.successful_analyses}</Text>
        </div>
        <div>
          <Title level={5}>Failed Analyses</Title>
          <Text>{metrics.failed_analyses}</Text>
        </div>
        <div>
          <Title level={5}>Average Processing Time</Title>
          <Text>{metrics.average_processing_time.toFixed(2)}s</Text>
        </div>
        <div>
          <Title level={5}>System Uptime</Title>
          <Text>{formatUptime(metrics.uptime)}</Text>
        </div>
        <div>
          <Title level={5}>Status</Title>
          <Text type={metrics.status === 'operational' ? 'success' : 'warning'}>
            {metrics.status}
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default Metrics; 