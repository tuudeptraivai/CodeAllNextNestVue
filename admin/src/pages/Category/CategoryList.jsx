import React, { useRef, useState } from 'react';
import { ProTable, ModalForm, ProFormText, ProFormSwitch, ProFormTextArea } from '@ant-design/pro-components';
import { Button, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from '../../api/axiosConfig';

const CategoryList = () => {
  const actionRef = useRef();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState();

  const columns = [
    {
      title: 'Tên thể loại',
      dataIndex: 'name',
      formItemProps: {
        rules: [{ required: true, message: 'Tên thể loại là bắt buộc' }],
      },
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      hideInSearch: true,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: 'Hiển thị',
      dataIndex: 'isPublic',
      valueEnum: {
        true: { text: 'Công khai', status: 'Success' },
        false: { text: 'Ẩn', status: 'Default' },
      },
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
          title="Xóa thể loại này?"
          onConfirm={async () => {
            try {
              await axios.delete(`/types/${record._id}`);
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
        headerTitle="Quản lý Thể loại"
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
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
          const res = await axios.get('/types');
          // Simple filtering logic on frontend if backend doesn't support search yet
          let data = res;
          if (params.name) {
            data = data.filter(item => item.name.toLowerCase().includes(params.name.toLowerCase()));
          }
          return { data, success: true };
        }}
        columns={columns}
      />

      <ModalForm
        title={currentRow ? 'Cập nhật Thể loại' : 'Thêm Thể loại mới'}
        width="400px"
        visible={modalVisible}
        onVisibleChange={setModalVisible}
        initialValues={currentRow || { isPublic: true }}
        onFinish={async (value) => {
          try {
            if (currentRow) {
              await axios.put(`/types/${currentRow._id}`, value);
              message.success('Cập nhật thành công');
            } else {
              await axios.post('/types', value);
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
          label="Tên thể loại"
          placeholder="Nhập tên thể loại (vd: Hành động)"
          rules={[{ required: true }]}
        />
        <ProFormText
          name="slug"
          label="Slug"
          placeholder="để trống để tự động tạo"
        />
        <ProFormTextArea
          name="description"
          label="Mô tả"
          placeholder="Nhập mô tả"
        />
        <ProFormSwitch
          name="isPublic"
          label="Hiển thị công khai"
        />
      </ModalForm>
    </>
  );
};

export default CategoryList;
