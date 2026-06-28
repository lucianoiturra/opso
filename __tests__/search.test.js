import { describe, expect, it } from "vitest";
import { normalize, parseQuery, search, tokenize } from "../src/search.js";

const items = [
  {
    id: "1",
    name: "Canto - La fuerza que nos mueve.pptx",
    path: "OPSO / 2024 / PPT",
    type: "presentacion",
  },
  {
    id: "2",
    name: "Logo OPSO.png",
    path: "OPSO / Marca",
    type: "imagen",
  },
  {
    id: "3",
    name: "La fuerza que nos mueve (audio).mp3",
    path: "OPSO / 2024 / Audios",
    type: "audio",
  },
  {
    id: "4",
    name: "Acta reunion.docx",
    path: "OPSO / Documentos",
    type: "documento",
  },
];

describe("normalize", () => {
  it("lowercases and strips accents and punctuation", () => {
    expect(normalize("Canción, ¡La Fuerza!")).toBe("cancion la fuerza");
  });
});

describe("tokenize", () => {
  it("splits into normalized words", () => {
    expect(tokenize("  La  Fuerza ")).toEqual(["la", "fuerza"]);
  });
});

describe("parseQuery", () => {
  it("separates a type keyword from text tokens", () => {
    expect(parseQuery("ppt canto la fuerza")).toEqual({
      typeFilter: "presentacion",
      textTokens: ["canto", "la", "fuerza"],
    });
  });

  it("handles a bare type keyword", () => {
    expect(parseQuery("logo")).toEqual({ typeFilter: "imagen", textTokens: [] });
  });

  it("no type keyword yields null filter", () => {
    expect(parseQuery("la fuerza que nos mueve")).toEqual({
      typeFilter: null,
      textTokens: ["la", "fuerza", "que", "nos", "mueve"],
    });
  });
});

describe("search", () => {
  it("returns [] for empty query and no filter", () => {
    expect(search(items, "")).toEqual([]);
  });

  it("finds across name and path with all tokens required", () => {
    const result = search(items, "fuerza que nos mueve");
    expect(result.map((item) => item.id)).toContain("1");
    expect(result.map((item) => item.id)).toContain("3");
    expect(result.map((item) => item.id)).not.toContain("2");
  });

  it("type keyword in query constrains results", () => {
    const result = search(items, "ppt la fuerza que nos mueve");
    expect(result.map((item) => item.id)).toEqual(["1"]);
  });

  it("type chip via opts constrains results", () => {
    const result = search(items, "la fuerza que nos mueve", { typeFilter: "audio" });
    expect(result.map((item) => item.id)).toEqual(["3"]);
  });

  it("returns [] when chip and query type disagree", () => {
    expect(search(items, "pdf la fuerza", { typeFilter: "audio" })).toEqual([]);
  });

  it("tolerates a small typo", () => {
    const result = search(items, "fuersa que nos mueve");
    expect(result.map((item) => item.id)).toContain("1");
  });

  it("a bare type keyword lists that type", () => {
    const result = search(items, "logo");
    expect(result.map((item) => item.id)).toContain("2");
  });
});
