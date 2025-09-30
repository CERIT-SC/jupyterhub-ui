import { queryOptions, useQuery } from "@tanstack/react-query";

import { dbApiClient } from "@/api/local/dbApiClient";
import { NotebookPreset } from "@/db/notebooksPresetsRepository";
import { QueryConfig } from "@/lib/react-query";

export async function getNotebookPresets() {
  const { data } = await dbApiClient.get<NotebookPreset[]>("user-nb-presets");

  return data;
}

export const getPresetsQueryOptions = () => {
  return queryOptions({
    queryKey: ["presets"],
    queryFn: () => getNotebookPresets(),
  });
};

type UsePresetsOptions = {
  queryConfig?: QueryConfig<typeof getPresetsQueryOptions>;
};

export const usePresets = ({ queryConfig }: UsePresetsOptions = {}) => {
  return useQuery({
    ...getPresetsQueryOptions(),
    ...queryConfig,
  });
};
