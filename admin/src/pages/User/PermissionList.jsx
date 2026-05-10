import React, { useRef, useState } from 'react';
import { ProTable, ModalForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Tag, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import axios from '../../api/axiosConfig';

const PermissionList = () => {
  const actionRef = useRef();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState();

  const methodColors = {
    GET: 'blue',
    POST: 'green',
    PUT: 'orange',
    DELETE: 'red',
    PATCH: 'cyan',
  };

  const columns = [
    {
      title: 'Tên quyền',
      dataIndex: 'name',
      width: '20%',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'API Path',
      dataIndex: 'apiPath',
      width: '20%',
      render: (text) => <code className="bg-gray-100 px-1 rounded text-sm">{text}</code>,
    },
    {
      title: 'Method',
      dataIndex: 'method',
      render: (text) => (
        <Tag color={methodColors[text] || 'default'} style={{ fontWeight: 'bold' }}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Module',
      dataIndex: 'module',
      render: (text) => (
        <Tag color="purple-inverse" style={{ borderRadius: '4px' }}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'System Module',
      dataIndex: 'systemModule',
      render: (text) => (
        <Tag color="cyan-inverse" style={{ borderRadius: '4px' }}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      hideInSearch: true,
      render: (text, record) => {
        return new Date(record.updatedAt).toLocaleDateString('vi-VN');
      }
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      render: (_, record) => [
        <Button
          type="text"
          key="edit"
          icon={<EditOutlined />}
          onClick={() => {
            setCurrentRow(record);
            setModalVisible(true);
          }}
        />,
        <Popconfirm
          key="delete"
          title="Xóa permission này?"
          onConfirm={async () => {
            try {
              await axios.delete(`/rbac/permissions/${record._id}`);
              message.success('Xóa thành công');
              actionRef.current?.reload();
            } catch (error) {
              message.error('Xóa thất bại');
            }
          }}
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>,
      ],
    },
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold">Quyền hạn</h1>
          <p className="text-gray-500 text-sm">Quản lý quyền API</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}
          onClick={() => {
            setCurrentRow(undefined);
            setModalVisible(true);
          }}
        >
          Thêm quyền
        </Button>
      </div>

      <ProTable
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 'auto',
          filterType: 'light',
        }}
        options={false}
        request={async (params) => {
          const res = await axios.get('/rbac/permissions');
          // Basic filtering simulation
          let filteredData = res;
          if (params.name) {
            filteredData = filteredData.filter(item => item.name.toLowerCase().includes(params.name.toLowerCase()));
          }
          if (params.systemModule) {
            filteredData = filteredData.filter(item => item.systemModule === params.systemModule);
          }
          return { data: filteredData, success: true };
        }}
        columns={[
          {
            title: 'Tìm theo tên / apiPath / module',
            dataIndex: 'name',
            hideInTable: true,
            placeholder: 'Tìm theo tên / apiPath / module',
          },
          {
            title: 'Lọc theo System Module',
            dataIndex: 'systemModule',
            hideInTable: true,
            valueType: 'select',
            valueEnum: {
              SYSTEM_MANAGEMENT: { text: 'SYSTEM_MANAGEMENT' },
              BUSINESS: { text: 'BUSINESS' },
            },
          },
          ...columns
        ]}
        pagination={{
          pageSize: 10,
        }}
      />

      <ModalForm
        title={currentRow ? 'Cập nhật Permission' : 'Thêm Permission'}
        width="500px"
        open={modalVisible}
        onOpenChange={setModalVisible}
        initialValues={currentRow || {}}
        onFinish={async (value) => {
          try {
            if (currentRow) {
              await axios.put(`/rbac/permissions/${currentRow._id}`, value);
              message.success('Cập nhật thành công');
            } else {
              await axios.post('/rbac/permissions', value);
              message.success('Tạo thành công');
            }
            setModalVisible(false);
            actionRef.current?.reload();
            return true;
          } catch (error) {
            message.error('Thao tác thất bại');
            return false;
          }
        }}
      >
        <ProFormText
          name="name"
          label="Tên quyền"
          placeholder="VD: Quản lý user"
          rules={[{ required: true }]}
        />
        <ProFormText
          name="apiPath"
          label="API Path"
          placeholder="/api/users"
          rules={[{ required: true }]}
        />
        <ProFormSelect
          name="method"
          label="HTTP Method"
          options={[
            { label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' },
            { label: 'PUT', value: 'PUT' },
            { label: 'DELETE', value: 'DELETE' },
            { label: 'PATCH', value: 'PATCH' },
          ]}
          rules={[{ required: true }]}
        />
        <ProFormText
          name="module"
          label="Module"
          placeholder="VD: User, Film, Domain..."
          rules={[{ required: true }]}
        />
        <ProFormSelect
          name="systemModule"
          label="System Module"
          options={[
            { label: 'SYSTEM_MANAGEMENT', value: 'SYSTEM_MANAGEMENT' },
            { label: 'BUSINESS', value: 'BUSINESS' },
          ]}
          rules={[{ required: true }]}
        />
      </ModalForm>
    </div>
  );
};

export default PermissionList;
