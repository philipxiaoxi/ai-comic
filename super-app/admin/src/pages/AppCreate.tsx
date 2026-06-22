import React, { useState } from 'react';
import { Form, Input, Select, Upload, Button, Card, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { appService } from '../services/api';

const { TextArea } = Input;
const { Option } = Select;

const AppCreate: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [packageFile, setPackageFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    if (!packageFile) {
      message.error('请上传应用包');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('version', values.version);
      formData.append('developer', values.developer);
      formData.append('category', values.category);
      formData.append('package', packageFile);
      if (iconFile) {
        formData.append('icon', iconFile);
      }

      await appService.createApp(formData);
      message.success('应用创建成功');
      navigate('/apps');
    } catch (error: any) {
      message.error(error.response?.data?.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>发布新应用</h2>
      <Card style={{ marginTop: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ version: '1.0.0', category: '工具' }}
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
            label="应用包 (ZIP)"
            required
          >
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
          </Form.Item>

          <Form.Item label="应用图标">
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
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              发布应用
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

export default AppCreate;
