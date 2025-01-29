import {
  List,
  useTable,
  EditButton,
  DeleteButton,
  DateField,
} from "@refinedev/antd";

import { Table, Space } from "antd";

import type { ICategory } from "../../interfaces";

export const CategoryList = () => {
  const { tableProps } = useTable<ICategory>();

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="title" title="Title" />
        <Table.Column
          dataIndex="created_at"
          title="Created At"
          render={(value) => <DateField value={value} format="LLL" />}
          sorter
        />
        <Table.Column<ICategory>
          title="Actions"
          dataIndex="actions"
          render={(_, record) => (
            <Space>
              <EditButton size="small" hideText recordItemId={record.id} />
              <DeleteButton size="small" hideText recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
