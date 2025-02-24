import { Link } from "@tanstack/react-router";
import { Pagination } from "react-bootstrap";

interface Props {
  queryRoute: "/guests" | "/users";
  page: number;
  totalPages: number;
  rowsPerPage: number;
  totalRows: number;
}

export default function TablePager({
  queryRoute,
  page,
  totalPages,
  rowsPerPage,
  totalRows,
}: Props) {
  const pageLinks =
    page === 1
      ? [1, 2, 3]
      : page === totalPages
        ? [totalPages - 2, totalPages - 1, totalPages]
        : [page - 1, page, page + 1];

  return (
    <div className="d-flex justify-content-between align-items-center text-muted">
      <small>
        Showing {rowsPerPage} of {totalRows}{" "}
        {queryRoute === "/guests" ? "guests" : "users"}
      </small>

      <Pagination className="mb-0">
        <Pagination.First
          as={Link}
          to={queryRoute}
          search={{ page: 1 }}
          disabled={page === 1}
          title="First page"
        />

        <Pagination.Prev
          as={Link}
          to={queryRoute}
          search={{ page: page === 1 ? page : page - 1 }}
          disabled={page === 1}
          title={`Previous page (${page - 1})`}
        />

        {pageLinks.map((pageNum) => (
          <Pagination.Item
            as={Link}
            key={pageNum}
            to={queryRoute}
            search={{ page: pageNum }}
            active={page === pageNum}
            title={`Page (${pageNum})`}
          >
            {pageNum}
          </Pagination.Item>
        ))}

        <Pagination.Next
          as={Link}
          disabled={page === totalPages}
          to={queryRoute}
          search={{ page: page + 1 }}
          title={`Next page (${page + 1})`}
        ></Pagination.Next>

        <Pagination.Last
          as={Link}
          to={queryRoute}
          search={{ page: totalPages }}
          disabled={page === totalPages}
          title={`Last page (${totalPages})`}
        />
      </Pagination>
    </div>
  );
}
