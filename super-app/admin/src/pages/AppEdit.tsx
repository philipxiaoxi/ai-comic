import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Upload, Button, Card, message, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { appService, AppInfo } from '../services/api';

const { TextArea } = Input;
const { Option } = Select;

const AppEdit: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [packageFile, setPackageFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [app, setApp] = useState<AppInfo | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      loadApp(id);
    }
  }, [id]);

  const loadApp = async (appId: string) => {
    try {
      const { data } = await appService.getAppById(appId);
      setApp(data);
      form.setFieldsValue({
        name: data.name,
        description: data.description,
        version: data.version,
        developer: data.developer,
        category: data.category,
        status: data.status
      });
    } catch (error) {
      message.error('加载应用信息失败');
      navigate('/apps');
    } finally {
      setFetching(false);
    }
  };

  const onFinish = async (values: any) => {
    if (!id) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('version', values.version);
      formData.append('developer', values.developer);
      formData.append('category', values.category);
      formData.append('status', values.status);
      if (packageFile) {
        formData.append('package', packageFile);
      }
      if (iconFile) {
        formData.append('icon', iconFile);
      }

      await appService.updateApp(id, formData);
      message.success('应用更新成功');
      navigate('/apps');
    } catch (error: any) {
      message.error(error.response?.data?.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  return (
    <div>
      <h2>编辑应用</h2>
      <Card style={{ marginTop: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="name"
            label="应用名称"
            rules={[{ required: true, message: '请输入应用名称' }]}
          >
            <Input placeholder="请输入应用名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="应用描述"
            rules={[{ required: true, message: '请输入应用描述' }]}
          >
            <TextArea rows={4} placeholder="请输入应用描述" />
          </Form.Item>

          <Form.Item
            name="version"
            label="版本号"
            rules={[{ required: true, message: '请输入版本号' }]}
          >
            <Input placeholder="例如：1.0.0" />
          </Form.Item>

          <Form.Item
            name="developer"
            label="开发者"
            rules={[{ required: true, message: '请输入开发者名称' }]}
          >
            <Input placeholder="请输入开发者名称" />
          </Form.Item>

          <Form.Item
            name="category"
            label="应用分类"
            rules={[{ required: true, message: '请选择应用分类' }]}
          >
            <Select>
              <Option value="工具">工具</Option>
              <Option value="社交">社交</Option>
              <Option value="游戏">游戏</Option>
              <Option value="教育">教育</Option>
              <Option value="娱乐">娱乐</Option>
              <Option value="生活">生活</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="应用状态"
            rules={[{ required: true, message: '请选择应用状态' }]}
          >
            <Select>
              <Option value="draft">草稿</Option>
              <Option value="published">已发布</Option>
              <Option value="archived">已归档</Option>
            </Select>
          </Form.Item>

          <Form.Item label="更新应用包 (ZIP)">
            <Upload
              accept=".zip"
              beforeUpload={(file) => {
                setPackageFile(file);
                return false;
              }}
              maxCount={1}
              fileList={packageFile ? [packageFile as any] : []}
              onRemove={() => setPackageFile(null)}
            >
              <Button icon={<UploadOutlined }}>选择ZIP文件</Button>
            </Upload>
            {app?.packageUrl && !packageFile && (
              <div style={{ marginTop: 8, color: '#999' }}>
                当前已有应用包，如需更新请选择新文件
              </div>
            )}
          </Form.Item>

          <Form.Item label="更新应用图标">
            <Upload
              accept="image/*"
              beforeUpload={(file) => {
                setIconFile(file);
                return false;
              }}
              maxCount={1}
              listType="picture"
              fileList={iconFile ? [iconFile as any] : []}
              onRemove={() => setIconFile(null)}
            >
              <Button icon={<UploadOutlined }}>选择图标</Button>
            </Upload>
            {app?.icon && !iconFile && (
              <div style={{ marginTop: 8 }}>
                <img
                  src={app.icon}
                  alt="current icon"
                  style={{ width: 64, height: 64, objectFit: 'contain' }}
                />
              </div>
            )}
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存修改
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => navigate('/apps')}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AppEdit;
