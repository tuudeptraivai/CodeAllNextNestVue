import React, { useRef, useState } from 'react';
import { ProTable, ModalForm, ProFormText, ProFormSelect, ProFormDigit, ProFormTextArea } from '@ant-design/pro-components';
import { Button, Tag, Space, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from '../../api/axiosConfig';

const FilmList = () => {
  const actionRef = useRef();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState();

  const columns = [
    {
      title: 'Poster',
      dataIndex: 'thumb_url',
      valueType: 'image',
      hideInSearch: true,
      width: 80,
    },
    {
      title: 'Tên phim',
      dataIndex: 'origin_name',
      copyable: true,
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      valueEnum: {
        completed: { text: 'Hoàn thành', status: 'Success' },
        ongoing: { text: 'Đang chiếu', status: 'Processing' },
        trailer: { text: 'Trailer', status: 'Default' },
      },
    },
    {
      title: 'Thể loại',
      dataIndex: 'category',
      hideInSearch: true,
      render: (_, record) => (
        <Space wrap>
          {record.category?.map((cat) => (
            <Tag key={cat.slug} color="blue">
              {cat.name}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Năm',
      dataIndex: 'releaseYear',
      valueType: 'digit',
    },
    {
      title: 'Diễn viên',
      dataIndex: 'actors',
      hideInSearch: true,
      ellipsis: true,
      render: (_, record) => (
        <Space wrap>
          {record.actors?.slice(0, 3).map((actor) => (
            <Tag key={actor._id} color="orange">
              {actor.name}
            </Tag>
          ))}
          {record.actors?.length > 3 && '...'}
        </Space>
      ),
    },
    {
      title: 'Thời gian cập nhật',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      key: 'option',
      render: (text, record, _, action) => [
        <a key="edit" onClick={() => {
          setCurrentRow(record);
          setEditModalVisible(true);
        }}>
          <EditOutlined /> Sửa
        </a>,
        <Popconfirm
          key="delete"
          title="Xóa phim?"
          onConfirm={async () => {
            try {
              await axios.delete(`/films/${record._id}`);
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
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params = {}, sort, filter) => {
          const res = await axios.get('/films', {
            params: {
              page: params.current,
              limit: params.pageSize,
              ...params,
            },
          });
          return {
            data: res.data,
            success: true,
            total: res.pagination?.total || 0,
          };
        }}
        rowKey="_id"
        search={{
          labelWidth: 'auto',
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        pagination={{
          pageSize: 10,
        }}
        dateFormatter="string"
        headerTitle="Danh sách phim"
        toolBarRender={false} // Remove Add New button as requested
      />

      <ModalForm
        title={`Chỉnh sửa phim: ${currentRow?.origin_name}`}
        visible={editModalVisible}
        onVisibleChange={setEditModalVisible}
        initialValues={currentRow ? {
          ...currentRow,
          actors: currentRow.actors?.map(a => typeof a === 'object' ? a._id : a)
        } : {}}
        onFinish={async (values) => {
          try {
            await axios.put(`/films/${currentRow._id}`, values);
            message.success('Cập nhật phim thành công');
            setEditModalVisible(false);
            actionRef.current?.reload();
            return true;
          } catch (error) {
            message.error('Cập nhật thất bại');
            return false;
          }
        }}
      >
        <ProFormText
          name="origin_name"
          label="Tên gốc"
          rules={[{ required: true }]}
        />
        <ProFormTextArea
          name="description"
          label="Mô tả"
        />
        <ProFormSelect
          name="status"
          label="Trạng thái"
          options={[
            { label: 'Hoàn thành', value: 'completed' },
            { label: 'Đang chiếu', value: 'ongoing' },
            { label: 'Trailer', value: 'trailer' },
          ]}
        />
        <ProFormDigit
          name="releaseYear"
          label="Năm phát hành"
        />
        <ProFormText
          name="quality"
          label="Chất lượng"
        />
        <ProFormText
          name="lang"
          label="Ngôn ngữ"
        />
        <ProFormText
          name="time"
          label="Thời lượng"
        />
        <ProFormSelect
          name="actors"
          label="Diễn viên"
          mode="multiple"
          request={async () => {
            const res = await axios.get('/actors');
            return res.map(item => ({ label: item.name, value: item._id }));
          }}
          placeholder="Chọn diễn viên"
        />
      </ModalForm>
    </>
  );
};

export default FilmList;
