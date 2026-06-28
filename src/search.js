import Fuse from "fuse.js";
import { typeFromKeyword } from "../sync/classify.js";

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

function buildNeedle(item) {
  return {
    ...item,
    normalizedName: normalize(item.name),
    normalizedPath: normalize(item.path),
    normalizedText: normalize(`${item.name} ${item.path}`),
  };
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

function rankMatch(item, queryText) {
  if (item.normalizedName === queryText) {
    return 0;
  }

  if (queryText && item.normalizedName.includes(queryText)) {
    return 1;
  }

  return item.tokensInName ? 2 : 3;
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

  const scopedItems = effectiveType
    ? items.filter((item) => item.type === effectiveType)
    : items.slice();

  if (textTokens.length === 0) {
    return scopedItems;
  }

  const preparedItems = scopedItems.map(buildNeedle);
  const byId = new Map(preparedItems.map((item) => [item.id, item]));
  const fuse = new Fuse(preparedItems, {
    keys: ["normalizedText"],
    includeScore: true,
    threshold: 0.4,
    ignoreLocation: true,
  });

  let candidateIds = null;
  const fuzzyScores = new Map();

  for (const token of textTokens) {
    const results = fuse.search(token);
    const tokenIds = new Set();

    for (const result of results) {
      tokenIds.add(result.item.id);
      const previous = fuzzyScores.get(result.item.id) ?? 0;
      fuzzyScores.set(result.item.id, previous + (result.score ?? 0));
    }

    candidateIds =
      candidateIds === null
        ? tokenIds
        : new Set([...candidateIds].filter((id) => tokenIds.has(id)));

    if (candidateIds.size === 0) {
      return [];
    }
  }

  const queryText = textTokens.join(" ");
  const matches = [...candidateIds].map((id) => {
    const item = byId.get(id);
    return {
      ...item,
      fuzzyScore: fuzzyScores.get(id) ?? Number.POSITIVE_INFINITY,
      tokensInName: textTokens.every((token) => item.normalizedName.includes(token)),
    };
  });

  return sortMatches(matches, queryText).map(
    ({ normalizedName, normalizedPath, normalizedText, fuzzyScore, tokensInName, ...item }) => item,
  );
}
