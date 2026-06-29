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
    normalizedWords: tokenize(`${item.name} ${item.path}`),
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

function fuzzyScoreForToken(words, token) {
  const wordFuse = new Fuse(
    words.map((word) => ({ word })),
    {
      keys: ["word"],
      includeScore: true,
      threshold: 0.22,
      ignoreLocation: true,
    },
  );

  const best = wordFuse.search(token)[0];
  return best?.score ?? null;
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
  const queryText = textTokens.join(" ");
  const matches = preparedItems
    .map((item) => {
      let fuzzyScore = 0;

      for (const token of textTokens) {
        if (item.normalizedText.includes(token)) {
          continue;
        }

        const tokenScore = fuzzyScoreForToken(item.normalizedWords, token);
        if (tokenScore === null) {
          return null;
        }

        fuzzyScore += tokenScore;
      }

      return {
        ...item,
        fuzzyScore,
        tokensInName: textTokens.every((token) => item.normalizedName.includes(token)),
      };
    })
    .filter(Boolean);

  return sortMatches(matches, queryText).map(
    ({ normalizedName, normalizedPath, normalizedText, normalizedWords, fuzzyScore, tokensInName, ...item }) => item,
  );
}
