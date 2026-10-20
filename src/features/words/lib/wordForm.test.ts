import { describe, expect, it } from "vitest";
import type { Word } from "../schemas";
import {
  cleanExamples,
  emptyWordForm,
  isOptionalUrl,
  orderDefs,
  toWordCreate,
  toWordUpdate,
  wordFormValidation,
  wordToFormValues,
  type WordFormValues,
} from "./wordForm";

const word: Word = {
  id: 7,
  uuid: null,
  name: "ballena",
  language: "es",
  stems: [],
  defs: ["whale", "big person"],
  fl: "noun",
  audio_url: null,
  transcription: "ba'ʎena",
  img_url: "https://img/whale.png",
  img_desc: "A blue whale",
  examples: [{ text: "La ballena azul.", translation: null }],
  saved: true,
};

describe("orderDefs", () => {
  it("puts the main definition first and keeps the rest in order", () => {
    expect(orderDefs(["a", "b", "c"], 2)).toEqual(["c", "a", "b"]);
  });

  it("trims and drops blank definitions, including a blank main one", () => {
    expect(orderDefs([" a ", "  ", "b"], 1)).toEqual(["a", "b"]);
  });
});

describe("cleanExamples", () => {
  it("trims, drops blank examples and turns empty translations into null", () => {
    expect(
      cleanExamples(
        [
          { text: " Hola ", translation: " Hi " },
          { text: "   ", translation: "ignored" },
          { text: "Adiós", translation: "" },
        ],
        true,
      ),
    ).toEqual([
      { text: "Hola", translation: "Hi" },
      { text: "Adiós", translation: null },
    ]);
  });

  it("drops translations when they're hidden", () => {
    expect(cleanExamples([{ text: "Hello", translation: "stale" }], false)).toEqual([
      { text: "Hello", translation: null },
    ]);
  });
});

describe("toWordCreate", () => {
  it("builds a WordCreate from the form", () => {
    const values: WordFormValues = {
      ...emptyWordForm(),
      name: " gato ",
      fl: "noun",
      defs: ["", "cat", "tomcat"],
      mainDefIndex: 2,
      examples: [{ text: "El gato.", translation: "The cat." }],
      imgUrl: "  ",
    };

    expect(toWordCreate(values, "es")).toEqual({
      uuid: null,
      name: "gato",
      language: "es",
      stems: [],
      fl: "noun",
      transcription: null,
      defs: ["tomcat", "cat"],
      examples: [{ text: "El gato.", translation: "The cat." }],
      audio_url: null,
      img_url: null,
      img_desc: null,
    });
  });
});

describe("wordToFormValues / toWordUpdate", () => {
  it("round-trips an unchanged word", () => {
    expect(toWordUpdate(wordToFormValues(word), word.language)).toEqual({
      defs: ["whale", "big person"],
      examples: [{ text: "La ballena azul.", translation: null }],
      audio_url: null,
      img_url: "https://img/whale.png",
      img_desc: "A blue whale",
    });
  });

  it("applies a new main definition", () => {
    const values = { ...wordToFormValues(word), mainDefIndex: 1 };
    expect(toWordUpdate(values, "es").defs).toEqual(["big person", "whale"]);
  });
});

describe("wordFormValidation", () => {
  it("requires name and part of speech only when creating", () => {
    expect(wordFormValidation("create").name("  ")).toBe("Enter the word");
    expect(wordFormValidation("create").fl(null)).toBe("Choose a part of speech");
    expect(wordFormValidation("edit").name("")).toBeNull();
    expect(wordFormValidation("edit").fl(null)).toBeNull();
  });

  it("requires at least one non-blank definition", () => {
    expect(wordFormValidation("edit").defs(["", "  "])).toBe("Add at least one definition");
    expect(wordFormValidation("edit").defs(["", "ok"])).toBeNull();
  });
});

describe("isOptionalUrl", () => {
  it("accepts blank and http(s) links", () => {
    expect(isOptionalUrl("")).toBe(true);
    expect(isOptionalUrl("  ")).toBe(true);
    expect(isOptionalUrl("https://media.merriam-webster.com/audio/hola.mp3")).toBe(true);
    expect(isOptionalUrl(" http://img.test/cat.png ")).toBe(true);
  });

  it("rejects text, relative paths and other schemes", () => {
    expect(isOptionalUrl("cat.png")).toBe(false);
    expect(isOptionalUrl("www.img.test/cat.png")).toBe(false);
    expect(isOptionalUrl("/images/cat.png")).toBe(false);
    expect(isOptionalUrl("javascript:alert(1)")).toBe(false);
    expect(isOptionalUrl("ftp://files.test/cat.png")).toBe(false);
  });
});
