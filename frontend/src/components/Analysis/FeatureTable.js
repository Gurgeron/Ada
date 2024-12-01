import React, { useMemo } from 'react';
import { useTable, useSortBy, usePagination } from 'react-table';

const FeatureTable = ({ data = [], columns = [] }) => {
  // Transform the columns configuration to include cell rendering
  const tableColumns = useMemo(() => {
    return columns.map(col => ({
      Header: col.header,
      accessor: col.accessor,
      Cell: ({ value }) => {
        // Special rendering for known column types
        if (col.header === 'Status') {
          const colors = {
            'Open': 'bg-blue-100 text-blue-800',
            'In Progress': 'bg-yellow-100 text-yellow-800',
            'Completed': 'bg-green-100 text-green-800',
            'Planned': 'bg-purple-100 text-purple-800'
          };
          return (
            <div className="py-3">
              <span className={`px-2 py-1 text-sm rounded-full ${colors[value] || 'bg-gray-100'}`}>
                {value}
              </span>
            </div>
          );
        }
        
        if (col.header === 'Priority') {
          const colors = {
            'High': 'bg-red-100 text-red-800',
            'Medium': 'bg-yellow-100 text-yellow-800',
            'Low': 'bg-green-100 text-green-800'
          };
          return (
            <div className="py-3">
              <span className={`px-2 py-1 text-sm rounded-full ${colors[value] || 'bg-gray-100'}`}>
                {value}
              </span>
            </div>
          );
        }
        
        if (col.header === 'Type') {
          return (
            <div className="py-3">
              <span className="px-2 py-1 text-sm rounded-full bg-gray-100 text-gray-800">
                {value}
              </span>
            </div>
          );
        }

        if (col.header === 'Product') {
          return (
            <div className="py-3">
              <span className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                {value}
              </span>
            </div>
          );
        }

        if (col.header === 'Customer Type') {
          return (
            <div className="py-3">
              <span className="px-2 py-1 text-sm rounded-full bg-indigo-100 text-indigo-800">
                {value}
              </span>
            </div>
          );
        }

        if (col.header === 'Request Channel') {
          return (
            <div className="py-3">
              <span className="px-2 py-1 text-sm rounded-full bg-purple-100 text-purple-800">
                {value}
              </span>
            </div>
          );
        }

        // Special rendering for specific columns
        if (col.header === 'Description') {
          return (
            <div className="py-3 max-w-xl truncate" title={value}>
              {value}
            </div>
          );
        }

        if (col.header === 'Request ID') {
          return (
            <div className="py-3 font-medium text-blue-600">
              {value}
            </div>
          );
        }

        if (col.header === 'Feature Title') {
          return (
            <div className="py-3 font-medium">
              {value}
            </div>
          );
        }

        // Default rendering for any other column
        return (
          <div className="py-3">
            {value}
          </div>
        );
      }
    }));
  }, [columns]);

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
    state: { pageIndex, pageSize }
  } = useTable(
    {
      columns: tableColumns,
      data,
      initialState: {
        pageIndex: 0,
        pageSize: 20
      }
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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="overflow-x-auto">
        <table {...getTableProps()} className="min-w-full">
          <thead>
            {headerGroups.map(headerGroup => (
              <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th
                    key={column.id}
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      {column.render('Header')}
                      <span className="text-gray-400">
                        {column.isSorted
                          ? column.isSortedDesc
                            ? ' ↓'
                            : ' ↑'
                          : ''}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
            {page.map((row, i) => {
              prepareRow(row);
              return (
                <tr
                  key={row.id}
                  {...row.getRowProps()}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {row.cells.map(cell => (
                    <td
                      key={cell.column.id}
                      {...cell.getCellProps()}
                      className="px-6 whitespace-nowrap"
                    >
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
            className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50"
          >
            {'<<'}
          </button>
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50"
          >
            {'<'}
          </button>
          <button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50"
          >
            {'>'}
          </button>
          <button
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
            className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50"
          >
            {'>>'}
          </button>
        </div>
        
        <span className="flex items-center gap-1 text-sm text-gray-700">
          <div>Page</div>
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>
        </span>
        
        <select
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value));
          }}
          className="px-2 py-1 rounded border hover:bg-gray-50"
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