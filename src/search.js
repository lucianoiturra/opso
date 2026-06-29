import Fuse from "fuse.js";
import { typeFromKeyword } from "../sync/classify.js";

const SEARCH_CACHE = new WeakMap();

export function normalize(value) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function tokenize(query) {
  const normalized = normalize(query);
  return normalized ? normalized.split(/\s+/) : [];
}

export function parseQuery(query) {
  const tokens = tokenize(query);
  const textTokens = [];
  let typeFilter = null;

  for (const token of tokens) {
    const tokenType = typeFromKeyword(token);
    if (tokenType && typeFilter === null) {
      typeFilter = tokenType;
      continue;
    }

    if (tokenType && tokenType === typeFilter) {
      continue;
    }

    textTokens.push(token);
  }

  return { typeFilter, textTokens };
}

function buildPreparedItem(item) {
  return {
    ...item,
    normalizedName: normalize(item.name),
    normalizedPath: normalize(item.path),
    normalizedText: normalize(`${item.name} ${item.path}`),
  };
}

function buildScope(preparedItems) {
  return {
    preparedItems,
    fuse: new Fuse(preparedItems, {
      keys: ["normalizedName", "normalizedPath", "normalizedText"],
      includeScore: true,
      threshold: 0.24,
      ignoreLocation: true,
      minMatchCharLength: 2,
    }),
  };
}

function getSearchContext(items) {
  let cached = SEARCH_CACHE.get(items);
  if (cached) {
    return cached;
  }

  const preparedItems = items.map(buildPreparedItem);
  const scopes = new Map();
  const rootScope = buildScope(preparedItems);
  scopes.set("__all__", rootScope);

  cached = { preparedItems, scopes };
  SEARCH_CACHE.set(items, cached);
  return cached;
}

function getScope(searchContext, effectiveType) {
  const scopeKey = effectiveType ?? "__all__";
  const existingScope = searchContext.scopes.get(scopeKey);
  if (existingScope) {
    return existingScope;
  }

  const scopedItems = searchContext.preparedItems.filter((item) => item.type === effectiveType);
  const nextScope = buildScope(scopedItems);
  searchContext.scopes.set(scopeKey, nextScope);
  return nextScope;
}

function rankMatch(item, queryText) {
  if (item.normalizedName === queryText) {
    return 0;
  }

  if (queryText && item.normalizedName.includes(queryText)) {
    return 1;
  }

  return item.tokensInName ? 2 : 3;
}

function sortMatches(matches, queryText) {
  return matches.sort((left, right) => {
    const leftRank = rankMatch(left, queryText);
    const rightRank = rankMatch(right, queryText);

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    if (left.fuzzyScore !== right.fuzzyScore) {
      return left.fuzzyScore - right.fuzzyScore;
    }

    return left.name.localeCompare(right.name, "es");
  });
}

export function search(items, query, options = {}) {
  const { typeFilter: chipFilter = null } = options;
  const { typeFilter: queryFilter, textTokens } = parseQuery(query);

  if (chipFilter && queryFilter && chipFilter !== queryFilter) {
    return [];
  }

  const effectiveType = chipFilter ?? queryFilter;
  if (textTokens.length === 0 && !effectiveType) {
    return [];
  }

  const searchContext = getSearchContext(items);
  const scope = getScope(searchContext, effectiveType);

  if (textTokens.length === 0) {
    return scope.preparedItems.map(({ normalizedName, normalizedPath, normalizedText, ...item }) => item);
  }

  const matchesById = new Map();
  const candidateIds = new Set(scope.preparedItems.map((item) => item.id));

  for (const token of textTokens) {
    const tokenMatches = new Map();
    const fuzzyResults = scope.fuse.search(token);

    for (const result of fuzzyResults) {
      tokenMatches.set(result.item.id, result.score ?? 0);
      if (!matchesById.has(result.item.id)) {
        matchesById.set(result.item.id, { ...result.item, fuzzyScore: 0 });
      }
    }

    for (const item of scope.preparedItems) {
      if (!item.normalizedText.includes(token)) {
        continue;
      }

      tokenMatches.set(item.id, Math.min(tokenMatches.get(item.id) ?? 0, 0));
      if (!matchesById.has(item.id)) {
        matchesById.set(item.id, { ...item, fuzzyScore: 0 });
      }
    }

    for (const candidateId of [...candidateIds]) {
      if (!tokenMatches.has(candidateId)) {
        candidateIds.delete(candidateId);
      }
    }

    for (const [itemId, score] of tokenMatches.entries()) {
      if (!candidateIds.has(itemId)) {
        continue;
      }

      const existingMatch = matchesById.get(itemId);
      existingMatch.fuzzyScore += score;
    }
  }

  const queryText = textTokens.join(" ");
  const matches = [...candidateIds]
    .map((itemId) => matchesById.get(itemId))
    .filter(Boolean)
    .map((item) => ({
      ...item,
      tokensInName: textTokens.every((token) => item.normalizedName.includes(token)),
    }));

  return sortMatches(matches, queryText).map(
    ({ normalizedName, normalizedPath, normalizedText, fuzzyScore, tokensInName, ...item }) => item,
  );
}
