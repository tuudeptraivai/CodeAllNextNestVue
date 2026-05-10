import React, { useState } from 'react';
import { Card, Button, Form, InputNumber, Space, Table, Tag, message } from 'antd';
import { CloudDownloadOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useQuery, useMutation } from 'react-query';
import axios from '../../api/axiosConfig';

const CrawlerPage = () => {
  const [form] = Form.useForm();
  
  const { data: logs, refetch } = useQuery('crawlerLogs', () => axios.get('/crawler/logs'));

  const syncMutation = useMutation((pages) => axios.post(`/crawler/sync?pages=${pages}`), {
    onSuccess: (data) => {
      message.success(data.message);
      refetch();
    },
    onError: () => {
      message.error('Kích hoạt crawler thất bại');
    }
  });

  const syncGenresMutation = useMutation(() => axios.post('/crawler/sync-genres'), {
    onSuccess: () => {
      message.success('Đồng bộ thể loại thành công');
    },
    onError: () => {
      message.error('Đồng bộ thể loại thất bại');
    }
  });

  const onFinish = (values) => {
    syncMutation.mutate(values.pages);
  };

  const columns = [
    {
      title: 'Bắt đầu',
      dataIndex: 'startTime',
      render: (val) => new Date(val).toLocaleString(),
    },
    {
      title: 'Kết thúc',
      dataIndex: 'endTime',
      render: (val) => val ? new Date(val).toLocaleString() : '-',
    },
    {
      title: 'Số trang',
      dataIndex: 'pagesCrawled',
    },
    {
      title: 'Phim đã đồng bộ',
      dataIndex: 'moviesSynced',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={status === 'success' ? 'green' : status === 'running' ? 'blue' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Lỗi',
      dataIndex: 'error',
      ellipsis: true,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hệ thống Crawl dữ liệu</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Điều khiển Crawler" icon={<CloudDownloadOutlined />}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ pages: 1 }}
          >
            <Form.Item
              label="Số trang cần cào (OPhim)"
              name="pages"
              rules={[{ required: true, message: 'Vui lòng nhập số trang' }]}
            >
              <InputNumber min={1} max={100} className="w-full" />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<PlayCircleOutlined />}
                  loading={syncMutation.isLoading}
                >
                  Bắt đầu cào phim
                </Button>
                <Button 
                  onClick={() => syncGenresMutation.mutate()}
                  loading={syncGenresMutation.isLoading}
                >
                  Đồng bộ Thể loại
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Trạng thái hệ thống">
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span>Nguồn dữ liệu:</span>
              <Tag color="blue">OPhim API</Tag>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Cron job:</span>
              <Tag color="green">Đang chạy (30p/lần)</Tag>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Địa chỉ API:</span>
              <code className="text-xs">https://ophim1.com</code>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Nhật ký Crawl gần đây" extra={<Button onClick={() => refetch()}>Làm mới</Button>}>
        <Table 
          dataSource={logs} 
          columns={columns} 
          rowKey="_id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default CrawlerPage;
