import React, { useMemo } from 'react';
import { useTable, useSortBy, usePagination } from 'react-table';

const FeatureTable = ({ data = [], columns = [] }) => {
  // Add line number column to the beginning of columns array
  const allColumns = useMemo(() => [
    {
      Header: '#',
      id: 'lineNumber',
      accessor: (row, i) => i + 1,
      Cell: ({ value }) => (
        <div className="text-sm text-gray-500 font-mono">
          {String(value).padStart(3, '0')}
        </div>
      ),
      minWidth: 60,
      width: 60,
    },
    ...columns.map(col => ({
      ...col,
      id: col.accessor,
      Header: col.header,
      ...(col.accessor === 'Description' && {
        minWidth: 600,
        width: 600,
        Cell: ({ value }) => (
          <div className="min-w-[600px] py-2 whitespace-normal text-sm text-gray-900">
            {value}
          </div>
        )
      }),
      ...(col.accessor === 'Request ID' && {
        minWidth: 120,
        width: 120,
      }),
      ...(col.accessor === 'Feature Title' && {
        minWidth: 200,
        width: 200,
      }),
      ...(col.accessor === 'Product' && {
        minWidth: 120,
        width: 120,
      }),
      ...(col.accessor === 'Request Channel' && {
        minWidth: 150,
        width: 150,
      })
    }))
  ], [columns]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns: allColumns,
      data,
      initialState: { pageIndex: 0, pageSize: 20 },
    },
    useSortBy,
    usePagination
  );

  if (!data.length || !columns.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow-md rounded-lg bg-white">
      <table {...getTableProps()} className="min-w-full table-fixed">
        <thead className="bg-gray-50">
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${column.id === 'lineNumber' ? 'w-[60px]' : ''}
                    ${column.id === 'Description' ? 'w-[600px]' : ''}
                  `}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                  }}
                >
                  {column.render('Header')}
                  <span className="ml-2">
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' ↓'
                        : ' ↑'
                      : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
          {page.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} className="hover:bg-gray-50">
                {row.cells.map(cell => (
                  <td
                    {...cell.getCellProps()}
                    className={`px-6 py-4 text-sm text-gray-900
                      ${cell.column.id === 'Description' ? 'whitespace-normal' : 'whitespace-nowrap'}
                    `}
                    style={{
                      width: cell.column.width,
                      minWidth: cell.column.minWidth,
                    }}
                  >
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            {'<<'}
          </button>
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            {'<'}
          </button>
          <button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            {'>'}
          </button>
          <button
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            {'>>'}
          </button>
        </div>
        
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>
        </span>
        
        <select
          value={pageSize}
          onChange={e => setPageSize(Number(e.target.value))}
          className="px-2 py-1 rounded border"
        >
          {[10, 20, 30, 40, 50].map(size => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FeatureTable; 