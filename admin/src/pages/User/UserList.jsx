import React, { useRef, useState } from 'react';
import { ProTable, ModalForm, ProFormSelect } from '@ant-design/pro-components';
import { Tag, message, Button } from 'antd';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import { useQuery } from 'react-query';
import axios from '../../api/axiosConfig';

const UserList = () => {
  const actionRef = useRef();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState();

  // Fetch roles for the assignment select
  const { data: roles = [] } = useQuery('roles', () => axios.get('/rbac/roles'));

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      copyable: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Họ tên',
      dataIndex: 'name',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      render: (role) => (
        <Tag color={role?.name === 'admin' ? 'red' : 'blue'}>
          {role?.name?.toUpperCase() || 'CHƯA CÓ'}
        </Tag>
      ),
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      valueEnum: {
        male: { text: 'Nam' },
        female: { text: 'Nữ' },
        other: { text: 'Khác' },
      },
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      key: 'option',
      render: (_, record) => [
        <Button
          key="edit"
          type="link"
          icon={<EditOutlined />}
          onClick={() => {
            setCurrentRow(record);
            setModalVisible(true);
          }}
        >
          Đổi Role
        </Button>,
      ],
    },
  ];

  return (
    <>
      <ProTable
        headerTitle="Danh sách người dùng"
        actionRef={actionRef}
        rowKey="_id"
        request={async (params) => {
          // Note: Backend might need a list-all users endpoint if not exist. 
          // Assuming /users/profile is for current user, we might need a generic /users
          // For now, let's try calling a mock or assuming /users exists (common in NestJS)
          try {
            const res = await axios.get('/users/all'); // I'll check if I need to add this
            return { data: res, success: true };
          } catch (e) {
            return { data: [], success: false };
          }
        }}
        columns={columns}
        search={{
          labelWidth: 'auto',
        }}
      />

      <ModalForm
        title={`Thay đổi vai trò cho: ${currentRow?.username}`}
        width="400px"
        visible={modalVisible}
        onVisibleChange={setModalVisible}
        initialValues={{ role: currentRow?.role?._id }}
        onFinish={async (value) => {
          try {
            await axios.post(`/users/${currentRow._id}/role`, { roleId: value.role });
            message.success('Cập nhật vai trò thành công');
            setModalVisible(false);
            actionRef.current?.reload();
            return true;
          } catch (error) {
            message.error('Cập nhật vai trò thất bại');
            return false;
          }
        }}
      >
        <ProFormSelect
          name="role"
          label="Chọn vai trò mới"
          options={roles.map((r) => ({ label: r.name, value: r._id }))}
          rules={[{ required: true }]}
        />
      </ModalForm>
    </>
  );
};

export default UserList;
