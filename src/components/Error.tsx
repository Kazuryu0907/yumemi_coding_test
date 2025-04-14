export type ErrorHandleType = { isError: boolean; message: string };

// eslint-disable-next-line
export const ErrorFallBack = ({ error }: { error: string }) => {
  return (
    <div role="alert" className="p-4 bg-red-200">
      <div className="text-lg font-bold">
        <p>エラー発生:</p>
        <pre>{error}</pre>
      </div>
    </div>
  );
};
