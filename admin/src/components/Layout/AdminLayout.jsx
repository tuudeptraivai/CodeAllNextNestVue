import React from 'react';
import { ProLayout } from '@ant-design/pro-components';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  DashboardOutlined, 
  VideoCameraOutlined, 
  UserOutlined, 
  CloudDownloadOutlined,
  LogoutOutlined,
  SettingOutlined,
  TagsOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { Dropdown, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    message.success('Đăng xuất thành công');
    navigate('/login');
  };

  return (
    <ProLayout
      title=" ADMIN"
      logo="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
      location={location}
      menuDataRender={() => [
        {
          path: '/dashboard',
          name: 'Bảng điều khiển',
          icon: <DashboardOutlined />,
        },
        {
          path: '/films',
          name: 'Quản lý phim',
          icon: <VideoCameraOutlined />,
        },
        {
          path: '/categories',
          name: 'Thể loại',
          icon: <TagsOutlined />,
        },
        {
          path: '/actors',
          name: 'Diễn viên',
          icon: <TeamOutlined />,
        },
        {
          path: '/crawler',
          name: 'Hệ thống Crawl',
          icon: <CloudDownloadOutlined />,
        },
        {
          path: '/users',
          name: 'Người dùng',
          icon: <UserOutlined />,
          children: [
            {
              path: '/users',
              name: 'Danh sách User',
            },
            {
              path: '/roles',
              name: 'Vai trò (Roles)',
            },
            {
              path: '/permissions',
              name: 'Quyền (Permissions)',
            },
          ]
        },
        {
          path: '/settings',
          name: 'Cài đặt',
          icon: <SettingOutlined />,
        },
      ]}
      menuItemRender={(item, dom) => (
        <Link to={item.path}>{dom}</Link>
      )}
      rightContentRender={() => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Đăng xuất',
                onClick: handleLogout,
              },
            ],
          }}
        >
          <div className="flex items-center px-4 cursor-pointer hover:bg-gray-100 h-full">
            <UserOutlined className="mr-2" />
            <span>{user?.username || 'Admin'}</span>
          </div>
        </Dropdown>
      )}
    >
      <div className="p-6">
        <Outlet />
      </div>
    </ProLayout>
  );
};

export default AdminLayout;
