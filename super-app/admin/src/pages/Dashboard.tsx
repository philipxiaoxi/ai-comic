import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import { AppstoreOutlined, DownloadOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { appService, AppInfo } from '../services/api';

const Dashboard: React.FC = () => {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      const { data } = await appService.getApps();
      setApps(data);
    } catch (error) {
      console.error('Failed to load apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const publishedApps = apps.filter(app => app.status === 'published');
  const totalDownloads = apps.reduce((sum, app) => sum + app.downloadCount, 0);

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  return (
    <div>
      <h2>仪表盘</h2>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="已发布应用"
              value={publishedApps.length}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="总应用数"
              value={apps.length}
              prefix={<CloudUploadOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="总下载量"
              value={totalDownloads}
              prefix={<DownloadOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="最近发布的应用" style={{ marginTop: 24 }}>
        {publishedApps.slice(0, 5).map(app => (
          <div key={app._id} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
            <strong>{app.name}</strong> - {app.description}
            <span style={{ float: 'right', color: '#999' }}>
              {app.downloadCount} 次下载
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default Dashboard;
