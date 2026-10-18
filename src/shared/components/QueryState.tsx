import type { ReactNode } from "react";
import { Alert, Center, Loader } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { UseQueryResult } from "@tanstack/react-query";

interface QueryStateProps<TData> {
  query: UseQueryResult<TData>;
  /** Shown on the first load. Defaults to a centered spinner. */
  loading?: ReactNode;
  errorTitle?: string;
  /** When it returns true, `empty` is rendered instead of `children`. */
  isEmpty?: (data: TData) => boolean;
  empty?: ReactNode;
  children: (data: TData) => ReactNode;
}

/** Renders the loading, error, empty or data state of a query. Disabled queries render nothing. */
export function QueryState<TData>({
  query,
  loading,
  errorTitle = "Something went wrong",
  isEmpty,
  empty,
  children,
}: QueryStateProps<TData>) {
  if (query.isPending) {
    if (query.fetchStatus === "idle") return null; // disabled, nothing requested yet
    return (
      loading ?? (
        <Center py="xl">
          <Loader />
        </Center>
      )
    );
  }

  if (query.isError) {
    return (
      <Alert color="rose" variant="light" icon={<IconAlertTriangle size={18} />} title={errorTitle}>
        {query.error.message}
      </Alert>
    );
  }

  if (isEmpty?.(query.data)) return empty ?? null;

  return children(query.data);
}
