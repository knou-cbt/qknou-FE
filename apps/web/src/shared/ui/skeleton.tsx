import { TableHeader, TableBody, TableRow, TableHead, TableCell, TableRoot } from "./table";

interface TableSkeletonProps {
  columnCount: number;
  rowCount?: number;
}

export const TableSkeleton = ({ columnCount, rowCount = 5 }: TableSkeletonProps) => {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <TableRoot>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {Array.from({ length: columnCount }).map((_, colIndex) => (
                <TableHead 
                  key={colIndex}
                  className={colIndex === 0 ? "w-20" : ""}
                >
                  <div className="h-4 bg-[#E5E7EB] rounded animate-pulse" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columnCount }).map((_, colIndex) => (
                  <TableCell 
                    key={colIndex}
                    className={colIndex === 0 ? "w-20" : ""}
                  >
                    <div className="h-4 bg-[#E5E7EB] rounded animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </TableRoot>
      </div>
    </div>
  );
};

export const LoadingSkeleton = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-[#6B7280]">과목 목록을 불러오는 중...</p>
    </div>
  );
};
