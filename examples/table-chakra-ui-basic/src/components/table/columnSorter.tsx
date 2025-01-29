import { IconButton } from "@chakra-ui/react";
import { IconChevronDown, IconSelector } from "@tabler/icons-react";

import type { ColumnButtonProps } from "../../interfaces";

export const ColumnSorter: React.FC<ColumnButtonProps> = ({ column }) => {
  if (!column.getCanSort()) {
    return null;
  }

  const sorted = column.getIsSorted();

  return (
    <IconButton
      aria-label="Sort"
      size="xs"
      onClick={column.getToggleSortingHandler()}
      style={{
        transition: "transform 0.25s",
        transform: `rotate(${sorted === "asc" ? "180" : "0"}deg)`,
      }}
      variant={sorted ? "light" : "transparent"}
      color={sorted ? "primary" : "gray"}
      icon={
        <>
          {!sorted && <IconSelector size={18} />}
          {sorted && <IconChevronDown size={18} />}
        </>
      }
    />
  );
};
