interface TableProps {
  children: React.ReactNode;
}

export function Table({ children }: TableProps) {
  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
      <table className="w-full border-collapse text-sm">
        {children}
      </table>
    </div>
  );
}
