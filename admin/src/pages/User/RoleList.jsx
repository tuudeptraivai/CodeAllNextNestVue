import React, { useRef, useState, useMemo } from 'react';
import { ProTable, ModalForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Tag, Space, Switch, Collapse, Checkbox, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, RightOutlined } from '@ant-design/icons';
import { useQuery } from 'react-query';
import axios from '../../api/axiosConfig';

const { Panel } = Collapse;

const RoleList = () => {
  const actionRef = useRef();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState();
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Fetch permissions for the select dropdown
  const { data: permissions = [] } = useQuery('permissions', () => axios.get('/rbac/permissions'));

  // Group permissions by systemModule and module
  const groupedPermissions = useMemo(() => {
    const groups = {};
    permissions.forEach(p => {
      const sm = p.systemModule || 'OTHER';
      const m = p.module || 'General';
      if (!groups[sm]) groups[sm] = {};
      if (!groups[sm][m]) groups[sm][m] = [];
      groups[sm][m].push(p);
    });
    return groups;
  }, [permissions]);

  const columns = [
    {
      title: 'Tên role',
      dataIndex: 'name',
      render: (text) => <span className="font-bold">{text}</span>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
    },
    {
      title: 'Modules',
      dataIndex: 'permissions',
      hideInSearch: true,
      render: (_, record) => {
        const modules = [...new Set(record.permissions?.map(p => p.module))].filter(Boolean);
        return (
          <Space wrap>
            {modules.map(m => (
              <Tag color="cyan" key={m}>{m}</Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'Quyền hạn',
      dataIndex: 'permissions',
      hideInSearch: true,
      render: (text) => <Tag color="green">{text?.length || 0} quyền</Tag>,
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      hideInSearch: true,
      render: (text, record) => new Date(record.updatedAt).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdBy',
      render: (text) => text || '--',
    },
    {
      title: 'Người cập nhật',
      dataIndex: 'updatedBy',
      render: (text) => text || '--',
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      key: 'option',
      render: (_, record) => [
        <Button
          type="text"
          key="edit"
          icon={<EditOutlined />}
          onClick={() => {
            setCurrentRow(record);
            setSelectedPermissions(record.permissions?.map(p => p._id) || []);
            setModalVisible(true);
          }}
        />,
        <Popconfirm
          key="delete"
          title="Xóa role này?"
          onConfirm={async () => {
            try {
              await axios.delete(`/rbac/roles/${record._id}`);
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

  const handleTogglePermission = (id) => {
    setSelectedPermissions(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleToggleModule = (modulePermissions, checked) => {
    const ids = modulePermissions.map(p => p._id);
    if (checked) {
      setSelectedPermissions(prev => [...new Set([...prev, ...ids])]);
    } else {
      setSelectedPermissions(prev => prev.filter(id => !ids.includes(id)));
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold">Vai trò</h1>
          <p className="text-gray-500 text-sm">Quản lý vai trò người dùng</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}
          onClick={() => {
            setCurrentRow(undefined);
            setSelectedPermissions([]);
            setModalVisible(true);
          }}
        >
          Thêm quyền hạn
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
          const res = await axios.get('/rbac/roles');
          let filteredData = res;
          if (params.name) {
            filteredData = filteredData.filter(item => item.name.toLowerCase().includes(params.name.toLowerCase()));
          }
          return { data: filteredData, success: true };
        }}
        columns={[
          {
            title: 'Tìm theo tên / mã vai trò',
            dataIndex: 'name',
            hideInTable: true,
          },
          ...columns
        ]}
      />

      <ModalForm
        title={currentRow ? 'Cập nhật Vai trò' : 'Thêm quyền hạn'}
        width="800px"
        open={modalVisible}
        onOpenChange={(visible) => {
          setModalVisible(visible);
          if (!visible) {
            setCurrentRow(undefined);
            setSelectedPermissions([]);
          }
        }}
        key={currentRow?._id || 'new'}
        modalProps={{
          destroyOnClose: true,
        }}
        initialValues={currentRow || {}}
        onFinish={async (value) => {
          try {
            const data = { ...value, permissions: selectedPermissions };
            if (currentRow) {
              await axios.put(`/rbac/roles/${currentRow._id}`, data);
              message.success('Cập nhật thành công');
            } else {
              await axios.post('/rbac/roles', data);
              message.success('Tạo thành công');
            }
            setModalVisible(false);
            setCurrentRow(undefined);
            setSelectedPermissions([]);
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
          label="Tên vai trò"
          placeholder="VD: Super Admin"
          rules={[{ required: true }]}
        />
        <ProFormText
          name="description"
          label="Mô tả"
          placeholder="Mô tả ngắn"
        />
        <ProFormSelect
          name="systemModules"
          label="System Modules"
          mode="multiple"
          options={[
            { label: 'SYSTEM_MANAGEMENT', value: 'SYSTEM_MANAGEMENT' },
            { label: 'BUSINESS', value: 'BUSINESS' },
            { label: 'OTHER', value: 'OTHER' },
          ]}
          placeholder="Chọn các modules"
        />

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <span className="font-bold text-base">Quyền truy cập</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{selectedPermissions.length}/{permissions.length}</span>
              <Checkbox 
                onChange={(e) => {
                  if (e.target.checked) setSelectedPermissions(permissions.map(p => p._id));
                  else setSelectedPermissions([]);
                }}
                checked={selectedPermissions.length === permissions.length && permissions.length > 0}
              >
                Chọn tất cả
              </Checkbox>
            </div>
          </div>

          <Collapse ghost expandIconPosition="right" defaultActiveKey={Object.keys(groupedPermissions)}>
            {Object.entries(groupedPermissions).map(([sm, modules]) => (
              <Panel 
                key={sm} 
                header={
                  <div className="flex items-center gap-2">
                    <Tag color="cyan-inverse">{sm}</Tag>
                    <span className="text-gray-400 text-xs">
                      {Object.values(modules).flat().filter(p => selectedPermissions.includes(p._id)).length} / {Object.values(modules).flat().length}
                    </span>
                  </div>
                }
              >
                {Object.entries(modules).map(([m, modulePerms]) => {
                  const allSelected = modulePerms.every(p => selectedPermissions.includes(p._id));
                  return (
                    <div 
                      key={m} 
                      style={{ 
                        backgroundColor: '#f0f2f5', 
                        border: '2px solid white', 
                        borderRadius: '12px', 
                        padding: '20px',
                        marginBottom: '20px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <Tag color="purple-inverse" style={{ fontWeight: '700', fontSize: '13px' }}>{m}</Tag>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', color: '#8c8c8c' }}>Chọn tất cả</span>
                          <Switch 
                            size="small" 
                            checked={allSelected} 
                            onChange={(checked) => handleToggleModule(modulePerms, checked)}
                          />
                        </div>
                      </div>
                      <Row gutter={[16, 12]}>
                        {modulePerms.map(p => (
                          <Col span={12} key={p._id}>
                            <div 
                              style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                backgroundColor: 'white',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid #f0f0f0',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                              }}
                            >
                              <span style={{ fontSize: '13px', color: '#262626', fontWeight: '500' }}>{p.name}</span>
                              <Switch 
                                size="small" 
                                checked={selectedPermissions.includes(p._id)}
                                onChange={() => handleTogglePermission(p._id)}
                              />
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  );
                })}
              </Panel>
            ))}
          </Collapse>
        </div>
      </ModalForm>
    </div>
  );
};

export default RoleList;
