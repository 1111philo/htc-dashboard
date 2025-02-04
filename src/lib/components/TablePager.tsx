import { Link } from "@tanstack/react-router";
import { Pagination } from "react-bootstrap";

interface Props {
  queryRoute: "/guests" | "/users";
  page: number;
  totalPages: number;
  paginatedDataLength;
  rowsCount;
}

export default function TablePager(props: Props) {
  const { queryRoute, page, totalPages, paginatedDataLength, rowsCount } =
    props;
  return (
    <div className="d-flex justify-content-between align-items-center text-muted">
      <small>
        Showing {paginatedDataLength} of {rowsCount || "???"} guests
      </small>

      <Pagination className="mb-0">
        <Pagination.Prev
          as={Link}
          to={queryRoute}
          search={{ page: page === 1 ? page : page - 1 }}
          disabled={page === 1}
        />

        {[...Array(totalPages)].map((_, index) => (
          <Pagination.Item
            as={Link}
            key={index}
            to={queryRoute}
            search={{ page: index + 1 }}
            active={page === index + 1}
          >
            {index + 1}
          </Pagination.Item>
        ))}

        <Pagination.Next
          as={Link}
          disabled={page === totalPages}
          to={queryRoute}
          search={{ page: page + 1 }}
        ></Pagination.Next>
      </Pagination>
    </div>
  );
}
