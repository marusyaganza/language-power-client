// The vocabulary page's view (search, page, sort) as URL search params, so it survives reloads and links.
import type { SortOrder, VocabularySortBy } from "../schemas";

export interface VocabularyView {
  query: string;
  page: number;
  sortBy: VocabularySortBy;
  sortOrder: SortOrder;
}

// Each field starts in its natural direction.
export const DEFAULT_SORT_ORDER: Record<VocabularySortBy, SortOrder> = { created_at: "desc", name: "asc" };
const DEFAULT_SORT_BY: VocabularySortBy = "created_at";

const isSortBy = (v: string | null): v is VocabularySortBy => v === "created_at" || v === "name";
const isSortOrder = (v: string | null): v is SortOrder => v === "asc" || v === "desc";

/** Reads the view from the URL; missing or invalid values fall back to defaults. */
export function parseVocabularyView(params: URLSearchParams): VocabularyView {
  const sortParam = params.get("sort");
  const orderParam = params.get("order");
  const sortBy = isSortBy(sortParam) ? sortParam : DEFAULT_SORT_BY;
  const page = Number(params.get("page"));
  return {
    query: params.get("q") ?? "",
    page: Number.isInteger(page) && page >= 1 ? page : 1,
    sortBy,
    sortOrder: isSortOrder(orderParam) ? orderParam : DEFAULT_SORT_ORDER[sortBy],
  };
}

/** Writes the view to URL params, leaving out defaults to keep links short. */
export function vocabularyViewToParams(view: VocabularyView): URLSearchParams {
  const params = new URLSearchParams();
  if (view.query) params.set("q", view.query);
  if (view.page !== 1) params.set("page", String(view.page));
  if (view.sortBy !== DEFAULT_SORT_BY) params.set("sort", view.sortBy);
  if (view.sortOrder !== DEFAULT_SORT_ORDER[view.sortBy]) params.set("order", view.sortOrder);
  return params;
}

/** Applies a change; changing the search or sorting goes back to the first page. */
export function updateVocabularyView(view: VocabularyView, change: Partial<VocabularyView>): VocabularyView {
  const next = { ...view, ...change };
  const resetsPage =
    (change.query !== undefined && change.query !== view.query) ||
    (change.sortBy !== undefined && change.sortBy !== view.sortBy) ||
    (change.sortOrder !== undefined && change.sortOrder !== view.sortOrder);
  return resetsPage && change.page === undefined ? { ...next, page: 1 } : next;
}
