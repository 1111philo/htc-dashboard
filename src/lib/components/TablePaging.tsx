import { Link } from "@tanstack/react-router";
import { Pagination } from "react-bootstrap";

export default function TablePager({
  page,
  totalPages,
  paginatedDataLength,
  filteredAndSortedDataLength,
}) {
  return (
    <div className="d-flex justify-content-between align-items-center text-muted">
      <small>
        Showing {paginatedDataLength} of {filteredAndSortedDataLength} guests
      </small>

      <Pagination className="mb-0">
        <Pagination.Prev
          as={Link}
          to="/guests"
          search={{ page: page === 1 ? page : page - 1 }}
          disabled={page === 1}
        />

        {[...Array(totalPages)].map((_, index) => (
          <Pagination.Item
            as={Link}
            key={index}
            to="/guests"
            search={{ page: index + 1 }}
            active={page === index + 1}
          >
            {index + 1}
          </Pagination.Item>
        ))}

        <Pagination.Next
          as={Link}
          disabled={page === totalPages}
          to="/guests"
          search={{ page: page + 1 }}
        ></Pagination.Next>
      </Pagination>
    </div>
  );
}
