import { describe, expect, it } from "vitest";
import { vi } from "vitest";
import en from "@/messages/en.json";
import ptBr from "@/messages/pt-BR.json";
import requestConfig from "@/i18n/request";
import { routing } from "@/i18n/routing";

vi.mock("next-intl/server", () => ({
  getRequestConfig: (handler: unknown) => handler,
}));

describe("i18n routing", () => {
  it("defines both supported locales with English as the default", () => {
    expect(routing.locales).toEqual(["en", "pt-BR"]);
    expect(routing.defaultLocale).toBe("en");
    expect(routing.localePrefix).toBe("always");
  });

  it.each([
    ["en", en],
    ["pt-BR", ptBr],
  ])("loads messages for %s", async (locale, messages) => {
    const config = await requestConfig({
      requestLocale: Promise.resolve(locale),
    });

    expect(config.locale).toBe(locale);
    expect(config.messages).toEqual(messages);
  });

  it.each([["fr"], [undefined]])(
    "falls back to the default locale for %s",
    async (locale) => {
      const config = await requestConfig({
        requestLocale: Promise.resolve(locale),
      });

      expect(config.locale).toBe(routing.defaultLocale);
      expect(config.messages).toEqual(en);
    }
  );
});
