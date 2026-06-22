import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, message, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { appService, AppInfo } from '../services/api';

const AppList: React.FC = () => {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async (search?: string) => {
    setLoading(true);
    try {
      const { data } = await appService.getApps({ search });
      setApps(data);
    } catch (error) {
      message.error('加载应用列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除应用"${name}"吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await appService.deleteApp(id);
          message.success('删除成功');
          loadApps();
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    loadApps(value || undefined);
  };

  const columns = [
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 80,
      render: (icon: string) => (
        <img
          src={icon || '/default-icon.png'}
          alt="app icon"
          style={{ width: 40, height: 40, objectFit: 'contain' }}
        />
      )
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 100,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          published: 'green',
          draft: 'gold',
          archived: 'default'
        };
        const labelMap: Record<string, string> = {
          published: '已发布',
          draft: '草稿',
          archived: '已归档'
        };
        return <Tag color={colorMap[status]}>{labelMap[status]}</Tag>;
      }
    },
    {
      title: '下载量',
      dataIndex: 'downloadCount',
      key: 'downloadCount',
      width: 100,
      sorter: (a: AppInfo, b: AppInfo) => a.downloadCount - b.downloadCount,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: AppInfo) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/apps/edit/${record._id}`)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id, record.name)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>应用管理</h2>
        <Space>
          <Input
            placeholder="搜索应用..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => handleSearch(e.target.value)}
            style={{ width: 250 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/apps/create')}
          >
            发布应用
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={apps}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default AppList;
