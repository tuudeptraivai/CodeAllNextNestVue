import React from 'react';
import { Row, Col, Card, Statistic, Spin } from 'antd';
import { VideoCameraOutlined, UserOutlined, TagsOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useQueries } from 'react-query';
import axios from '../api/axiosConfig';

const Dashboard = () => {
  // Fetch multiple APIs to aggregate dashboard data as requested
  const results = useQueries([
    { queryKey: ['filmsCount'], queryFn: () => axios.get('/films?limit=1') },
    { queryKey: ['usersCount'], queryFn: () => axios.get('/users/all') },
    { queryKey: ['genresCount'], queryFn: () => axios.get('/types') },
    { queryKey: ['crawlLogs'], queryFn: () => axios.get('/crawler/logs') },
  ]);

  const [filmsRes, usersRes, genresRes, logsRes] = results;
  const isLoading = results.some(r => r.isLoading);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  const stats = [
    { 
      title: 'Tổng số phim', 
      value: filmsRes.data?.pagination?.total || 0, 
      icon: <VideoCameraOutlined />, 
      color: '#1677ff' 
    },
    { 
      title: 'Người dùng', 
      value: usersRes.data?.length || 0, 
      icon: <UserOutlined />, 
      color: '#52c41a' 
    },
    { 
      title: 'Thể loại', 
      value: genresRes.data?.length || 0, 
      icon: <TagsOutlined />, 
      color: '#faad14' 
    },
    { 
      title: 'Lượt crawl gần đây', 
      value: logsRes.data?.length || 0, 
      icon: <ClockCircleOutlined />, 
      color: '#f5222d' 
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bảng điều khiển (Dashboard)</h1>
      <Row gutter={[16, 16]}>
        {stats.map((item, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={item.title}
                value={item.value}
                prefix={item.icon}
                valueStyle={{ color: item.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>
      
      <Row gutter={[16, 16]} className="mt-8">
        <Col span={24}>
          <Card title="Ghi chú hệ thống" bordered={false} className="shadow-sm">
            <p className="text-gray-500">
              Dữ liệu được tổng hợp trực tiếp từ danh sách phim và người dùng. 
              Bạn có thể quản lý chi tiết tại các mục tương ứng trong menu.
            </p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
