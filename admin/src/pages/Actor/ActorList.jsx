import React, { useRef, useState } from 'react';
import { ProTable, ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, SyncOutlined } from '@ant-design/icons';
import axios from '../../api/axiosConfig';

const ActorList = () => {
  const actionRef = useRef();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState();
  const [syncLoading, setSyncLoading] = useState(false);

  const handleSync = async () => {
    setSyncLoading(true);
    try {
      await axios.post('/actors/sync');
      message.success('Đã bắt đầu quá trình đồng bộ thông tin từ TMDB');
      setTimeout(() => {
        actionRef.current?.reload();
      }, 2000);
    } catch (error) {
      message.error('Lỗi khi kích hoạt đồng bộ');
    } finally {
      setSyncLoading(false);
    }
  };

  const columns = [
    {
      title: 'Ảnh đại diện',
      dataIndex: 'avatar',
      valueType: 'avatar',
      hideInSearch: true,
      render: (dom, record) => (
        <Avatar src={record.avatar} icon={<UserOutlined />} />
      ),
    },
    {
      title: 'Họ tên',
      dataIndex: 'name',
      formItemProps: {
        rules: [{ required: true, message: 'Tên diễn viên là bắt buộc' }],
      },
    },
    {
      title: 'Quốc tịch',
      dataIndex: 'nationality',
    },
    {
      title: 'Mô tả/Tiểu sử',
      dataIndex: 'bio',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      key: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentRow(record);
            setModalVisible(true);
          }}
        >
          <EditOutlined /> Sửa
        </a>,
        <Popconfirm
          key="delete"
          title="Xóa diễn viên này?"
          onConfirm={async () => {
            try {
              await axios.delete(`/actors/${record._id}`);
              message.success('Xóa thành công');
              actionRef.current?.reload();
            } catch (error) {
              message.error('Xóa thất bại');
            }
          }}
        >
          <a className="text-red-500">
            <DeleteOutlined /> Xóa
          </a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <>
      <ProTable
        headerTitle="Quản lý Diễn viên"
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button
            key="sync"
            icon={<SyncOutlined />}
            loading={syncLoading}
            onClick={handleSync}
          >
            Cào thông tin (TMDB)
          </Button>,
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCurrentRow(undefined);
              setModalVisible(true);
            }}
          >
            <PlusOutlined /> Thêm mới
          </Button>,
        ]}
        request={async (params) => {
          const res = await axios.get('/actors');
          let data = res;
          if (params.name) {
            data = data.filter(item => item.name.toLowerCase().includes(params.name.toLowerCase()));
          }
          return { data, success: true };
        }}
        columns={columns}
      />

      <ModalForm
        title={currentRow ? 'Cập nhật Diễn viên' : 'Thêm Diễn viên mới'}
        width="400px"
        visible={modalVisible}
        onVisibleChange={setModalVisible}
        initialValues={currentRow || {}}
        onFinish={async (value) => {
          try {
            if (currentRow) {
              await axios.put(`/actors/${currentRow._id}`, value);
              message.success('Cập nhật thành công');
            } else {
              await axios.post('/actors', value);
              message.success('Thêm mới thành công');
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
          label="Tên diễn viên"
          placeholder="Nhập tên diễn viên"
          rules={[{ required: true }]}
        />
        <ProFormText
          name="avatar"
          label="Link ảnh đại diện"
          placeholder="Nhập URL ảnh"
        />
        <ProFormText
          name="nationality"
          label="Quốc tịch"
          placeholder="Ví dụ: Việt Nam, Mỹ..."
        />
        <ProFormTextArea
          name="bio"
          label="Tiểu sử"
          placeholder="Nhập tóm tắt tiểu sử"
        />
      </ModalForm>
    </>
  );
};

export default ActorList;
